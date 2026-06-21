// backend/controllers/coupleController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
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

    res.json({
      success: true,
      couple
    });
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
          select: {
            id: true,
            name: true,
            email: true
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

module.exports = {
  getCoupleById,
  getCoupleVideos,
  getCoupleSupportStats
};