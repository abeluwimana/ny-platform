// backend/controllers/adminController.js
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../utils/emailService');
const { bookingStatusEmail } = require('../utils/emailTemplates');
const prisma = new PrismaClient();

// ─── Helper: audit log ─────────────────────────────────────────
const logAction = async (req, action, entityType, entityId, changes = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        action, entityType, entityId,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      }
    });
  } catch (e) { console.error('Audit log error:', e.message); }
};

// ══════════════ DASHBOARD ══════════════

const getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalBookings, totalVideos, totalPosts, pendingVideos, pendingBookings] =
      await Promise.all([
        prisma.user.count(),
        prisma.booking.count(),
        prisma.video.count(),
        prisma.post.count(),
        prisma.video.count({ where: { status: 'PENDING' } }),
        prisma.booking.count({ where: { status: 'PENDING' } }),
      ]);

    const [recentUsers, recentBookings, recentVideos] = await Promise.all([
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.booking.findMany({ take: 5, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } } }),
      prisma.video.findMany({ take: 5, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } } }),
    ]);

    const supports = await prisma.support.findMany();
    const totalRevenue = supports.reduce((s, x) => s + x.amount, 0);
    const totalCoupleShare = supports.reduce((s, x) => s + x.coupleAmount, 0);
    const totalPlatformShare = supports.reduce((s, x) => s + x.platformAmount, 0);

    res.json({
      success: true,
      dashboard: {
        counts: { users: totalUsers, bookings: totalBookings, videos: totalVideos, posts: totalPosts, pendingVideos, pendingBookings },
        revenue: { total: totalRevenue, coupleShare: totalCoupleShare, platformShare: totalPlatformShare },
        recent: { users: recentUsers, bookings: recentBookings, videos: recentVideos }
      }
    });
  } catch (error) {
    console.error('getAdminDashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers, clients, creators, couples,
      totalBookings, pending, confirmed, completed, cancelled,
      totalVideos, pendingVideos, publishedVideos,
      totalPosts, pendingCreators
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'CREATOR' } }),
      prisma.user.count({ where: { role: 'COUPLE' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.video.count(),
      prisma.video.count({ where: { status: 'PENDING' } }),
      prisma.video.count({ where: { status: { in: ['APPROVED', 'PUBLISHED'] } } }),
      prisma.post.count(),
      prisma.user.count({ where: { role: 'CREATOR', isActive: false } }),
    ]);

    const supports = await prisma.support.findMany();
    const revenue = supports.reduce((s, x) => s + x.amount, 0);
    const coupleRevenue = supports.reduce((s, x) => s + x.coupleAmount, 0);
    const platformRevenue = supports.reduce((s, x) => s + x.platformAmount, 0);

    res.json({
      success: true,
      stats: {
        totalUsers, clients, creators, couples,
        totalBookings, pending, confirmed, completed, cancelled,
        totalVideos, pendingVideos, publishedVideos,
        totalPosts, pendingCreators,
        revenue, coupleRevenue, platformRevenue,
        totalSupporters: new Set(supports.map(s => s.userId)).size,
        totalSupportedCouples: new Set(supports.map(s => s.coupleId)).size,
        unreadMsgs: 0,
      }
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

// ══════════════ USERS ══════════════

const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, limit = 50, page = 1 } = req.query;
    const where = {};
    if (role && role !== 'all') where.role = String(role).toUpperCase();
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { clientProfile: true, coupleProfile: true, creatorProfile: true, adminProfile: true },
        skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        clientProfile: true, coupleProfile: true, creatorProfile: true, adminProfile: true,
        bookings: true, videos: true, posts: true, supports: true, payments: true
      }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'CLIENT', 'CREATOR', 'COUPLE'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role }
    });
    await logAction(req, 'UPDATE_ROLE', 'USER', user.id, { role });
    res.json({ success: true, message: 'User role updated', user });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ success: false, message: 'Server error updating role' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: !user.isActive }
    });
    await logAction(req, 'TOGGLE_STATUS', 'USER', user.id, { isActive: updated.isActive });
    res.json({ success: true, message: `User ${updated.isActive ? 'activated' : 'deactivated'}`, user: updated });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.$transaction([
      prisma.booking.deleteMany({ where: { userId: id } }),
      prisma.video.deleteMany({ where: { userId: id } }),
      prisma.post.deleteMany({ where: { userId: id } }),
      prisma.comment.deleteMany({ where: { userId: id } }),
      prisma.support.deleteMany({ where: { userId: id } }),
      prisma.payment.deleteMany({ where: { userId: id } }),
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } })
    ]);
    await logAction(req, 'DELETE', 'USER', id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

// ══════════════ BOOKINGS ══════════════

const getAllBookings = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = String(status).toUpperCase();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          creator: { select: { id: true, name: true, email: true } }
        },
        skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);
    res.json({
      success: true,
      bookings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        creator: { select: { id: true, name: true, email: true } }
      }
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status, totalAmount } = req.body;
    if (!['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const existing = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Booking not found' });

    const updateData = { status };
    if (totalAmount) {
      updateData.totalAmount = parseFloat(totalAmount);
      updateData.paymentStatus = 'PENDING';
    }
    const booking = await prisma.booking.update({ where: { id: existing.id }, data: updateData });

    try {
      if (existing.user?.email) {
        const html = bookingStatusEmail(
          { userName: existing.user.name || 'there', id: existing.bookingNumber || existing.id },
          existing.status, status
        );
        await sendEmail(existing.user.email, `Booking ${status} - SHINECONNECT 📊`, html);
      }
    } catch (e) { console.error('Booking email failed:', e.message); }

    await logAction(req, 'UPDATE_STATUS', 'BOOKING', booking.id, { from: existing.status, to: status });
    res.json({ success: true, message: 'Booking status updated', booking });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.booking.delete({ where: { id } });
    await logAction(req, 'DELETE', 'BOOKING', id);
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('deleteBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting booking' });
  }
};

