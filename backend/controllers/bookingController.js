// backend/controllers/bookingController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate unique booking number
const generateBookingNumber = () => {
  const prefix = 'BK';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Map event type string to enum
const mapEventType = (type) => {
  const typeMap = {
    'wedding': 'WEDDING',
    'birthday': 'BIRTHDAY',
    'funeral': 'FUNERAL',
    'graduation': 'GRADUATION',
    'corporate': 'CORPORATE',
    'dote': 'DOTE',
    'other': 'OTHER'
  };
  return typeMap[type] || 'OTHER';
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      eventType,
      eventDate,
      eventLocation,
      guestCount,
      budget,
      notes,
      package: packageName,
      weddingParts,
      startTime,
      endTime,
      district,
      services,
      name,
      email,
      phone
    } = req.body;

    // Validation
    if (!eventType || !eventDate || !eventLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event type, date and location'
      });
    }

    // Process wedding parts and services (could be arrays or JSON strings)
    let processedWeddingParts = weddingParts;
    let processedServices = services;
    
    if (weddingParts && typeof weddingParts === 'string') {
      try {
        processedWeddingParts = JSON.parse(weddingParts);
      } catch (e) {
        processedWeddingParts = weddingParts.split(',').map(s => s.trim());
      }
    }
    
    if (services && typeof services === 'string') {
      try {
        processedServices = JSON.parse(services);
      } catch (e) {
        processedServices = services.split(',').map(s => s.trim());
      }
    }

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        userId: req.user.id,
        eventType: mapEventType(eventType),
        eventDate: new Date(eventDate),
        eventLocation,
        guestCount: guestCount ? parseInt(guestCount) : null,
        budget: budget ? parseFloat(budget) : null,
        notes: notes || '',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        // New fields
        package: packageName || null,
        startTime: startTime || null,
        endTime: endTime || null,
        district: district || null,
        services: processedServices ? JSON.stringify(processedServices) : null,
        weddingParts: processedWeddingParts ? JSON.stringify(processedWeddingParts) : null,
        // Store client contact info (user already has this, but storing here for reference)
      }
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'BOOKING',
        title: 'New Booking Created',
        message: `Booking #${booking.bookingNumber} created for ${eventType}`,
        relatedId: booking.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        ...booking,
        weddingParts: processedWeddingParts,
        services: processedServices,
        name: req.user.name || name,
        email: req.user.email || email,
        phone: req.user.phone || phone
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during booking creation'
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format bookings with parsed JSON fields
    const formattedBookings = bookings.map(b => ({
      ...b,
      weddingParts: b.weddingParts ? JSON.parse(b.weddingParts) : [],
      services: b.services ? JSON.parse(b.services) : [],
      name: b.user?.name,
      email: b.user?.email,
      phone: b.user?.phone
    }));

    res.json({
      success: true,
      count: formattedBookings.length,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookings'
    });
  }
};

// @desc    Get user's own bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Format bookings with parsed JSON fields
    const formattedBookings = bookings.map(b => ({
      ...b,
      weddingParts: b.weddingParts ? JSON.parse(b.weddingParts) : [],
      services: b.services ? JSON.parse(b.services) : [],
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    }));

    res.json({
      success: true,
      count: formattedBookings.length,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookings'
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Owner/Admin)
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const isOwner = booking.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Format booking with parsed JSON fields
    const formattedBooking = {
      ...booking,
      weddingParts: booking.weddingParts ? JSON.parse(booking.weddingParts) : [],
      services: booking.services ? JSON.parse(booking.services) : [],
      name: booking.user?.name,
      email: booking.user?.email,
      phone: booking.user?.phone
    };

    res.json({
      success: true,
      booking: formattedBooking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching booking'
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private (Owner/Admin)
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);
    const {
      eventDate,
      eventLocation,
      guestCount,
      budget,
      notes,
      package: packageName,
      startTime,
      endTime,
      district,
      services,
      weddingParts
    } = req.body;

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isOwner = existingBooking.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Process JSON fields
    let processedWeddingParts = weddingParts;
    let processedServices = services;
    
    if (weddingParts && typeof weddingParts === 'string') {
      try {
        processedWeddingParts = JSON.parse(weddingParts);
      } catch (e) {
        processedWeddingParts = weddingParts.split(',').map(s => s.trim());
      }
    }
    
    if (services && typeof services === 'string') {
      try {
        processedServices = JSON.parse(services);
      } catch (e) {
        processedServices = services.split(',').map(s => s.trim());
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        eventDate: eventDate ? new Date(eventDate) : undefined,
        eventLocation: eventLocation || undefined,
        guestCount: guestCount ? parseInt(guestCount) : undefined,
        budget: budget ? parseFloat(budget) : undefined,
        notes: notes || undefined,
        package: packageName || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        district: district || undefined,
        services: processedServices ? JSON.stringify(processedServices) : undefined,
        weddingParts: processedWeddingParts ? JSON.stringify(processedWeddingParts) : undefined
      }
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: {
        ...updatedBooking,
        weddingParts: processedWeddingParts,
        services: processedServices
      }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking'
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Owner/Admin)
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isOwner = existingBooking.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    });

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting booking'
    });
  }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);
    const { status, totalAmount } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const updateData = { status };
    if (totalAmount) {
      updateData.totalAmount = parseFloat(totalAmount);
      updateData.paymentStatus = 'PENDING';
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: existingBooking.userId,
        type: 'BOOKING',
        title: `Booking ${status.toLowerCase()}`,
        message: `Your booking #${updatedBooking.bookingNumber} has been ${status.toLowerCase()}`,
        relatedId: updatedBooking.id
      }
    });

    res.json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking status'
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus
};