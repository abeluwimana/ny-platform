// backend/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const {
  uploadVideo,
  getCreatorVideos,
  getCreatorCouples,
  getAllVideos,
  getVideoById,
  getVideosByCouple,
  getMyCoupleVideos,
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
router.get('/couple/mine', protect, authorize('COUPLE'), getMyCoupleVideos);
router.get('/couple/:coupleId', getVideosByCouple);
router.get('/:id', getVideoById);

// ─── PROTECTED ROUTES ─────────────────────────────────────────────
router.use(protect);

// Creator-only video upload support
router.get('/creator/my', authorize('CREATOR'), getCreatorVideos);
router.get('/creator/couples', authorize('CREATOR'), getCreatorCouples);

// Video access & purchase
router.get('/:id/access', checkVideoAccess);
router.post('/:id/purchase', purchaseVideo);
router.put('/:id/like', likeVideo);

// Upload video (Creator, Couple, or Admin)
router.post('/', authorize('CREATOR', 'COUPLE', 'ADMIN'), uploadVideo);

// Delete video (Couple or Admin only)
router.delete('/:id', authorize('COUPLE', 'ADMIN'), deleteVideo);

// ─── ADMIN ONLY ROUTES ────────────────────────────────────────────
router.get('/admin/pending', authorize('ADMIN'), getPendingVideos);
router.put('/:id/approve', authorize('ADMIN'), approveVideo);
router.put('/:id/reject', authorize('ADMIN'), rejectVideo);
router.put('/:id/feature', authorize('ADMIN'), featureVideo);

module.exports = router;