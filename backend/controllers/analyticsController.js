// backend/controllers/analyticsController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // User counts
    const totalUsers = await prisma.user.count();
    const totalClients = await prisma.user.count({ where: { role: 'CLIENT' } });
    const totalCreators = await prisma.user.count({ where: { role: 'CREATOR' } });
    const totalCouples = await prisma.user.count({ where: { role: 'COUPLE' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await prisma.user.count({
      where: { updatedAt: { gte: thirtyDaysAgo } }
    });
    
    // Content counts
    const totalVideos = await prisma.video.count();
    const publishedVideos = await prisma.video.count({ where: { status: 'APPROVED' } });
    const pendingVideos = await prisma.video.count({ where: { status: 'PENDING' } });
    const totalPosts = await prisma.post.count();
    const totalComments = await prisma.comment.count();
    
    // Booking counts
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    const completedBookings = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    const cancelledBookings = await prisma.booking.count({ where: { status: 'CANCELLED' } });
    
    // Support statistics
    const supports = await prisma.support.findMany();
    const totalSupportRevenue = supports.reduce((sum, s) => sum + s.amount, 0);
    const totalCoupleShare = supports.reduce((sum, s) => sum + s.coupleAmount, 0);
    const totalPlatformShare = supports.reduce((sum, s) => sum + s.platformAmount, 0);
    const totalSupporters = [...new Set(supports.map(s => s.userId))].length;
    const totalSupportedCouples = [...new Set(supports.map(s => s.coupleId))].length;
    
    // Payment statistics
    const payments = await prisma.payment.findMany();
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;
    
    // View statistics
    const totalVideoViews = await prisma.video.aggregate({
      _sum: { views: true }
    });
    const totalPostViews = await prisma.post.aggregate({
      _sum: { views: true }
    });
    const totalLikes = await prisma.post.aggregate({
      _sum: { likes: true }
    });
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          clients: totalClients,
          creators: totalCreators,
          couples: totalCouples,
          admins: totalAdmins,
          active: activeUsers
        },
        content: {
          videos: {
            total: totalVideos,
            published: publishedVideos,
            pending: pendingVideos
          },
          posts: totalPosts,
          comments: totalComments,
          totalViews: (totalVideoViews._sum.views || 0) + (totalPostViews._sum.views || 0),
          totalLikes: totalLikes._sum.likes || 0
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          conversionRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0
        },
        revenue: {
          total: totalSupportRevenue + totalPayments,
          supportRevenue: totalSupportRevenue,
          coupleShare: totalCoupleShare,
          platformShare: totalPlatformShare,
          paymentRevenue: totalPayments,
          completedPayments: completedPayments
        },
        support: {
          totalSupporters,
          totalSupportedCouples,
          totalTransactions: supports.length
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics'
    });
  }
};

// @desc    Get revenue report (Admin only)
// @route   GET /api/analytics/revenue
// @access  Private/Admin
const getRevenueReport = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    
    let supports = await prisma.support.findMany({
      include: {
        couple: { include: { user: true } },
        user: true
      }
    });
    
    let payments = await prisma.payment.findMany();
    
    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      supports = supports.filter(s => new Date(s.createdAt) >= start && new Date(s.createdAt) <= end);
      payments = payments.filter(p => new Date(p.createdAt) >= start && new Date(p.createdAt) <= end);
    }
    
    // Group by period
    const revenueByPeriod = {};
    const getKey = (date) => {
      const d = new Date(date);
      if (period === 'daily') return d.toISOString().split('T')[0];
      if (period === 'monthly') return `${d.getFullYear()}-${d.getMonth() + 1}`;
      return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
    };
    
    supports.forEach(s => {
      const key = getKey(s.createdAt);
      if (!revenueByPeriod[key]) {
        revenueByPeriod[key] = { support: 0, coupleShare: 0, platformShare: 0, payments: 0, total: 0 };
      }
      revenueByPeriod[key].support += s.amount;
      revenueByPeriod[key].coupleShare += s.coupleAmount;
      revenueByPeriod[key].platformShare += s.platformAmount;
      revenueByPeriod[key].total += s.amount;
    });
    
    payments.forEach(p => {
      const key = getKey(p.createdAt);
      if (revenueByPeriod[key]) {
        revenueByPeriod[key].payments += p.amount;
        revenueByPeriod[key].total += p.amount;
      } else {
        revenueByPeriod[key] = { support: 0, coupleShare: 0, platformShare: 0, payments: p.amount, total: p.amount };
      }
    });
    
    const totalRevenue = supports.reduce((sum, s) => sum + s.amount, 0) + payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCoupleShare = supports.reduce((sum, s) => sum + s.coupleAmount, 0);
    const totalPlatformShare = supports.reduce((sum, s) => sum + s.platformAmount, 0);
    
    res.json({
      success: true,
      report: {
        period,
        summary: {
          totalRevenue,
          totalCoupleShare,
          totalPlatformShare,
          supportRevenue: supports.reduce((sum, s) => sum + s.amount, 0),
          paymentRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
          totalTransactions: supports.length + payments.length
        },
        breakdown: revenueByPeriod
      }
    });
  } catch (error) {
    console.error('Get revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching revenue report'
    });
  }
};

