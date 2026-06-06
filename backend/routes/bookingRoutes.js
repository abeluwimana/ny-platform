// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(protect);

// Get user's own bookings
router.get('/my-bookings', getMyBookings);

// Admin only routes
router.get('/', authorize('ADMIN'), getAllBookings);
router.put('/:id/status', authorize('ADMIN'), updateBookingStatus);

// User routes
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;