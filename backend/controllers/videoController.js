// backend/controllers/videoController.js
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../utils/emailService');
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
  return typeMap[type?.toLowerCase()] || 'OTHER';
};

// Helper to map access type
const mapAccessType = (type) => {
  const typeMap = {
    'free': 'FREE',
    'premium': 'PREMIUM',
    'support': 'SUPPORT'
  };
  return typeMap[type?.toLowerCase()] || 'FREE';
};

// ─── UPLOAD VIDEO ─────────────────────────────────────────────────
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
      userId,
      creatorName
    } = req.body;

    console.log('📤 Upload Video Request:', { title, videoUrl, coupleId, userId, accessType });

    // Validation
    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and video URL'
      });
    }

    // Get the authenticated user ID
    const authUserId = req.user?.id;
    const userRole = req.user?.role;

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Use provided userId or fallback to authenticated user
    const effectiveUserId = userId || authUserId;

    console.log('👤 User ID:', effectiveUserId, 'Role:', userRole);

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: parseInt(effectiveUserId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let resolvedCoupleId = null;
    let isCoupleUpload = false;

    // If user is COUPLE, find their couple profile
    if (user.role === 'COUPLE') {
      isCoupleUpload = true;
      
      // Try to find couple profile
      let coupleProfile = await prisma.coupleProfile.findFirst({
        where: { userId: parseInt(effectiveUserId) }
      });

      if (!coupleProfile) {
        return res.status(404).json({
          success: false,
          message: 'Couple profile not found. Please complete your couple profile first.'
        });
      }

      resolvedCoupleId = coupleProfile.id;
    } 
    // If user is ADMIN, they can upload for any couple
    else if (user.role === 'ADMIN') {
      if (coupleId) {
        const coupleProfile = await prisma.coupleProfile.findUnique({
          where: { id: parseInt(coupleId) }
        });
        if (coupleProfile) {
          resolvedCoupleId = coupleProfile.id;
          isCoupleUpload = true;
        }
      }
      
      // If no coupleId provided, find first couple
      if (!resolvedCoupleId) {
        const firstCouple = await prisma.coupleProfile.findFirst();
        if (firstCouple) {
          resolvedCoupleId = firstCouple.id;
          isCoupleUpload = true;
        }
      }
    }

    // If not couple or admin, check if user has a couple profile
    if (!isCoupleUpload && user.role !== 'ADMIN') {
      const coupleProfile = await prisma.coupleProfile.findFirst({
        where: { userId: parseInt(effectiveUserId) }
      });
      if (coupleProfile) {
        resolvedCoupleId = coupleProfile.id;
        isCoupleUpload = true;
      }
    }

    if (!resolvedCoupleId) {
      return res.status(400).json({
        success: false,
        message: 'No couple profile found. Videos must be associated with a couple.'
      });
    }

    // Validate access type
    const mappedAccessType = mapAccessType(accessType || 'free');
    
    if (mappedAccessType === 'PREMIUM' && !price) {
      return res.status(400).json({
        success: false,
        message: 'Price is required for premium videos'
      });
    }

    if (mappedAccessType === 'SUPPORT' && !supportAmount) {
      return res.status(400).json({
        success: false,
        message: 'Support amount is required for support-based videos'
      });
    }

    const embedUrl = convertToEmbedUrl(videoUrl);

    // Create video
    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        description: description || '',
        videoUrl: embedUrl || videoUrl,
        thumbnail: thumbnail || '',
        coupleId: resolvedCoupleId,
        userId: parseInt(effectiveUserId),
        eventType: mapEventType(eventType || 'wedding'),
        accessType: mappedAccessType,
        price: price ? parseFloat(price) : null,
        supportAmount: supportAmount ? parseFloat(supportAmount) : null,
        status: 'PENDING',
        creatorName: creatorName || user.name || null,
        views: 0,
        likes: 0
      },
      include: {
        couple: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    console.log('✅ Video uploaded successfully:', video.id);

    // Notify uploader and admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'nyentertainmentrwanda@gmail.com';
    if (user.email) {
      await sendEmail(
        user.email,
        'Video Upload Received - SHINECONNECT 🎬',
        `<p>Hello ${user.name || 'there'},</p><p>Your video "${title}" has been uploaded successfully and is now pending admin review.</p><p>We will notify you once it is approved and public.</p>`
      );
    }

    await sendEmail(
      adminEmail,
      `New Video Upload: ${title}`,
      `<p>A new video was uploaded and requires review.</p><p>Title: ${title}</p><p>Uploader: ${user.name || user.email}</p><p>Video ID: ${video.id}</p>`
    );

    // Create notification for admin
    await prisma.notification.create({
      data: {
        title: 'New Video Uploaded',
        message: `A new video "${title}" has been uploaded and needs approval`,
        type: 'VIDEO_APPROVED',
        userId: 1, // Admin user ID
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
    console.error('❌ Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading video',
      error: error.message
    });
  }
};

// ─── GET ALL VIDEOS ──────────────────────────────────────────────
const getAllVideos = async (req, res) => {
  try {
    const { status, featured, limit = 20, page = 1 } = req.query;
    const userId = req.user?.id;
    
    const where = {};
    
    if (req.user?.role === 'ADMIN' && status === 'pending') {
      where.status = 'PENDING';
    } else if (userId) {
      where.OR = [
        { status: { in: ['APPROVED', 'PUBLISHED'] } },
        { userId }
      ];
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
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        supports: {
          select: {
            amount: true,
            coupleAmount: true,
            platformAmount: true
          }
        },
        purchases: true
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
        user: {
          select: { id: true, name: true, email: true, role: true }
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
      if (!userId) {
        return res.status(403).json({
          success: false,
          message: 'This video is pending approval'
        });
      }
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

    const totalSupport = video.supports.reduce((sum, s) => sum + s.amount, 0);
    const totalCoupleShare = video.supports.reduce((sum, s) => sum + s.coupleAmount, 0);
    const totalPlatformShare = video.supports.reduce((sum, s) => sum + s.platformAmount, 0);

    // Increment views (only if user has access or video is free)
    if (hasAccess || video.accessType === 'FREE') {
      await prisma.video.update({
        where: { id: videoId },
        data: { views: { increment: 1 } }
      });
    }

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

// ─── OTHER ROUTES (Keep existing) ───────────────────────────────

// Get videos by couple
const getVideosByCouple = async (req, res) => {
  try {
    const { coupleId } = req.params;

    const videos = await prisma.video.findMany({
      where: { 
        coupleId: parseInt(coupleId),
        status: { in: ['APPROVED', 'PUBLISHED'] }
      },
      include: {
        user: {
          select: { id: true, name: true }
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
    console.error('Get couple videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching couple videos'
    });
  }
};

// Like video
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

// Check video access
const checkVideoAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.json({
        success: true,
        hasAccess: false,
        accessType: 'FREE',
        message: 'Please login to access premium content'
      });
    }

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

// Purchase video
const purchaseVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to purchase'
      });
    }

    const video = await prisma.video.findUnique({
      where: { id: parseInt(id) },
      include: { couple: true }
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

// Admin: Approve video
const approveVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);

    const video = await prisma.video.update({
      where: { id: videoId },
      data: { status: 'APPROVED' },
      include: {
        couple: {
          include: { user: true }
        }
      }
    });

    // Notify the couple
    if (video.couple?.userId) {
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
    }

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

// Admin: Reject video
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
          include: { user: true }
        }
      }
    });

    // Notify the couple
    if (video.couple?.userId) {
      await prisma.notification.create({
        data: {
          title: 'Video Rejected',
          message: `Your video "${video.title}" was rejected. Reason: ${reason || 'Please contact support.'}`,
          type: 'VIDEO_REJECTED',
          userId: video.couple.userId,
          relatedId: videoId
        }
      });
    }

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

// Admin: Feature video
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

// Admin: Get pending videos
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
        },
        user: {
          select: { id: true, name: true, email: true }
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

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
      include: { couple: true }
    });

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const isCoupleOwner = existingVideo.couple?.userId === userId;
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

module.exports = {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getVideosByCouple,
  likeVideo,
  checkVideoAccess,
  purchaseVideo,
  approveVideo,
  rejectVideo,
  featureVideo,
  getPendingVideos,
  deleteVideo
};