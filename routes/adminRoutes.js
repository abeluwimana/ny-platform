// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  // User management
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  // Booking management
  getAllBookings,
  updateBookingStatus,
  // Video management
  getAllVideos,
  approveVideo,
  rejectVideo,
  featureVideo,
  // Support management
  getAllSupports,
  // Payment management
  getAllPayments,
  // Post management
  getAllPosts,
  deletePost,
  // Dashboard
  getAdminDashboard
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getAdminDashboard);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Video management
router.get('/videos', getAllVideos);
router.put('/videos/:id/approve', approveVideo);
router.put('/videos/:id/reject', rejectVideo);
router.put('/videos/:id/feature', featureVideo);

// Support management
router.get('/supports', getAllSupports);

// Payment management
router.get('/payments', getAllPayments);

// Post management
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);

module.exports = router;