// @desc    Get creator analytics (Admin only)
// @route   GET /api/analytics/creators
// @access  Private/Admin
const getCreatorAnalytics = async (req, res) => {
  try {
    const creators = await prisma.user.findMany({
      where: { role: 'CREATOR' },
      include: {
        creatorProfile: true,
        videos: {
          include: {
            supports: true
          }
        },
        bookings: true
      }
    });
    
    const creatorStats = creators.map(creator => {
      const totalViews = creator.videos.reduce((sum, v) => sum + v.views, 0);
      const totalVideos = creator.videos.length;
      const totalSupports = creator.videos.reduce((sum, v) => sum + v.supports.length, 0);
      const totalSupportAmount = creator.videos.reduce((sum, v) => sum + v.supports.reduce((s, sup) => s + sup.amount, 0), 0);
      const totalBookings = creator.bookings.length;
      const avgRating = creator.creatorProfile?.rating || 0;
      
      return {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        stats: {
          totalVideos,
          totalViews,
          totalSupports,
          totalSupportAmount,
          totalBookings,
          avgRating,
          engagementRate: totalViews > 0 ? Math.round((totalSupports / totalViews) * 100) : 0
        }
      };
    });
    
    // Sort by total views
    creatorStats.sort((a, b) => b.stats.totalViews - a.stats.totalViews);
    
    res.json({
      success: true,
      count: creatorStats.length,
      creators: creatorStats
    });
  } catch (error) {
    console.error('Get creator analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching creator analytics'
    });
  }
};

// @desc    Get couple analytics (Admin only)
// @route   GET /api/analytics/couples
// @access  Private/Admin
const getCoupleAnalytics = async (req, res) => {
  try {
    const couples = await prisma.coupleProfile.findMany({
      include: {
        user: true,
        videos: {
          include: {
            supports: true
          }
        },
        supports: true
      }
    });
    
    const coupleStats = couples.map(couple => {
      const totalVideos = couple.videos.length;
      const totalViews = couple.videos.reduce((sum, v) => sum + v.views, 0);
      const totalLikes = couple.videos.reduce((sum, v) => sum + v.likes, 0);
      const totalSupporters = couple.supports.length;
      const totalSupportAmount = couple.supports.reduce((sum, s) => sum + s.amount, 0);
      const totalEarnings = couple.supports.reduce((sum, s) => sum + s.coupleAmount, 0);
      
      return {
        id: couple.id,
        coupleName: couple.user.name,
        groomName: couple.groomName,
        brideName: couple.brideName,
        location: couple.location,
        stats: {
          totalVideos,
          totalViews,
          totalLikes,
          totalSupporters,
          totalSupportAmount,
          totalEarnings,
          averageViewPerVideo: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0
        }
      };
    });
    
    // Sort by total earnings
    coupleStats.sort((a, b) => b.stats.totalEarnings - a.stats.totalEarnings);
    
    res.json({
      success: true,
      count: coupleStats.length,
      couples: coupleStats
    });
  } catch (error) {
    console.error('Get couple analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching couple analytics'
    });
  }
};

// @desc    Get most supported couples
// @route   GET /api/analytics/top-couples
// @access  Public
const getTopSupportedCouplesAnalytics = async (req, res) => {
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

// @desc    Get video analytics
// @route   GET /api/analytics/videos
// @access  Private/Admin
const getVideoAnalytics = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        couple: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        supports: true
      },
      orderBy: { views: 'desc' }
    });
    
    const videoStats = videos.map(video => ({
      id: video.id,
      title: video.title,
      creator: video.user.name,
      couple: video.couple?.user.name || 'Not assigned',
      eventType: video.eventType,
      status: video.status,
      views: video.views,
      likes: video.likes,
      shares: video.shares,
      supportCount: video.supports.length,
      supportAmount: video.supports.reduce((sum, s) => sum + s.amount, 0),
      createdAt: video.createdAt
    }));
    
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
    const totalSupportAmount = videos.reduce((sum, v) => sum + v.supports.reduce((s, sup) => s + sup.amount, 0), 0);
    
    res.json({
      success: true,
      summary: {
        totalVideos: videos.length,
        totalViews,
        totalLikes,
        totalSupportAmount,
        averageViewsPerVideo: videos.length > 0 ? Math.round(totalViews / videos.length) : 0
      },
      videos: videoStats
    });
  } catch (error) {
    console.error('Get video analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching video analytics'
    });
  }
};

// @desc    Get booking analytics
// @route   GET /api/analytics/bookings
// @access  Private/Admin
const getBookingAnalytics = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    // Bookings by event type
    const byEventType = {};
    bookings.forEach(b => {
      const type = b.eventType;
      if (!byEventType[type]) byEventType[type] = { count: 0, revenue: 0 };
      byEventType[type].count++;
      byEventType[type].revenue += b.totalAmount || 0;
    });
    
    res.json({
      success: true,
      summary: {
        totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        totalRevenue,
        averageBookingValue,
        conversionRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0
      },
      byEventType,
      recentBookings: bookings.slice(0, 10)
    });
  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching booking analytics'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueReport,
  getCreatorAnalytics,
  getCoupleAnalytics,
  getTopSupportedCouplesAnalytics,
  getVideoAnalytics,
  getBookingAnalytics
};