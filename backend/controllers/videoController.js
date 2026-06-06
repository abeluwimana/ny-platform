// backend/controllers/videoController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to convert YouTube URL to embed URL
const convertToEmbedUrl = (url) => {
  if (!url) return null;
  
  // Already embed format
  if (url.includes('/embed/')) return url;
  
  // youtu.be format
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // youtube.com/watch?v= format
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

// @desc    Upload video (Creator only)
// @route   POST /api/videos
// @access  Private (Creator)
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
      supportAmount
    } = req.body;

    // Validation
    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and video URL'
      });
    }

    // Check if user is creator
    if (req.user.role !== 'CREATOR') {
      return res.status(403).json({
        success: false,
        message: 'Only creators can upload videos'
      });
    }

    const embedUrl = convertToEmbedUrl(videoUrl);

    const video = await prisma.video.create({
      data: {
        title,
        description: description || '',
        videoUrl: embedUrl,
        thumbnail: thumbnail || '',
        userId: req.user.id,
        coupleId: coupleId ? parseInt(coupleId) : null,
        eventType: mapEventType(eventType || 'wedding'),
        accessType: mapAccessType(accessType || 'free'),
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully, pending admin approval',
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

// @desc    Get all videos (public)
// @route   GET /api/videos
// @access  Public
const getAllVideos = async (req, res) => {
  try {
    const { status, featured, limit = 20, page = 1 } = req.query;
    
    const where = { status: 'APPROVED' };
    
    if (status === 'pending' && req.user?.role === 'ADMIN') {
      where.status = 'PENDING';
    }
    
    if (featured === 'true') {
      where.isPremium = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videos = await prisma.video.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            creatorProfile: true
          }
        },
        couple: {
          select: {
            id: true,
            groomName: true,
            brideName: true,
            location: true
          }
        },
        supports: {
          select: {
            amount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    // Calculate support totals
    const videosWithStats = videos.map(video => ({
      ...video,
      totalSupport: video.supports.reduce((sum, s) => sum + s.amount, 0),
      supporterCount: video.supports.length
    }));

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

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            creatorProfile: true
          }
        },
        couple: {
          select: {
            id: true,
            groomName: true,
            brideName: true,
            location: true,
            story: true
          }
        },
        supports: {
          select: {
            amount: true,
            user: {
              select: {
                name: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
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

    // Increment view count
    await prisma.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } }
    });

    const totalSupport = video.supports.reduce((sum, s) => sum + s.amount, 0);
    const supporterCount = video.supports.length;

    res.json({
      success: true,
      video: {
        ...video,
        totalSupport,
        supporterCount
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

// @desc    Update video (Creator or Admin)
// @route   PUT /api/videos/:id
// @access  Private (Creator/Admin)
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);
    const {
      title,
      description,
      thumbnail,
      coupleId,
      eventType,
      accessType,
      supportAmount
    } = req.body;

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check permissions
    const isOwner = existingVideo.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        title: title || undefined,
        description: description || undefined,
        thumbnail: thumbnail || undefined,
        coupleId: coupleId ? parseInt(coupleId) : undefined,
        eventType: eventType ? mapEventType(eventType) : undefined,
        accessType: accessType ? mapAccessType(accessType) : undefined
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

// @desc    Delete video (Creator or Admin)
// @route   DELETE /api/videos/:id
// @access  Private (Creator/Admin)
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const isOwner = existingVideo.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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

// @desc    Approve video (Admin only)
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
        user: true,
        couple: true
      }
    });

    // Create notification for creator
    await prisma.notification.create({
      data: {
        userId: video.userId,
        type: 'VIDEO_APPROVED',
        message: `Your video "${video.title}" has been approved and published!`,
        relatedId: videoId
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

// @desc    Reject video (Admin only)
// @route   PUT /api/videos/:id/reject
// @access  Private/Admin
const rejectVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);
    const { reason } = req.body;

    const video = await prisma.video.update({
      where: { id: videoId },
      data: { status: 'REJECTED' }
    });

    // Create notification for creator
    await prisma.notification.create({
      data: {
        userId: video.userId,
        type: 'VIDEO_REJECTED',
        message: `Your video "${video.title}" was rejected. Reason: ${reason || 'Please check content guidelines'}`,
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

// @desc    Feature video (Admin only)
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
      data: { isPremium: !video.isPremium }
    });

    res.json({
      success: true,
      message: updatedVideo.isPremium ? 'Video featured' : 'Video unfeatured',
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

// @desc    Get pending videos (Admin only)
// @route   GET /api/videos/pending
// @access  Private/Admin
const getPendingVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            creatorProfile: true
          }
        },
        couple: true
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

// @desc    Get videos by couple
// @route   GET /api/videos/couple/:coupleId
// @access  Public
const getVideosByCouple = async (req, res) => {
  try {
    const { coupleId } = req.params;

    const videos = await prisma.video.findMany({
      where: { 
        coupleId: parseInt(coupleId),
        status: 'APPROVED'
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

// @desc    Get videos by creator
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
        },
        supports: {
          select: {
            amount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const videosWithStats = videos.map(video => ({
      ...video,
      totalSupport: video.supports.reduce((sum, s) => sum + s.amount, 0)
    }));

    res.json({
      success: true,
      count: videosWithStats.length,
      videos: videosWithStats
    });
  } catch (error) {
    console.error('Get my videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your videos'
    });
  }
};

// @desc    Increment video likes
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
  likeVideo
};