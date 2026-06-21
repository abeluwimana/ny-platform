// backend/routes/coupleRoutes.js
const express = require('express');
const router = express.Router();
const {
  getCoupleById,
  getCoupleVideos,
  getCoupleSupportStats
} = require('../controllers/coupleController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/:id', getCoupleById);
router.get('/:id/videos', getCoupleVideos);
router.get('/:id/support-stats', getCoupleSupportStats);

module.exports = router;