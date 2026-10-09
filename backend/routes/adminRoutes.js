// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  // Dashboard
  getAdminDashboard,
  getAdminStats,
  // Users
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  // Bookings
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  assignCreatorToBooking,
  // Videos
  getAllVideos,
  getVideoById,
  approveVideo,
  rejectVideo,
  featureVideo,
  deleteVideo,
  // Supports
  getAllSupports,
  // Payments
  getAllPayments,
  // Posts
  getAllPosts,
  deletePost,
  // Couples
  getCouples,
  // Messages
  getMessages,
  markMessageRead,
  deleteMessage,
  // Notifications
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  // Broadcast
  sendBroadcast,
  // Settings
  getSettings,
  updateSettings,
  // Audit
  getAuditLogs,
  // Export
  exportData,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication + ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// ─── DASHBOARD ────────────────────────────────────────────────
router.get('/dashboard', getAdminDashboard);
router.get('/stats', getAdminStats);

// ─── USERS ────────────────────────────────────────────────────
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// ─── BOOKINGS ─────────────────────────────────────────────────
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/bookings/:id/assign-creator', assignCreatorToBooking);
router.delete('/bookings/:id', deleteBooking);

// ─── VIDEOS ───────────────────────────────────────────────────
router.get('/videos', getAllVideos);
router.get('/videos/:id', getVideoById);
router.put('/videos/:id/approve', approveVideo);
router.put('/videos/:id/reject', rejectVideo);
router.put('/videos/:id/feature', featureVideo);
router.delete('/videos/:id', deleteVideo);

// ─── SUPPORTS / PAYMENTS ──────────────────────────────────────
router.get('/supports', getAllSupports);
router.get('/payments', getAllPayments);

// ─── POSTS ────────────────────────────────────────────────────
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);

// ─── COUPLES ──────────────────────────────────────────────────
router.get('/couples', getCouples);

// ─── MESSAGES ─────────────────────────────────────────────────
router.get('/messages', getMessages);
router.put('/messages/:id/read', markMessageRead);
router.delete('/messages/:id', deleteMessage);

// ─── NOTIFICATIONS ────────────────────────────────────────────
router.get('/notifications', getAdminNotifications);
router.put('/notifications/read-all', markAllAdminNotificationsRead);
router.put('/notifications/:id/read', markAdminNotificationRead);

// ─── BROADCAST ────────────────────────────────────────────────
router.post('/broadcast', sendBroadcast);

// ─── SETTINGS ─────────────────────────────────────────────────
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// ─── AUDIT LOGS ───────────────────────────────────────────────
router.get('/audit-logs', getAuditLogs);

// ─── EXPORT ───────────────────────────────────────────────────
router.get('/export/:type', exportData);

module.exports = router;