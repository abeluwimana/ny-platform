// backend/controllers/videoController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to convert YouTube URL to embed URL
const convertToEmbedUrl = (url) => {
  if (!url) return null;
  
  if (url.includes('/embed/')) return url;
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

// Helper to map event type to enum
const mapEventType = (type) => {
  const typeMap = {
    'wedding': 'WEDDING',
    'dote': 'DOTE',
    'birthday': 'BIRTHDAY',
    'funeral': 'FUNERAL',
    'graduation': 'GRADUATION',
    'corporate': 'CORPORATE'
  };
  return typeMap[type] || 'OTHER';
};

// Helper to map access type
const mapAccessType = (type) => {
  const typeMap = {
    'free': 'FREE',
    'premium': 'PREMIUM',
    'support': 'SUPPORT'
  };
  return typeMap[type] || 'FREE';
};

// ─── UPLOAD VIDEO (Couple or Admin ONLY) ─────────────────────────
// @desc    Upload video (Couple or Admin only)
// @route   POST /api/videos
// @access  Private (COUPLE or ADMIN)
const uploadVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      videoUrl,
      thumbnail,
      coupleId,
      eventType,
      accessType,
      supportAmount,
      price,
      creatorId,
      creatorName
    } = req.body;

    // Validation
    if (!title || !videoUrl || !coupleId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, video URL, and couple ID'
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // ONLY Couples or Admins can upload videos
    if (userRole !== 'COUPLE' && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only couples and admins can upload videos'
      });
    }

    // If user is COUPLE, verify they own the couple profile
    if (userRole === 'COUPLE') {
      const coupleProfile = await prisma.coupleProfile.findUnique({
        where: { userId: parseInt(userId) }
      });

      if (!coupleProfile) {
        return res.status(404).json({
          success: false,
          message: 'Couple profile not found'
        });
      }

      // If coupleId provided, verify it matches
      if (coupleId && coupleProfile.id !== parseInt(coupleId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only upload videos for your own couple profile'
        });
      }
    }

    // Validate access type
    if (accessType === 'PREMIUM' && !price) {
      return res.status(400).json({
        success: false,
        message: 'Price is required for premium videos'
      });
    }

    if (accessType === 'SUPPORT' && !supportAmount) {
      return res.status(400).json({
        success: false,
        message: 'Support amount is required for support-based videos'
      });
    }

    const embedUrl = convertToEmbedUrl(videoUrl);

    const video = await prisma.video.create({
      data: {
        title,
        description: description || '',
        videoUrl: embedUrl,
        thumbnail: thumbnail || '',
        coupleId: parseInt(coupleId),
        uploadedBy: parseInt(userId),
        eventType: mapEventType(eventType || 'wedding'),
        accessType: mapAccessType(accessType || 'free'),
        price: price ? parseFloat(price) : null,
        supportAmount: supportAmount ? parseFloat(supportAmount) : null,
        status: 'PENDING',
        creatorId: creatorId ? parseInt(creatorId) : null,
        creatorName: creatorName || null
      },
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

    // Create notification for admin
    await prisma.notification.create({
      data: {
        title: 'New Video Uploaded',
        message: `A new video "${title}" has been uploaded and needs approval`,
        type: 'VIDEO_APPROVED',
        userId: 1,
        relatedId: video.id,
        link: `/admin/videos/${video.id}`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully! Awaiting admin approval.',
      video
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading video'
    });
  }
};

// ─── GET ALL VIDEOS ──────────────────────────────────────────────
// @desc    Get all videos with access control
// @route   GET /api/videos
// @access  Public
const getAllVideos = async (req, res) => {
  try {
    const { status, featured, limit = 20, page = 1 } = req.query;
    const userId = req.user?.id;
    
    const where = {};
    
    // Only show APPROVED or PUBLISHED videos for public
    if (req.user?.role === 'ADMIN' && status === 'pending') {
      where.status = 'PENDING';
    } else {
      where.status = { in: ['APPROVED', 'PUBLISHED'] };
    }
    
    if (featured === 'true') {
      where.isFeatured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videos = await prisma.video.findMany({
      where,
      include: {
        couple: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        supports: {
          select: {
            amount: true,
            coupleAmount: true,
            platformAmount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    // Check user purchases for premium access
    let userPurchases = [];
    if (userId) {
      userPurchases = await prisma.videoPurchase.findMany({
        where: { userId: parseInt(userId) }
      });
    }
    const purchasedIds = new Set(userPurchases.map(p => p.videoId));

    // Calculate stats and access
    const videosWithStats = videos.map(video => {
      const totalSupport = video.supports.reduce((sum, s) => sum + s.amount, 0);
      const totalCoupleShare = video.supports.reduce((sum, s) => sum + s.coupleAmount, 0);
      const totalPlatformShare = video.supports.reduce((sum, s) => sum + s.platformAmount, 0);
      
      let hasAccess = video.accessType === 'FREE';
      if (userId) {
        hasAccess = video.accessType === 'FREE' || purchasedIds.has(video.id);
      }

      return {
        ...video,
        totalSupport,
        totalCoupleShare,
        totalPlatformShare,
        supporterCount: video.supports.length,
        hasAccess
      };
    });

    res.json({
      success: true,
      count: videosWithStats.length,
      videos: videosWithStats
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching videos'
    });
  }
};

// ─── GET VIDEO BY ID ─────────────────────────────────────────────
// @desc    Get video by ID with access check
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);
    const userId = req.user?.id;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        couple: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        },
        supports: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        purchases: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if video is pending (only admin can see)
    if (video.status === 'PENDING') {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) }
      });
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'This video is pending approval'
        });
      }
    }

    // Check access for premium/support videos
    let hasAccess = video.accessType === 'FREE';
    let purchaseInfo = null;

    if (userId && video.accessType !== 'FREE') {
      const purchase = await prisma.videoPurchase.findUnique({
        where: {
          userId_videoId: {
            userId: parseInt(userId),
            videoId: videoId
          }
        }
      });

      if (purchase) {
        hasAccess = true;
        purchaseInfo = purchase;
      }
    }

    // Increment views
    await prisma.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } }
    });

    const totalSupport = video.supports.reduce((sum, s) => sum + s.amount, 0);
    const totalCoupleShare = video.supports.reduce((sum, s) => sum + s.coupleAmount, 0);
    const totalPlatformShare = video.supports.reduce((sum, s) => sum + s.platformAmount, 0);

    res.json({
      success: true,
      video: {
        ...video,
        totalSupport,
        totalCoupleShare,
        totalPlatformShare,
        supporterCount: video.supports.length,
        hasAccess,
        purchaseInfo
      }
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching video'
    });
  }
};

