// backend/controllers/coupleController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get logged-in couple's own profile
// @route   GET /api/couples/profile
// @access  Private (COUPLE)
const getMyCoupleProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const couple = await prisma.coupleProfile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, phone: true, avatar: true
          }
        }
      }
    });

    if (!couple) {
      return res.status(404).json({
        success: false,
        message: 'Couple profile not found'
      });
    }

    res.json({ success: true, couple });
  } catch (error) {
    console.error('Get my couple profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching couple profile'
    });
  }
};

// @desc    Update logged-in couple's profile
// @route   PUT /api/couples/profile
// @access  Private (COUPLE)
const updateMyCoupleProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      brideName, groomName, coupleName, weddingDate, location, bio,
      instagram, tiktok, youtube, facebook, whatsapp,
      profileImage, coverImage, pageVisibility, contentPermission
    } = req.body;

    const couple = await prisma.coupleProfile.update({
      where: { userId: parseInt(userId) },
      data: {
        brideName: brideName || undefined,
        groomName: groomName || undefined,
        coupleName: coupleName || undefined,
        weddingDate: weddingDate ? new Date(weddingDate) : undefined,
        location: location || undefined,
        bio: bio || undefined,
        instagram: instagram || undefined,
        tiktok: tiktok || undefined,
        youtube: youtube || undefined,
        facebook: facebook || undefined,
        whatsapp: whatsapp || undefined,
        profileImage: profileImage || undefined,
        coverImage: coverImage || undefined,
        pageVisibility: pageVisibility || undefined,
        contentPermission: contentPermission || undefined
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true }
        }
      }
    });

    res.json({ success: true, couple });
  } catch (error) {
    console.error('Update couple profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating couple profile'
    });
  }
};

// @desc    Get couple by ID
// @route   GET /api/couples/:id
// @access  Public
const getCoupleById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupleId = parseInt(id);

    const couple = await prisma.coupleProfile.findUnique({
      where: { id: coupleId },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, phone: true, avatar: true
          }
        }
      }
    });

    if (!couple) {
      return res.status(404).json({
        success: false,
        message: 'Couple not found'
      });
    }

    res.json({ success: true, couple });
  } catch (error) {
    console.error('Get couple error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching couple'
    });
  }
};

// @desc    Get videos for a couple
// @route   GET /api/couples/:id/videos
// @access  Public
const getCoupleVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const coupleId = parseInt(id);

    const videos = await prisma.video.findMany({
      where: {
        coupleId: coupleId,
        status: { in: ['PUBLISHED', 'APPROVED'] }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: videos.length, videos });
  } catch (error) {
    console.error('Get couple videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching videos'
    });
  }
};

// @desc    Get support stats for a couple
// @route   GET /api/couples/:id/support-stats
// @access  Public
const getCoupleSupportStats = async (req, res) => {
  try {
    const { id } = req.params;
    const coupleId = parseInt(id);

    const supports = await prisma.support.findMany({
      where: { coupleId: coupleId }
    });

    const totalAmount = supports.reduce((sum, s) => sum + s.amount, 0);
    const coupleAmount = supports.reduce((sum, s) => sum + (s.coupleAmount || s.amount * 0.6), 0);
    const platformAmount = supports.reduce((sum, s) => sum + (s.platformAmount || s.amount * 0.4), 0);

    res.json({
      success: true,
      stats: {
        count: supports.length,
        totalAmount,
        coupleAmount,
        platformAmount,
        supporters: [...new Set(supports.map(s => s.userId))].length
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

// @desc    Get couple gallery
// @route   GET /api/couples/:id/gallery
// @access  Public
const getCoupleGallery = async (req, res) => {
  try {
    const coupleId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(coupleId)) {
      return res.status(400).json({ success: false, message: 'Invalid couple ID' });
    }

    const gallery = await prisma.coupleGalleryImage.findMany({
      where: { coupleId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, imageData: true, caption: true, createdAt: true }
    });

    res.json({ success: true, gallery });
  } catch (error) {
    console.error('Get couple gallery error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching gallery' });
  }
};

// @desc    Add gallery image (logged-in couple only)
// @route   POST /api/couples/gallery
// @access  Private (COUPLE)
const addCoupleGalleryImage = async (req, res) => {
  try {
    const { imageData, caption } = req.body;
    if (typeof imageData !== 'string' || !/^data:image\/(?:jpeg|png|webp);base64,/i.test(imageData)) {
      return res.status(400).json({ success: false, message: 'Upload a JPEG, PNG, or WebP image.' });
    }
    if (imageData.length > 4_200_000) {
      return res.status(413).json({ success: false, message: 'Image must be smaller than 3 MB.' });
    }
    if (caption != null && (typeof caption !== 'string' || caption.length > 120)) {
      return res.status(400).json({ success: false, message: 'Caption must be 120 characters or fewer.' });
    }

    const couple = await prisma.coupleProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });
    if (!couple) {
      return res.status(404).json({ success: false, message: 'Couple profile not found.' });
    }

    const image = await prisma.coupleGalleryImage.create({
      data: { coupleId: couple.id, imageData, caption: caption?.trim() || null },
      select: { id: true, imageData: true, caption: true, createdAt: true }
    });
    res.status(201).json({ success: true, image });
  } catch (error) {
    console.error('Add couple gallery image error:', error);
    res.status(500).json({ success: false, message: 'Server error saving gallery image' });
  }
};

// @desc    Delete gallery image
// @route   DELETE /api/couples/gallery/:imageId
// @access  Private (COUPLE)
const deleteCoupleGalleryImage = async (req, res) => {
  try {
    const imageId = Number.parseInt(req.params.imageId, 10);
    if (!Number.isInteger(imageId)) {
      return res.status(400).json({ success: false, message: 'Invalid gallery image ID' });
    }

    const couple = await prisma.coupleProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });
    if (!couple) {
      return res.status(404).json({ success: false, message: 'Couple profile not found.' });
    }

    const image = await prisma.coupleGalleryImage.findFirst({
      where: { id: imageId, coupleId: couple.id },
      select: { id: true }
    });
    if (!image) {
      return res.status(404).json({ success: false, message: 'Gallery image not found.' });
    }

    await prisma.coupleGalleryImage.delete({ where: { id: image.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete couple gallery image error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting gallery image' });
  }
};

module.exports = {
  getMyCoupleProfile,
  updateMyCoupleProfile,
  getCoupleById,
  getCoupleVideos,
  getCoupleSupportStats,
  getCoupleGallery,
  addCoupleGalleryImage,
  deleteCoupleGalleryImage
};