const assignCreatorToBooking = async (req, res) => {
  try {
    const { creatorId } = req.body;
    if (!creatorId) return res.status(400).json({ success: false, message: 'creatorId required' });
    const creator = await prisma.user.findUnique({ where: { id: parseInt(creatorId) } });
    if (!creator || creator.role !== 'CREATOR') {
      return res.status(400).json({ success: false, message: 'Invalid creator' });
    }
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { creatorId: parseInt(creatorId), status: 'IN_PROGRESS' }
    });
    await prisma.notification.create({
      data: {
        userId: creator.id, type: 'BOOKING',
        title: 'New Booking Assigned',
        message: `You have been assigned to booking #${booking.bookingNumber}`,
        relatedId: booking.id
      }
    });
    await logAction(req, 'ASSIGN_CREATOR', 'BOOKING', booking.id, { creatorId });
    res.json({ success: true, message: 'Creator assigned', booking });
  } catch (error) {
    console.error('assignCreatorToBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error assigning creator' });
  }
};

// ══════════════ VIDEOS ══════════════

const getAllVideos = async (req, res) => {
  try {
    const rawStatus = typeof req.query.status === 'string' ? req.query.status : req.query.status?.status;
    const normalizedStatus = rawStatus && rawStatus !== 'all' ? String(rawStatus).toUpperCase() : null;
    const { limit = 50, page = 1 } = req.query;
    const where = {};
    if (normalizedStatus && ['PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'DRAFT', 'ARCHIVED'].includes(normalizedStatus)) {
      where.status = normalizedStatus;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          couple: { include: { user: { select: { name: true, email: true } } } }
        },
        skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }
      }),
      prisma.video.count({ where })
    ]);
    res.json({
      success: true,
      videos,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('getAllVideos error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching videos' });
  }
};

const getVideoById = async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        couple: { include: { user: { select: { name: true, email: true } } } }
      }
    });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, video });
  } catch (error) {
    console.error('getVideoById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const approveVideo = async (req, res) => {
  try {
    const video = await prisma.video.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'APPROVED', approvedBy: req.user.id, approvedAt: new Date() }
    });
    const uploader = await prisma.user.findUnique({
      where: { id: video.userId }, select: { id: true, name: true, email: true }
    });
    await prisma.notification.create({
      data: {
        userId: video.userId, type: 'VIDEO_APPROVED',
        title: 'Video Approved',
        message: `Your video "${video.title}" has been approved!`,
        relatedId: video.id
      }
    });
    try {
      if (uploader?.email) {
        await sendEmail(uploader.email, 'Your video is now live - SHINECONNECT 🎬',
          `<p>Hello ${uploader.name || 'there'},</p><p>Your video "${video.title}" has been approved and is now live.</p>`);
      }
    } catch (e) { console.error('Approve email failed:', e.message); }

    await logAction(req, 'APPROVE', 'VIDEO', video.id);
    res.json({ success: true, message: 'Video approved', video });
  } catch (error) {
    console.error('approveVideo error:', error);
    res.status(500).json({ success: false, message: 'Server error approving video' });
  }
};

