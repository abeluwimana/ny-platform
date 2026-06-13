// backend/controllers/supportController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: Calculate 60/40 split
const calculateSplit = (amount) => {
  return {
    coupleAmount: amount * 0.6,
    platformAmount: amount * 0.4
  };
};

// @desc    Support a couple (Client only)
// @route   POST /api/support
// @access  Private (Client only)
const supportCouple = async (req, res) => {
  try {
    const { coupleId, amount, videoId, message, paymentMethod } = req.body;

    // Validation
    if (!coupleId || !amount || amount < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Please provide couple ID and amount (minimum 1000 RWF)'
      });
    }

    // Check if user is CLIENT
    if (req.user.role !== 'CLIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can support couples'
      });
    }

    // Get couple details
    const couple = await prisma.coupleProfile.findUnique({
      where: { id: parseInt(coupleId) },
      include: { user: true }
    });

    if (!couple) {
      return res.status(404).json({
        success: false,
        message: 'Couple not found'
      });
    }

    const { coupleAmount, platformAmount } = calculateSplit(amount);

    // Create support record
    const support = await prisma.support.create({
      data: {
        amount,
        coupleAmount,
        platformAmount,
        message: message || '',
        paymentMethod: paymentMethod || 'MTN_MOMO',
        userId: req.user.id,
        coupleId: parseInt(coupleId),
        videoId: videoId ? parseInt(videoId) : null,
        status: 'COMPLETED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        couple: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Update couple's total support
    await prisma.coupleProfile.update({
      where: { id: parseInt(coupleId) },
      data: {
        totalSupport: { increment: coupleAmount }
      }
    });

    // Create notification for couple
    await prisma.notification.create({
      data: {
        userId: couple.userId,
        type: 'SUPPORT',
        message: `${req.user.name} supported you with ${amount.toLocaleString()} RWF! You receive ${coupleAmount.toLocaleString()} RWF.`,
        relatedId: support.id
      }
    });

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'PAYMENT',
        message: `You successfully supported ${couple.user.name} with ${amount.toLocaleString()} RWF. Thank you!`,
        relatedId: support.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Support completed successfully',
      support: {
        id: support.id,
        amount: support.amount,
        coupleAmount: coupleAmount,
        platformAmount: platformAmount,
        coupleName: couple.user.name,
        date: support.createdAt
      }
    });
  } catch (error) {
    console.error('Support couple error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing support'
    });
  }
};

// @desc    Get my support history (Client)
// @route   GET /api/support/my
// @access  Private
const getMySupportHistory = async (req, res) => {
  try {
    const supports = await prisma.support.findMany({
      where: { userId: req.user.id },
      include: {
        couple: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        video: {
          select: {
            id: true,
            title: true,
            thumbnail: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalGiven = supports.reduce((sum, s) => sum + s.amount, 0);

    res.json({
      success: true,
      count: supports.length,
      totalGiven,
      supports
    });
  } catch (error) {
    console.error('Get support history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching support history'
    });
  }
};

// @desc    Get earnings for a couple (Couple only)
// @route   GET /api/support/earnings
// @access  Private (Couple only)
const getCoupleEarnings = async (req, res) => {
  try {
    // Get couple profile for logged-in user
    const couple = await prisma.coupleProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!couple) {
      return res.status(404).json({
        success: false,
        message: 'Couple profile not found'
      });
    }

    const supports = await prisma.support.findMany({
      where: { coupleId: couple.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        video: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalEarned = supports.reduce((sum, s) => sum + s.coupleAmount, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = supports
      .filter(s => {
        const date = new Date(s.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + s.coupleAmount, 0);

    // Group supporters
    const supporters = {};
    supports.forEach(s => {
      if (!supporters[s.user.email]) {
        supporters[s.user.email] = {
          name: s.user.name,
          email: s.user.email,
          totalAmount: 0,
          count: 0
        };
      }
      supporters[s.user.email].totalAmount += s.coupleAmount;
      supporters[s.user.email].count++;
    });

    res.json({
      success: true,
      earnings: {
        total: totalEarned,
        monthly: monthlyEarnings,
        supporterCount: Object.keys(supporters).length,
        supporters: Object.values(supporters).sort((a, b) => b.totalAmount - a.totalAmount),
        recentSupports: supports.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get couple earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching earnings'
    });
  }
};

// @desc    Get top supported couples
// @route   GET /api/support/top-couples
// @access  Public
const getTopSupportedCouples = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topCouples = await prisma.coupleProfile.findMany({
      where: {
        totalSupport: { gt: 0 }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { totalSupport: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      count: topCouples.length,
      couples: topCouples
    });
  } catch (error) {
    console.error('Get top couples error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching top couples'
    });
  }
};

// @desc    Get support statistics (Admin only)
// @route   GET /api/support/stats
// @access  Private/Admin
const getSupportStats = async (req, res) => {
  try {
    const allSupports = await prisma.support.findMany();

    const totalRevenue = allSupports.reduce((sum, s) => sum + s.amount, 0);
    const totalCoupleShare = allSupports.reduce((sum, s) => sum + s.coupleAmount, 0);
    const totalPlatformShare = allSupports.reduce((sum, s) => sum + s.platformAmount, 0);
    const totalSupporters = [...new Set(allSupports.map(s => s.userId))].length;
    const totalSupportedCouples = [...new Set(allSupports.map(s => s.coupleId))].length;

    // Monthly breakdown
    const monthlyData = {};
    allSupports.forEach(s => {
      const month = new Date(s.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, coupleShare: 0, platformShare: 0, count: 0 };
      }
      monthlyData[month].total += s.amount;
      monthlyData[month].coupleShare += s.coupleAmount;
      monthlyData[month].platformShare += s.platformAmount;
      monthlyData[month].count++;
    });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalCoupleShare,
        totalPlatformShare,
        totalSupporters,
        totalSupportedCouples,
        totalTransactions: allSupports.length,
        monthlyBreakdown: monthlyData
      }
    });
  } catch (error) {
    console.error('Get support stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching support stats'
    });
  }
};

// @desc    Get single support by ID
// @route   GET /api/support/:id
// @access  Private (Owner/Admin)
const getSupportById = async (req, res) => {
  try {
    const { id } = req.params;
    const support = await prisma.support.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        couple: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        video: true
      }
    });

    if (!support) {
      return res.status(404).json({
        success: false,
        message: 'Support record not found'
      });
    }

    // Check permissions
    const isOwner = support.userId === req.user.id;
    const isCouple = support.couple.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isCouple && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      support
    });
  } catch (error) {
    console.error('Get support error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching support record'
    });
  }
};

module.exports = {
  supportCouple,
  getMySupportHistory,
  getCoupleEarnings,
  getTopSupportedCouples,
  getSupportStats,
  getSupportById
};