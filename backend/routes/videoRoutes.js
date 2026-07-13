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
  likeVideo,
  purchaseVideo,
  checkVideoAccess
} = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ─── PUBLIC ROUTES ────────────────────────────────────────────────
// Anyone can view videos (premium ones require login for access)
router.get('/', getAllVideos);
router.get('/couple/:coupleId', getVideosByCouple);
router.get('/:id', getVideoById);

// ─── PROTECTED ROUTES ─────────────────────────────────────────────
// All routes below require authentication
router.use(protect);

// ─── VIDEO ACCESS & PURCHASE ─────────────────────────────────────
// Check if user has access to a video (for premium/support videos)
router.get('/:id/access', checkVideoAccess);

// Purchase premium video access
router.post('/:id/purchase', purchaseVideo);

// Like a video
router.put('/:id/like', likeVideo);

// ─── VIDEO UPLOAD & MANAGEMENT ───────────────────────────────────
// Only couples and admins can upload videos
router.post('/', authorize('COUPLE', 'ADMIN'), uploadVideo);

// Get videos uploaded by the current user (creator/couple)
router.get('/my-videos', getMyVideos);

// Update video (couple who owns it or admin)
router.put('/:id', authorize('COUPLE', 'ADMIN'), updateVideo);

// Delete video (couple who owns it or admin)
router.delete('/:id', authorize('COUPLE', 'ADMIN'), deleteVideo);

// ─── ADMIN ONLY ROUTES ────────────────────────────────────────────
// Get all pending videos for admin review
router.get('/admin/pending', authorize('ADMIN'), getPendingVideos);

// Approve a video (makes it public)
router.put('/:id/approve', authorize('ADMIN'), approveVideo);

// Reject a video with reason
router.put('/:id/reject', authorize('ADMIN'), rejectVideo);

// Feature or unfeature a video
router.put('/:id/feature', authorize('ADMIN'), featureVideo);

module.exports = router;