const rejectVideo = async (req, res) => {
  try {
    const { reason } = req.body;
    const video = await prisma.video.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'REJECTED', rejectionReason: reason || 'Please check content guidelines' }
    });
    const uploader = await prisma.user.findUnique({
      where: { id: video.userId }, select: { id: true, name: true, email: true }
    });
    await prisma.notification.create({
      data: {
        userId: video.userId, type: 'VIDEO_REJECTED',
        title: 'Video Rejected',
        message: `Your video "${video.title}" was rejected. Reason: ${reason || 'Please review guidelines'}`,
        relatedId: video.id
      }
    });
    try {
      if (uploader?.email) {
        await sendEmail(uploader.email, 'Your video needs attention - SHINECONNECT 🎬',
          `<p>Hello ${uploader.name || 'there'},</p><p>Your video "${video.title}" was rejected.</p><p>Reason: ${reason || 'Please review the content guidelines and resubmit.'}</p>`);
      }
    } catch (e) { console.error('Reject email failed:', e.message); }

    await logAction(req, 'REJECT', 'VIDEO', video.id, { reason });
    res.json({ success: true, message: 'Video rejected', video });
  } catch (error) {
    console.error('rejectVideo error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting video' });
  }
};

const featureVideo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    const updated = await prisma.video.update({
      where: { id }, data: { isFeatured: !video.isFeatured }
    });
    await logAction(req, 'FEATURE', 'VIDEO', id, { isFeatured: updated.isFeatured });
    res.json({
      success: true,
      message: updated.isFeatured ? 'Video featured' : 'Video unfeatured',
      video: updated
    });
  } catch (error) {
    console.error('featureVideo error:', error);
    res.status(500).json({ success: false, message: 'Server error featuring video' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.video.delete({ where: { id } });
    await logAction(req, 'DELETE', 'VIDEO', id);
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    console.error('deleteVideo error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting video' });
  }
};

// ══════════════ SUPPORTS ══════════════

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
    const totalAmount = supports.reduce((s, x) => s + x.amount, 0);
    const totalCoupleShare = supports.reduce((s, x) => s + x.coupleAmount, 0);
    const totalPlatformShare = supports.reduce((s, x) => s + x.platformAmount, 0);

    res.json({
      success: true,
      summary: {
        totalTransactions: supports.length,
        totalAmount, totalCoupleShare, totalPlatformShare,
        uniqueSupporters: new Set(supports.map(s => s.userId)).size
      },
      supports
    });
  } catch (error) {
    console.error('getAllSupports error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching supports' });
  }
};

// ══════════════ PAYMENTS ══════════════

const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const totalRevenue = payments.reduce((s, x) => s + x.amount, 0);
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
    console.error('getAllPayments error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
};

// ══════════════ POSTS ══════════════

const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, posts });
  } catch (error) {
    console.error('getAllPosts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching posts' });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });
    await logAction(req, 'DELETE', 'POST', id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('deletePost error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting post' });
  }
};

// ══════════════ COUPLES ══════════════

const getCouples = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [couples, total] = await Promise.all([
      prisma.coupleProfile.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { videos: true, supports: true } }
        },
        skip, take: parseInt(limit), orderBy: { id: 'desc' }
      }),
      prisma.coupleProfile.count()
    ]);
    res.json({
      success: true,
      couples,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('getCouples error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching couples' });
  }
};

// ══════════════ MESSAGES ══════════════

const getMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({
      success: true,
      messages,
      unreadCount: messages.filter(m => !m.isRead).length
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
};

const markMessageRead = async (req, res) => {
  try {
    const msg = await prisma.message.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true, status: 'READ' }
    });
    res.json({ success: true, message: msg });
  } catch (error) {
    console.error('markMessageRead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await prisma.message.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('deleteMessage error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ══════════════ NOTIFICATIONS (admin) ══════════════

const getAdminNotifications = async (req, res) => {
  try {
    const list = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json({
      success: true,
      notifications: list,
      unreadCount: list.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('getAdminNotifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markAdminNotificationRead = async (req, res) => {
  try {
    const n = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true }
    });
    res.json({ success: true, notification: n });
  } catch (error) {
    console.error('markAdminNotificationRead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markAllAdminNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllAdminNotificationsRead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ══════════════ BROADCAST ══════════════

const sendBroadcast = async (req, res) => {
  try {
    const { title, message, target } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }
    const where = {};
    if (target && target !== 'all') where.role = String(target).toUpperCase();

    const users = await prisma.user.findMany({ where, select: { id: true, email: true, name: true } });

    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        type: 'BROADCAST',
        title,
        message,
        isRead: false
      }))
    });

    // Optional emails - don't block on failure
    let sent = 0;
    for (const u of users) {
      try {
        const result = await sendEmail(u.email, `📢 ${title}`, `<h2>${title}</h2><p>${message}</p>`);
        if (result?.success) sent++;
      } catch (e) { /* skip */ }
    }

    await logAction(req, 'BROADCAST', 'USER', null, { target, recipientCount: users.length });
    res.json({ success: true, message: `Broadcast sent to ${users.length} users (${sent} emails)`, count: users.length });
  } catch (error) {
    console.error('sendBroadcast error:', error);
    res.status(500).json({ success: false, message: 'Server error sending broadcast' });
  }
};

// ══════════════ SETTINGS ══════════════

const getSettings = async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 1 } });
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const allowed = [
      'platformName', 'tagline', 'contactEmail', 'contactPhone', 'whatsappNumber',
      'address', 'workingHours', 'socialFacebook', 'socialInstagram', 'socialYoutube',
      'socialTiktok', 'socialWhatsapp', 'packageBasic', 'packagePremium', 'packageLuxury',
      'packageFull', 'commissionCouple', 'commissionPlatform', 'commissionCreator',
      'maintenanceMode'
    ];
    const data = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) data[k] = req.body[k];
    }

    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 1, ...data } });
    } else {
      settings = await prisma.settings.update({ where: { id: 1 }, data });
    }
    await logAction(req, 'UPDATE', 'SETTINGS', 1);
    res.json({ success: true, message: 'Settings saved', settings });
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};

// ══════════════ AUDIT LOGS ══════════════

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
    res.json({ success: true, logs });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching audit logs' });
  }
};

// ══════════════ EXPORT ══════════════

const exportData = async (req, res) => {
  try {
    const type = req.params.type;
    let data = [];
    if (type === 'users') {
      data = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true }
      });
    } else if (type === 'bookings') {
      data = await prisma.booking.findMany({
        include: { user: { select: { name: true, email: true } } }
      });
    } else if (type === 'supports') {
      data = await prisma.support.findMany({
        include: { user: { select: { name: true, email: true } }, couple: { include: { user: { select: { name: true } } } } }
      });
    } else if (type === 'payments') {
      data = await prisma.payment.findMany({
        include: { user: { select: { name: true, email: true } } }
      });
    } else if (type === 'videos') {
      data = await prisma.video.findMany({
        include: { user: { select: { name: true, email: true } } }
      });
    } else if (type === 'posts') {
      data = await prisma.post.findMany({
        include: { user: { select: { name: true, email: true } } }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_${Date.now()}.json"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('exportData error:', error);
    res.status(500).json({ success: false, message: 'Server error exporting data' });
  }
};

// ══════════════ EXPORTS ══════════════

module.exports = {
  getAdminDashboard,
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  assignCreatorToBooking,
  getAllVideos,
  getVideoById,
  approveVideo,
  rejectVideo,
  featureVideo,
  deleteVideo,
  getAllSupports,
  getAllPayments,
  getAllPosts,
  deletePost,
  getCouples,
  getMessages,
  markMessageRead,
  deleteMessage,
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  sendBroadcast,
  getSettings,
  updateSettings,
  getAuditLogs,
  exportData
};