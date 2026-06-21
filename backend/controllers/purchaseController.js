// backend/controllers/purchaseController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── PURCHASE PREMIUM VIDEO (CLIENT ONLY) ────────────────────────
// @desc    Purchase a premium video (CLIENTS ONLY)
// @route   POST /api/purchases
// @access  Private (CLIENT only)
const purchaseVideo = async (req, res) => {
  try {
    const { videoId, amount, paymentMethod } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // ─── ONLY CLIENTS CAN PURCHASE ────────────────────────────────
    if (userRole !== 'CLIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can purchase premium videos'
      });
    }

    // Validation
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: parseInt(videoId) },
      include: {
        couple: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if video is free
    if (video.accessType === 'FREE') {
      return res.status(400).json({
        success: false,
        message: 'This video is free. No purchase needed.'
      });
    }

    // Check if already purchased
    const existingPurchase = await prisma.videoPurchase.findUnique({
      where: {
        userId_videoId: {
          userId: parseInt(userId),
          videoId: parseInt(videoId)
        }
      }
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You already have access to this video'
      });
    }

    // Determine price
    let purchaseAmount = amount;
    if (!purchaseAmount) {
      purchaseAmount = video.price || video.supportAmount || 0;
    }

    if (purchaseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase amount'
      });
    }

    // Create purchase record
    const purchase = await prisma.videoPurchase.create({
      data: {
        userId: parseInt(userId),
        videoId: parseInt(videoId),
        amount: purchaseAmount,
        purchaseType: 'PURCHASE'
      }
    });

    // Update video earnings
    await prisma.video.update({
      where: { id: parseInt(videoId) },
      data: {
        totalEarnings: { increment: purchaseAmount },
        totalPurchases: { increment: 1 }
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        transactionId: `PURCHASE_${Date.now()}_${userId}`,
        amount: purchaseAmount,
        method: paymentMethod || 'MTN_MOMO',
        status: 'COMPLETED',
        userId: parseInt(userId),
        reference: `Video Purchase: ${video.title}`,
        metadata: JSON.stringify({
          videoId: video.id,
          videoTitle: video.title,
          videoUrl: video.videoUrl
        })
      }
    });

    // ─── NOTIFICATIONS ───────────────────────────────────────────────
    // Notify client
    await prisma.notification.create({
      data: {
        title: 'Video Purchased Successfully! 🎉',
        message: `You have purchased access to "${video.title}" for ${purchaseAmount.toLocaleString()} RWF.`,
        type: 'PURCHASE',
        userId: parseInt(userId),
        relatedId: purchase.id,
        link: `/video/${video.id}`
      }
    });

    // Notify couple
    if (video.couple) {
      await prisma.notification.create({
        data: {
          title: 'Your Video Was Purchased! 💰',
          message: `${req.user.name} purchased access to your video "${video.title}" for ${purchaseAmount.toLocaleString()} RWF.`,
          type: 'PURCHASE',
          userId: video.couple.userId,
          relatedId: purchase.id
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Video purchased successfully!',
      purchase: {
        id: purchase.id,
        videoId: purchase.videoId,
        amount: purchase.amount,
        purchaseType: purchase.purchaseType,
        createdAt: purchase.createdAt
      },
      video: {
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl,
        accessType: video.accessType
      },
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        method: payment.method
      }
    });
  } catch (error) {
    console.error('Purchase video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing purchase'
    });
  }
};