// ─── PURCHASE VIDEO ──────────────────────────────────────────────
// @desc    Purchase premium video
// @route   POST /api/videos/:id/purchase
// @access  Private
const purchaseVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const video = await prisma.video.findUnique({
      where: { id: parseInt(id) },
      include: {
        couple: true
      }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

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
          videoId: parseInt(id)
        }
      }
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You already have access to this video'
      });
    }

    const amount = video.price || video.supportAmount || 0;

    // Create purchase record
    const purchase = await prisma.videoPurchase.create({
      data: {
        userId: parseInt(userId),
        videoId: parseInt(id),
        amount: amount,
        purchaseType: 'PURCHASE'
      }
    });

    // Update video earnings
    await prisma.video.update({
      where: { id: parseInt(id) },
      data: {
        totalEarnings: { increment: amount },
        totalPurchases: { increment: 1 }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        title: 'Video Purchased',
        message: `You have purchased access to "${video.title}"`,
        type: 'PURCHASE',
        userId: parseInt(userId),
        relatedId: purchase.id,
        link: `/video/${video.id}`
      }
    });

    // Notify the couple
    await prisma.notification.create({
      data: {
        title: 'New Video Purchase',
        message: `Someone purchased access to your video "${video.title}"`,
        type: 'PURCHASE',
        userId: video.couple.userId,
        relatedId: purchase.id
      }
    });

    res.json({
      success: true,
      message: 'Video purchased successfully!',
      purchase
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
// @desc    Check if user has access to video
// @route   GET /api/videos/:id/access
// @access  Private
const checkVideoAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const video = await prisma.video.findUnique({
      where: { id: parseInt(id) }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.accessType === 'FREE') {
      return res.json({
        success: true,
        hasAccess: true,
        accessType: 'FREE'
      });
    }

    const purchase = await prisma.videoPurchase.findUnique({
      where: {
        userId_videoId: {
          userId: parseInt(userId),
          videoId: parseInt(id)
        }
      }
    });

    res.json({
      success: true,
      hasAccess: !!purchase,
      accessType: video.accessType,
      purchase
    });
  } catch (error) {
    console.error('Check video access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking access'
    });
  }
};

// ─── GET MY VIDEOS (Creator) ─────────────────────────────────────
// @desc    Get videos uploaded by creator
// @route   GET /api/videos/creator/my
// @access  Private (Creator)
const getMyVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { userId: req.user.id },
      include: {
        couple: {
          select: {
            id: true,
            groomName: true,
            brideName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Get my videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your videos'
    });
  }
};

// ─── GET VIDEOS BY COUPLE ────────────────────────────────────────
// @desc    Get videos by couple
// @route   GET /api/videos/couple/:coupleId
// @access  Public
const getVideosByCouple = async (req, res) => {
  try {
    const { coupleId } = req.params;

    const videos = await prisma.video.findMany({
      where: { 
        coupleId: parseInt(coupleId),
        status: { in: ['APPROVED', 'PUBLISHED'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Get couple videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching couple videos'
    });
  }
};

// ─── PENDING VIDEOS (Admin) ──────────────────────────────────────
// @desc    Get pending videos
// @route   GET /api/videos/pending
// @access  Private/Admin
const getPendingVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { status: 'PENDING' },
      include: {
        couple: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Get pending videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending videos'
    });
  }
};

