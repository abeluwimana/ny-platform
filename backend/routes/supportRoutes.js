// backend/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const {
  supportCouple,
  getMySupportHistory,
  getCoupleEarnings,
  getTopSupportedCouples,
  getSupportStats,
  getSupportById
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/top-couples', getTopSupportedCouples);

// Protected routes (all require authentication)
router.use(protect);

// Client only routes
router.post('/', authorize('CLIENT'), supportCouple);
router.get('/my', getMySupportHistory);

// Couple only routes
router.get('/earnings', authorize('COUPLE'), getCoupleEarnings);

// Admin only routes
router.get('/stats', authorize('ADMIN'), getSupportStats);

// General (owner/couple/admin)
router.get('/:id', getSupportById);

module.exports = router;