// ─── CHECK VIDEO ACCESS ──────────────────────────────────────────
// @desc    Check if user has access to a video
// @route   GET /api/purchases/check/:videoId
// @access  Private
const checkVideoAccess = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: parseInt(videoId) }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    let hasAccess = false;
    let reason = '';

    // ─── RULE 1: FREE VIDEO ──────────────────────────────────────
    if (video.accessType === 'FREE') {
      hasAccess = true;
      reason = 'Free video - everyone can watch';
    }
    // ─── RULE 2: COUPLE ───────────────────────────────────────────
    else if (userRole === 'COUPLE') {
      const couple = await prisma.coupleProfile.findUnique({
        where: { userId: parseInt(userId) }
      });
      if (couple && couple.id === video.coupleId) {
        hasAccess = true;
        reason = 'Couple owns this video';
      }
    }
    // ─── RULE 3: CREATOR ──────────────────────────────────────────
    else if (userRole === 'CREATOR') {
      if (video.creatorId === parseInt(userId)) {
        hasAccess = true;
        reason = 'Creator worked on this video';
      }
    }
    // ─── RULE 4: ADMIN ────────────────────────────────────────────
    else if (userRole === 'ADMIN') {
      hasAccess = true;
      reason = 'Admin access - can view all videos';
    }
    // ─── RULE 5: CLIENT ──────────────────────────────────────────
    else if (userRole === 'CLIENT') {
      const purchase = await prisma.videoPurchase.findUnique({
        where: {
          userId_videoId: {
            userId: parseInt(userId),
            videoId: parseInt(videoId)
          }
        }
      });
      if (purchase) {
        hasAccess = true;
        reason = 'Purchased this video';
      }
    }

    // If CLIENT doesn't have access
    if (!hasAccess && userRole === 'CLIENT') {
      return res.status(403).json({
        success: false,
        hasAccess: false,
        message: 'You need to purchase this video to watch it',
        video: {
          id: video.id,
          title: video.title,
          price: video.price || video.supportAmount,
          accessType: video.accessType
        }
      });
    }

    res.json({
      success: true,
      hasAccess,
      reason,
      accessType: video.accessType,
      video: {
        id: video.id,
        title: video.title,
        accessType: video.accessType,
        price: video.price,
        supportAmount: video.supportAmount
      },
      user: {
        role: userRole,
        id: userId
      }
    });
  } catch (error) {
    console.error('Check video access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking access'
    });
  }
};

// ─── GET MY PURCHASES (CLIENT ONLY) ──────────────────────────────
// @desc    Get all videos purchased by the client
// @route   GET /api/purchases/my
// @access  Private (CLIENT only)
const getMyPurchases = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only clients have purchase history
    if (userRole !== 'CLIENT') {
      return res.json({
        success: true,
        message: 'Purchases are only for clients',
        count: 0,
        totalSpent: 0,
        purchases: []
      });
    }

    const purchases = await prisma.videoPurchase.findMany({
      where: { userId: parseInt(userId) },
      include: {
        video: {
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
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      count: purchases.length,
      totalSpent,
      purchases
    });
  } catch (error) {
    console.error('Get my purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching purchases'
    });
  }
};

// ─── GET PURCHASE STATS (ADMIN ONLY) ─────────────────────────────
// @desc    Get video purchase statistics (Admin only)
// @route   GET /api/purchases/stats
// @access  Private/Admin
const getPurchaseStats = async (req, res) => {
  try {
    // Only admin can view stats
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const purchases = await prisma.videoPurchase.findMany({
      include: {
        video: {
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

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const totalPurchases = purchases.length;
    const uniqueBuyers = [...new Set(purchases.map(p => p.userId))].length;
    const uniqueVideos = [...new Set(purchases.map(p => p.videoId))].length;

    // Top selling videos
    const videoStats = {};
    purchases.forEach(p => {
      const key = p.videoId;
      if (!videoStats[key]) {
        videoStats[key] = {
          videoId: p.video.id,
          videoTitle: p.video.title,
          count: 0,
          totalRevenue: 0
        };
      }
      videoStats[key].count++;
      videoStats[key].totalRevenue += p.amount;
    });

    const topVideos = Object.values(videoStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Monthly breakdown
    const monthlyData = {};
    purchases.forEach(p => {
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
        totalPurchases,
        uniqueBuyers,
        uniqueVideos,
        topVideos,
        monthlyData
      }
    });
  } catch (error) {
    console.error('Get purchase stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching purchase stats'
    });
  }
};

// ─── GET PURCHASE BY ID ───────────────────────────────────────────
// @desc    Get single purchase by ID
// @route   GET /api/purchases/:id
// @access  Private (Owner or Admin)
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const purchase = await prisma.videoPurchase.findUnique({
      where: { id: parseInt(id) },
      include: {
        video: {
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

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Check permissions
    const isOwner = purchase.userId === parseInt(userId);
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      purchase
    });
  } catch (error) {
    console.error('Get purchase by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching purchase'
    });
  }
};

module.exports = {
  purchaseVideo,
  checkVideoAccess,
  getMyPurchases,
  getPurchaseStats,
  getPurchaseById
};