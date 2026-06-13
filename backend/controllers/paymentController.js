// backend/controllers/paymentController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to generate unique transaction ID
const generateTransactionId = () => {
  const prefix = 'TXN';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

// Helper to validate phone number (Rwanda format)
// MTN: 078xxxxxxxx or 079xxxxxxxx
// Airtel: 072xxxxxxxx or 073xxxxxxxx
const validatePhoneNumber = (phone) => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // MTN Rwanda: 078 or 079 followed by 7 digits (total 10 digits)
  const mtnPattern = /^(078|079)\d{7}$/;
  
  // Airtel Rwanda: 072 or 073 followed by 7 digits (total 10 digits)
  const airtelPattern = /^(072|073)\d{7}$/;
  
  let provider = null;
  let isValid = false;
  
  if (mtnPattern.test(cleaned)) {
    provider = 'MTN';
    isValid = true;
  } else if (airtelPattern.test(cleaned)) {
    provider = 'AIRTEL';
    isValid = true;
  }
  
  return { 
    isValid, 
    cleaned,
    provider 
  };
};

// Mock payment processing (replace with actual API later)
const processMobileMoneyPayment = async (phoneNumber, amount, provider) => {
  // Simulate payment processing
  return new Promise((resolve) => {
    setTimeout(() => {
      // 95% success rate for simulation
      const success = Math.random() < 0.95;
      if (success) {
        resolve({
          success: true,
          transactionId: generateTransactionId(),
          message: `Payment of ${amount.toLocaleString()} RWF processed successfully via ${provider}`
        });
      } else {
        resolve({
          success: false,
          message: 'Payment failed. Please try again.'
        });
      }
    }, 1500);
  });
};

// @desc    Process booking payment
// @route   POST /api/payments/booking
// @access  Private (Client)
const processBookingPayment = async (req, res) => {
  try {
    const { bookingId, phoneNumber, paymentMethod } = req.body;
    const prisma = req.prisma;

    if (!bookingId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide booking ID and phone number'
      });
    }

    // Validate phone number
    const { isValid, cleaned, provider } = validatePhoneNumber(phoneNumber);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Use MTN (078/079) or Airtel (072/073) format'
      });
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { user: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to user
    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Booking already paid'
      });
    }

    const amount = booking.totalAmount || 0;
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No price set for this booking. Please contact admin.'
      });
    }

    const providerName = provider === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money';

    // Process payment
    const paymentResult = await processMobileMoneyPayment(cleaned, amount, providerName);

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.message
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        transactionId: paymentResult.transactionId,
        amount,
        method: paymentMethod,
        status: 'COMPLETED',
        userId: req.user.id,
        bookingId: booking.id
      }
    });

    // Update booking payment status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED'
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'PAYMENT',
        message: `Payment of ${amount.toLocaleString()} RWF for booking #${booking.bookingNumber} was successful.`,
        relatedId: payment.id
      }
    });

    res.json({
      success: true,
      message: 'Payment successful! Your booking is confirmed.',
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        date: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Booking payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing payment'
    });
  }
};

// @desc    Process couple support payment
// @route   POST /api/payments/support
// @access  Private (Client)
const processSupportPayment = async (req, res) => {
  try {
    const { supportId, phoneNumber, paymentMethod } = req.body;
    const prisma = req.prisma;

    if (!supportId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide support ID and phone number'
      });
    }

    // Validate phone number
    const { isValid, cleaned, provider } = validatePhoneNumber(phoneNumber);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Use MTN (078/079) or Airtel (072/073) format'
      });
    }

    // Get support record
    const support = await prisma.support.findUnique({
      where: { id: parseInt(supportId) },
      include: { couple: { include: { user: true } } }
    });

    if (!support) {
      return res.status(404).json({
        success: false,
        message: 'Support record not found'
      });
    }

    // Check if already paid
    const existingPayment = await prisma.payment.findFirst({
      where: { supportId: support.id }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Support already paid'
      });
    }

    const amount = support.amount;
    const providerName = provider === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money';

    // Process payment
    const paymentResult = await processMobileMoneyPayment(cleaned, amount, providerName);

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.message
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        transactionId: paymentResult.transactionId,
        amount,
        method: paymentMethod,
        status: 'COMPLETED',
        userId: req.user.id,
        supportId: support.id
      }
    });

    // Update support status
    await prisma.support.update({
      where: { id: support.id },
      data: { status: 'COMPLETED' }
    });

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'PAYMENT',
        message: `Your support payment of ${amount.toLocaleString()} RWF to ${support.couple.user.name} was successful.`,
        relatedId: payment.id
      }
    });

    // Create notification for couple
    await prisma.notification.create({
      data: {
        userId: support.couple.userId,
        type: 'SUPPORT',
        message: `${req.user.name} supported you with ${amount.toLocaleString()} RWF! Payment successful.`,
        relatedId: payment.id
      }
    });

    res.json({
      success: true,
      message: 'Support payment successful! Thank you for supporting.',
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        date: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Support payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing support payment'
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my
// @access  Private
const getMyPayments = async (req, res) => {
  try {
    const prisma = req.prisma;

    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            eventType: true,
            eventDate: true
          }
        },
        support: {
          include: {
            couple: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      count: payments.length,
      totalSpent,
      payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment history'
    });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private (Owner/Admin)
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        booking: true,
        support: {
          include: {
            couple: {
              include: {
                user: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check permissions
    const isOwner = payment.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment'
    });
  }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const prisma = req.prisma;

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booking: true,
        support: {
          include: {
            couple: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      count: payments.length,
      totalRevenue,
      payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
};

// @desc    Get payment statistics (Admin only)
// @route   GET /api/payments/stats
// @access  Private/Admin
const getPaymentStats = async (req, res) => {
  try {
    const prisma = req.prisma;

    const payments = await prisma.payment.findMany();

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const failedPayments = payments.filter(p => p.status === 'FAILED');

    // Group by method
    const byMethod = {
      MTN_MOMO: payments.filter(p => p.method === 'MTN_MOMO').reduce((sum, p) => sum + p.amount, 0),
      AIRTEL_MONEY: payments.filter(p => p.method === 'AIRTEL_MONEY').reduce((sum, p) => sum + p.amount, 0)
    };

    // Monthly breakdown
    const monthlyData = {};
    payments.forEach(p => {
      const month = new Date(p.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += p.amount;
      monthlyData[month].count++;
    });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalTransactions: payments.length,
        completedCount: completedPayments.length,
        pendingCount: pendingPayments.length,
        failedCount: failedPayments.length,
        byMethod,
        monthlyBreakdown: monthlyData
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment stats'
    });
  }
};

module.exports = {
  processBookingPayment,
  processSupportPayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
  getPaymentStats
};