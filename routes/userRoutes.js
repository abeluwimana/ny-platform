const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const prisma = req.prisma;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const prisma = req.prisma;
    const { name, phone, avatar } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, avatar }
    });
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;