// backend/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllVideos);
router.get('/couple/:coupleId', getVideosByCouple);
router.get('/:id', getVideoById);

// Protected routes
router.use(protect);

// Creator only
router.post('/', authorize('CREATOR'), uploadVideo);
router.get('/creator/my', authorize('CREATOR'), getMyVideos);
router.put('/:id/like', likeVideo);

// Creator or Admin
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

// Admin only
router.get('/admin/pending', authorize('ADMIN'), getPendingVideos);
router.put('/:id/approve', authorize('ADMIN'), approveVideo);
router.put('/:id/reject', authorize('ADMIN'), rejectVideo);
router.put('/:id/feature', authorize('ADMIN'), featureVideo);

module.exports = router;