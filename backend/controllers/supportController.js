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

// ─── SUPPORT COUPLE (With Premium Video Unlock) ──────────────────
// @desc    Support a couple (Client only) - Auto unlocks premium videos
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

    // ─── PREMIUM VIDEO UNLOCK LOGIC ────────────────────────────────
    let unlockedVideo = null;
    let videoAccessGranted = false;

    if (videoId) {
      // Check if video exists and belongs to this couple
      const video = await prisma.video.findFirst({
        where: {
          id: parseInt(videoId),
          coupleId: parseInt(coupleId)
        }
      });

      if (video && video.accessType !== 'FREE') {
        // Check if user already has access
        const existingPurchase = await prisma.videoPurchase.findUnique({
          where: {
            userId_videoId: {
              userId: req.user.id,
              videoId: parseInt(videoId)
            }
          }
        });

        if (!existingPurchase) {
          // Check if support amount meets the video price
          const videoPrice = video.price || video.supportAmount || 0;
          
          if (amount >= videoPrice) {
            // Unlock the video!
            const purchase = await prisma.videoPurchase.create({
              data: {
                userId: req.user.id,
                videoId: parseInt(videoId),
                amount: amount,
                purchaseType: 'SUPPORT'
              }
            });

            // Update video stats
            await prisma.video.update({
              where: { id: parseInt(videoId) },
              data: {
                totalEarnings: { increment: amount },
                totalPurchases: { increment: 1 },
                totalSupporters: { increment: 1 }
              }
            });

            unlockedVideo = video;
            videoAccessGranted = true;

            // Create notification for user
            await prisma.notification.create({
              data: {
                title: 'Video Unlocked! 🎉',
                message: `Your support of ${amount.toLocaleString()} RWF has unlocked "${video.title}"! You now have lifetime access.`,
                type: 'PURCHASE',
                userId: req.user.id,
                relatedId: purchase.id,
                link: `/video/${video.id}`
              }
            });
          }
        } else {
          videoAccessGranted = true;
          unlockedVideo = video;
        }
      }
    }

    // ─── CREATE SUPPORT RECORD ──────────────────────────────────────
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

    // ─── UPDATE COUPLE'S TOTAL SUPPORT ──────────────────────────────
    await prisma.coupleProfile.update({
      where: { id: parseInt(coupleId) },
      data: {
        totalSupport: { increment: coupleAmount }
      }
    });

    // ─── NOTIFICATIONS ───────────────────────────────────────────────
    // Notify couple
    await prisma.notification.create({
      data: {
        title: 'New Support Received! ❤️',
        message: `${req.user.name} supported you with ${amount.toLocaleString()} RWF! You receive ${coupleAmount.toLocaleString()} RWF.`,
        type: 'SUPPORT',
        userId: couple.userId,
        relatedId: support.id
      }
    });

    // Notify client
    await prisma.notification.create({
      data: {
        title: 'Support Successful ✅',
        message: `You successfully supported ${couple.user.name} with ${amount.toLocaleString()} RWF. Thank you!`,
        type: 'PAYMENT',
        userId: req.user.id,
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
      },
      videoUnlocked: videoAccessGranted,
      unlockedVideo: unlockedVideo ? {
        id: unlockedVideo.id,
        title: unlockedVideo.title,
        videoUrl: unlockedVideo.videoUrl
      } : null
    });
  } catch (error) {
    console.error('Support couple error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing support'
    });
  }
};

// ─── GET MY SUPPORT HISTORY ──────────────────────────────────────
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
            thumbnail: true,
            accessType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check which videos were unlocked
    const supportsWithUnlockInfo = await Promise.all(supports.map(async (s) => {
      let videoUnlocked = false;
      if (s.videoId) {
        const purchase = await prisma.videoPurchase.findUnique({
          where: {
            userId_videoId: {
              userId: req.user.id,
              videoId: s.videoId
            }
          }
        });
        videoUnlocked = !!purchase;
      }
      return { ...s, videoUnlocked };
    }));

    const totalGiven = supports.reduce((sum, s) => sum + s.amount, 0);

    res.json({
      success: true,
      count: supports.length,
      totalGiven,
      supports: supportsWithUnlockInfo
    });
  } catch (error) {
    console.error('Get support history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching support history'
    });
  }
};

// ─── GET COUPLE EARNINGS ──────────────────────────────────────────
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
            title: true,
            accessType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get video purchase earnings
    const videoPurchases = await prisma.videoPurchase.findMany({
      where: {
        video: {
          coupleId: couple.id
        }
      }
    });

    const totalVideoEarnings = videoPurchases.reduce((sum, p) => sum + p.amount, 0);
    const totalEarned = supports.reduce((sum, s) => sum + s.coupleAmount, 0) + totalVideoEarnings;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = supports
      .filter(s => {
        const date = new Date(s.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + s.coupleAmount, 0) + 
      videoPurchases
      .filter(p => {
        const date = new Date(p.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

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

    // Count unique video purchasers
    const uniqueVideoPurchasers = [...new Set(videoPurchases.map(p => p.userId))];

    res.json({
      success: true,
      earnings: {
        total: totalEarned,
        monthly: monthlyEarnings,
        supportEarnings: totalEarned - totalVideoEarnings,
        videoEarnings: totalVideoEarnings,
        supporterCount: Object.keys(supporters).length,
        videoPurchaserCount: uniqueVideoPurchasers.length,
        totalSupporters: Object.keys(supporters).length + uniqueVideoPurchasers.length,
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

// ─── GET SUPPORT STATS (Admin) ────────────────────────────────────
// @desc    Get support statistics (Admin only)
// @route   GET /api/support/stats
// @access  Private/Admin
const getSupportStats = async (req, res) => {
  try {
    const allSupports = await prisma.support.findMany();
    const allVideoPurchases = await prisma.videoPurchase.findMany();

    const totalRevenue = allSupports.reduce((sum, s) => sum + s.amount, 0) + 
                         allVideoPurchases.reduce((sum, p) => sum + p.amount, 0);
    const totalCoupleShare = allSupports.reduce((sum, s) => sum + s.coupleAmount, 0) +
                             allVideoPurchases.reduce((sum, p) => sum + p.amount, 0);
    const totalPlatformShare = allSupports.reduce((sum, s) => sum + s.platformAmount, 0);
    const totalSupporters = [...new Set(allSupports.map(s => s.userId))].length;
    const totalPurchasers = [...new Set(allVideoPurchases.map(p => p.userId))].length;
    const totalSupportedCouples = [...new Set(allSupports.map(s => s.coupleId))].length;

    // Monthly breakdown
    const monthlyData = {};
    [...allSupports, ...allVideoPurchases].forEach(record => {
      const month = new Date(record.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { 
          supportAmount: 0, 
          purchaseAmount: 0, 
          total: 0, 
          count: 0 
        };
      }
      if (record.amount) {
        monthlyData[month].total += record.amount;
        monthlyData[month].count++;
        if (record.purchaseType) {
          monthlyData[month].purchaseAmount += record.amount;
        } else {
          monthlyData[month].supportAmount += record.amount;
        }
      }
    });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalCoupleShare,
        totalPlatformShare,
        totalSupporters,
        totalPurchasers,
        totalSupportedCouples,
        totalTransactions: allSupports.length + allVideoPurchases.length,
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

// ─── GET TOP SUPPORTED COUPLES ────────────────────────────────────
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

// ─── GET SUPPORT BY ID ────────────────────────────────────────────
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