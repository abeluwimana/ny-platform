// backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRevenueReport,
  getCreatorAnalytics,
  getCoupleAnalytics,
  getTopSupportedCouplesAnalytics,
  getVideoAnalytics,
  getBookingAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All analytics routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueReport);
router.get('/creators', getCreatorAnalytics);
router.get('/couples', getCoupleAnalytics);
router.get('/top-couples', getTopSupportedCouplesAnalytics);
router.get('/videos', getVideoAnalytics);
router.get('/bookings', getBookingAnalytics);

module.exports = router;