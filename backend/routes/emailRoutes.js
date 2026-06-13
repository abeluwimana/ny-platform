// backend/routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const {
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendSupportReceipt,
  sendBookingStatusUpdate,
  sendPasswordReset
} = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All email routes require authentication
router.use(protect);

// User routes
router.post('/welcome', sendWelcomeEmail);
router.post('/booking-confirmation', sendBookingConfirmation);
router.post('/payment-receipt', sendPaymentReceipt);
router.post('/support-receipt', sendSupportReceipt);
router.post('/booking-status', sendBookingStatusUpdate);
router.post('/password-reset', sendPasswordReset);

module.exports = router;