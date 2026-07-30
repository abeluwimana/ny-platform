// backend/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ─── PUBLIC ROUTES ────────────────────────────────────────────────
router.get('/', getAllVideos);
router.get('/couple/:coupleId', getVideosByCouple);
router.get('/:id', getVideoById);

// ─── PROTECTED ROUTES ─────────────────────────────────────────────
router.use(protect);

// Video access & purchase
router.get('/:id/access', checkVideoAccess);
router.post('/:id/purchase', purchaseVideo);
router.put('/:id/like', likeVideo);

// Upload video (Couple or Admin only)
router.post('/', authorize('COUPLE', 'ADMIN'), uploadVideo);

// Delete video (Couple or Admin only)
router.delete('/:id', authorize('COUPLE', 'ADMIN'), deleteVideo);

// ─── ADMIN ONLY ROUTES ────────────────────────────────────────────
router.get('/admin/pending', authorize('ADMIN'), getPendingVideos);
router.put('/:id/approve', authorize('ADMIN'), approveVideo);
router.put('/:id/reject', authorize('ADMIN'), rejectVideo);
router.put('/:id/feature', authorize('ADMIN'), featureVideo);

module.exports = router;