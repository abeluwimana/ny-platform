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

// ─── PUBLIC ROUTES ────────────────────────────────────────────────
// Get top supported couples (leaderboard)
router.get('/top-couples', getTopSupportedCouples);

// ─── PROTECTED ROUTES ─────────────────────────────────────────────
// All routes below require authentication
router.use(protect);

// ─── CLIENT ROUTES ────────────────────────────────────────────────
// Support a couple (also unlocks premium videos)
router.post('/', authorize('CLIENT'), supportCouple);

// Get client's support history
router.get('/my', getMySupportHistory);

// ─── COUPLE ROUTES ────────────────────────────────────────────────
// Get couple's earnings (from supports + video purchases)
router.get('/earnings', authorize('COUPLE'), getCoupleEarnings);

// ─── ADMIN ROUTES ──────────────────────────────────────────────────
// Get platform-wide support statistics
router.get('/stats', authorize('ADMIN'), getSupportStats);

// ─── GENERAL ROUTES ───────────────────────────────────────────────
// Get single support by ID (owner, couple, or admin)
router.get('/:id', getSupportById);

module.exports = router;