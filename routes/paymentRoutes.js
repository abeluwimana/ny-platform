// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  processBookingPayment,
  processSupportPayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(protect);

// Client routes
router.post('/booking', processBookingPayment);
router.post('/support', processSupportPayment);
router.get('/my', getMyPayments);

// Admin routes
router.get('/', authorize('ADMIN'), getAllPayments);
router.get('/stats', authorize('ADMIN'), getPaymentStats);

// General (owner/admin)
router.get('/:id', getPaymentById);

module.exports = router;