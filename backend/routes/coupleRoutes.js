// backend/routes/coupleRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMyCoupleProfile,
  updateMyCoupleProfile,
  getCoupleById,
  getCoupleVideos,
  getCoupleSupportStats,
  getCoupleGallery,
  addCoupleGalleryImage,
  deleteCoupleGalleryImage
} = require('../controllers/coupleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ── SPECIFIC ROUTES FIRST (before /:id) ─────────────────

// Couple's own profile (logged in)
router.get('/profile', protect, authorize('COUPLE'), getMyCoupleProfile);
router.put('/profile', protect, authorize('COUPLE'), updateMyCoupleProfile);

// Couple's own gallery
router.post('/gallery', protect, authorize('COUPLE'), addCoupleGalleryImage);
router.delete('/gallery/:imageId', protect, authorize('COUPLE'), deleteCoupleGalleryImage);

// ── DYNAMIC ROUTES LAST (with :id) ──────────────────────

router.get('/:id/gallery', getCoupleGallery);
router.get('/:id/videos', getCoupleVideos);
router.get('/:id/support-stats', getCoupleSupportStats);
router.get('/:id', getCoupleById);

module.exports = router;