// ─── APPROVE VIDEO (Admin) ───────────────────────────────────────
// @desc    Approve video
// @route   PUT /api/videos/:id/approve
// @access  Private/Admin
const approveVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);

    const video = await prisma.video.update({
      where: { id: videoId },
      data: { status: 'APPROVED' },
      include: {
        couple: {
          include: {
            user: true
          }
        }
      }
    });

    // Notify the couple
    await prisma.notification.create({
      data: {
        title: 'Video Approved!',
        message: `Your video "${video.title}" has been approved and is now live!`,
        type: 'VIDEO_APPROVED',
        userId: video.couple.userId,
        relatedId: videoId,
        link: `/video/${video.id}`
      }
    });

    res.json({
      success: true,
      message: 'Video approved successfully',
      video
    });
  } catch (error) {
    console.error('Approve video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving video'
    });
  }
};

// ─── REJECT VIDEO (Admin) ────────────────────────────────────────
// @desc    Reject video
// @route   PUT /api/videos/:id/reject
// @access  Private/Admin
const rejectVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);
    const { reason } = req.body;

    const video = await prisma.video.update({
      where: { id: videoId },
      data: { status: 'REJECTED' },
      include: {
        couple: {
          include: {
            user: true
          }
        }
      }
    });

    // Notify the couple
    await prisma.notification.create({
      data: {
        title: 'Video Rejected',
        message: `Your video "${video.title}" was rejected. Reason: ${reason || 'Please contact support.'}`,
        type: 'VIDEO_REJECTED',
        userId: video.couple.userId,
        relatedId: videoId
      }
    });

    res.json({
      success: true,
      message: 'Video rejected',
      video
    });
  } catch (error) {
    console.error('Reject video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting video'
    });
  }
};

// ─── FEATURE VIDEO (Admin) ──────────────────────────────────────
// @desc    Feature/Unfeature video
// @route   PUT /api/videos/:id/feature
// @access  Private/Admin
const featureVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);

    const video = await prisma.video.findUnique({
      where: { id: videoId }
    });

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: { isFeatured: !video.isFeatured }
    });

    res.json({
      success: true,
      message: updatedVideo.isFeatured ? 'Video featured' : 'Video unfeatured',
      video: updatedVideo
    });
  } catch (error) {
    console.error('Feature video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating video feature'
    });
  }
};

// ─── UPDATE VIDEO ─────────────────────────────────────────────────
// @desc    Update video (Couple or Admin)
// @route   PUT /api/videos/:id
// @access  Private (Couple/Admin)
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);
    const {
      title,
      description,
      thumbnail,
      eventType,
      accessType,
      price,
      supportAmount
    } = req.body;

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        couple: true
      }
    });

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check permissions: Only the couple who owns it or admin
    const userId = req.user.id;
    const userRole = req.user.role;
    const isCoupleOwner = existingVideo.couple.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isCoupleOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the couple or admin can update this video.'
      });
    }

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        title: title || undefined,
        description: description || undefined,
        thumbnail: thumbnail || undefined,
        eventType: eventType ? mapEventType(eventType) : undefined,
        accessType: accessType ? mapAccessType(accessType) : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        supportAmount: supportAmount !== undefined ? parseFloat(supportAmount) : undefined
      }
    });

    res.json({
      success: true,
      message: 'Video updated successfully',
      video: updatedVideo
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating video'
    });
  }
};

// ─── DELETE VIDEO ─────────────────────────────────────────────────
// @desc    Delete video (Couple or Admin)
// @route   DELETE /api/videos/:id
// @access  Private (Couple/Admin)
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        couple: true
      }
    });

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const isCoupleOwner = existingVideo.couple.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isCoupleOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the couple or admin can delete this video.'
      });
    }

    await prisma.video.delete({
      where: { id: videoId }
    });

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting video'
    });
  }
};

// ─── LIKE VIDEO ───────────────────────────────────────────────────
// @desc    Like video
// @route   PUT /api/videos/:id/like
// @access  Private
const likeVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);

    const video = await prisma.video.update({
      where: { id: videoId },
      data: { likes: { increment: 1 } }
    });

    res.json({
      success: true,
      likes: video.likes
    });
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error liking video'
    });
  }
};

module.exports = {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  approveVideo,
  rejectVideo,
  featureVideo,
  getPendingVideos,
  getVideosByCouple,
  getMyVideos,
  likeVideo,
  purchaseVideo,
  checkVideoAccess
};