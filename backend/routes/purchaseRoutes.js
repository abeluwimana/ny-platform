// backend/routes/purchaseRoutes.js
const express = require('express');
const router = express.Router();
const {
  purchaseVideo,
  checkVideoAccess,
  getMyPurchases,
  getPurchaseStats,
  getPurchaseById
} = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ─── PROTECTED ROUTES ─────────────────────────────────────────────
// All purchase routes require authentication
router.use(protect);

// ─── CLIENT ONLY ──────────────────────────────────────────────────
// Purchase a premium video (CLIENT only)
router.post('/', authorize('CLIENT'), purchaseVideo);

// Get all purchases for the logged-in client
router.get('/my', authorize('CLIENT'), getMyPurchases);

// ─── ANY USER ─────────────────────────────────────────────────────
// Check if user has access to a video (any role)
router.get('/check/:videoId', checkVideoAccess);

// ─── ADMIN ONLY ──────────────────────────────────────────────────
// Get platform-wide purchase statistics
router.get('/stats', authorize('ADMIN'), getPurchaseStats);

// ─── OWNER OR ADMIN ──────────────────────────────────────────────
// Get single purchase by ID
router.get('/:id', getPurchaseById);

module.exports = router;