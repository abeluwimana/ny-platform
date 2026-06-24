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

// ============ PUBLIC ROUTES (No authentication needed) ============

// Welcome email - sent during registration (PUBLIC)
router.post('/welcome', sendWelcomeEmail);

// Password reset - sent when user forgets password (PUBLIC)
router.post('/password-reset', sendPasswordReset);

// ============ PROTECTED ROUTES (Require authentication) ============

// All routes below this line require authentication
router.use(protect);

// Booking confirmation - sent to user after booking
router.post('/booking-confirmation', sendBookingConfirmation);

// Payment receipt - sent to user after payment
router.post('/payment-receipt', sendPaymentReceipt);

// Support receipt - sent to user after supporting a couple
router.post('/support-receipt', sendSupportReceipt);

// Booking status update - sent to user when booking status changes
router.post('/booking-status', sendBookingStatusUpdate);

module.exports = router;