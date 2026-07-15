// backend/controllers/adminController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============ USER MANAGEMENT ============

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, limit = 50, page = 1 } = req.query;
    
    const where = {};
    if (role && role !== 'all') where.role = role.toUpperCase();
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await prisma.user.findMany({
      where,
      include: {
        clientProfile: true,
        coupleProfile: true,
        creatorProfile: true,
        adminProfile: true
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.user.count({ where });
    
    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        clientProfile: true,
        coupleProfile: true,
        creatorProfile: true,
        adminProfile: true,
        bookings: true,
        videos: true,
        posts: true,
        supports: true,
        payments: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['ADMIN', 'CLIENT', 'CREATOR', 'COUPLE'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });
    
    res.json({ success: true, message: 'User role updated', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Server error updating role' });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !user.isActive }
    });
    
    res.json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'}`,
      user: updated
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete related records first
    await prisma.booking.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.video.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.post.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.comment.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.support.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.payment.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.notification.deleteMany({ where: { userId: parseInt(id) } });
    
    await prisma.user.delete({ where: { id: parseInt(id) } });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

// ============ BOOKING MANAGEMENT ============

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const where = {};
    if (status && status !== 'all') where.status = status.toUpperCase();
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        creator: { select: { id: true, name: true, email: true } }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.booking.count({ where });
    
    res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, totalAmount } = req.body;
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const updateData = { status };
    if (totalAmount) updateData.totalAmount = parseFloat(totalAmount);
    
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    res.json({ success: true, message: 'Booking status updated', booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// ============ VIDEO MANAGEMENT ============

// @desc    Get all videos with filters
// @route   GET /api/admin/videos
// @access  Private/Admin
const getAllVideos = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const where = {};
    if (status && status !== 'all') where.status = status.toUpperCase();
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const videos = await prisma.video.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        couple: { include: { user: { select: { name: true } } } }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.video.count({ where });
    
    res.json({
      success: true,
      videos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching videos' });
  }
};

// @desc    Approve video
// @route   PUT /api/admin/videos/:id/approve
// @access  Private/Admin
const approveVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await prisma.video.update({
      where: { id: parseInt(id) },
      data: { status: 'APPROVED' }
    });
    
    // Create notification for creator
    await prisma.notification.create({
      data: {
        userId: video.userId,
        type: 'VIDEO_APPROVED',
        message: `Your video "${video.title}" has been approved and published!`,
        relatedId: video.id
      }
    });
    
    res.json({ success: true, message: 'Video approved', video });
  } catch (error) {
    console.error('Approve video error:', error);
    res.status(500).json({ success: false, message: 'Server error approving video' });
  }
};

// @desc    Reject video
// @route   PUT /api/admin/videos/:id/reject
// @access  Private/Admin
const rejectVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const video = await prisma.video.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' }
    });
    
    await prisma.notification.create({
      data: {
        userId: video.userId,
        type: 'VIDEO_REJECTED',
        message: `Your video "${video.title}" was rejected. Reason: ${reason || 'Please check content guidelines'}`,
        relatedId: video.id
      }
    });
    
    res.json({ success: true, message: 'Video rejected', video });
  } catch (error) {
    console.error('Reject video error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting video' });
  }
};

// @desc    Feature/unfeature video
// @route   PUT /api/admin/videos/:id/feature
// @access  Private/Admin
const featureVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await prisma.video.findUnique({ where: { id: parseInt(id) } });
    
    const updated = await prisma.video.update({
      where: { id: parseInt(id) },
      data: { isPremium: !video.isPremium }
    });
    
    res.json({
      success: true,
      message: updated.isPremium ? 'Video featured' : 'Video unfeatured',
      video: updated
    });
  } catch (error) {
    console.error('Feature video error:', error);
    res.status(500).json({ success: false, message: 'Server error featuring video' });
  }
};

// ============ SUPPORT MANAGEMENT ============

// @desc    Get all support transactions
// @route   GET /api/admin/supports
// @access  Private/Admin
const getAllSupports = async (req, res) => {
  try {
    const supports = await prisma.support.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        couple: { include: { user: { select: { name: true } } } },
        video: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const totalAmount = supports.reduce((sum, s) => sum + s.amount, 0);
    const totalCoupleShare = supports.reduce((sum, s) => sum + s.coupleAmount, 0);
    const totalPlatformShare = supports.reduce((sum, s) => sum + s.platformAmount, 0);
    
    res.json({
      success: true,
      summary: {
        totalTransactions: supports.length,
        totalAmount,
        totalCoupleShare,
        totalPlatformShare,
        uniqueSupporters: [...new Set(supports.map(s => s.userId))].length
      },
      supports
    });
  } catch (error) {
    console.error('Get all supports error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching supports' });
  }
};

// ============ PAYMENT MANAGEMENT ============

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        booking: { select: { bookingNumber: true } },
        support: { include: { couple: { include: { user: { select: { name: true } } } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    
    res.json({
      success: true,
      summary: {
        totalTransactions: payments.length,
        totalRevenue,
        completedCount: payments.filter(p => p.status === 'COMPLETED').length,
        pendingCount: payments.filter(p => p.status === 'PENDING').length,
        failedCount: payments.filter(p => p.status === 'FAILED').length
      },
      payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
};

// ============ POST MANAGEMENT ============

// @desc    Get all posts
// @route   GET /api/admin/posts
// @access  Private/Admin
const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching posts' });
  }
};

// @desc    Delete post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comment.deleteMany({ where: { postId: parseInt(id) } });
    await prisma.post.delete({ where: { id: parseInt(id) } });
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting post' });
  }
};

// ============ DASHBOARD OVERVIEW ============

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    const totalVideos = await prisma.video.count();
    const totalPosts = await prisma.post.count();
    const pendingVideos = await prisma.video.count({ where: { status: 'PENDING' } });
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    
    // Recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const recentVideos = await prisma.video.findMany({
      take: 5,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    // Revenue stats
    const supports = await prisma.support.findMany();
    const totalRevenue = supports.reduce((sum, s) => sum + s.amount, 0);
    const totalCoupleShare = supports.reduce((sum, s) => sum + s.coupleAmount, 0);
    const totalPlatformShare = supports.reduce((sum, s) => sum + s.platformAmount, 0);
    
    res.json({
      success: true,
      dashboard: {
        counts: {
          users: totalUsers,
          bookings: totalBookings,
          videos: totalVideos,
          posts: totalPosts,
          pendingVideos,
          pendingBookings
        },
        revenue: {
          total: totalRevenue,
          coupleShare: totalCoupleShare,
          platformShare: totalPlatformShare
        },
        recent: {
          users: recentUsers,
          bookings: recentBookings,
          videos: recentVideos
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard' });
  }
};

module.exports = {
  // User management
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  // Booking management
  getAllBookings,
  updateBookingStatus,
  // Video management
  getAllVideos,
  approveVideo,
  rejectVideo,
  featureVideo,
  // Support management
  getAllSupports,
  // Payment management
  getAllPayments,
  // Post management
  getAllPosts,
  deletePost,
  // Dashboard
  getAdminDashboard
};