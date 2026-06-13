// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendAdminNotification,
  sendBroadcast,
  getNotificationById
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(protect);

// User routes
router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.delete('/delete-all', deleteAllNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.get('/:id', getNotificationById);

// Admin only routes
router.post('/admin/send', authorize('ADMIN'), sendAdminNotification);
router.post('/admin/broadcast', authorize('ADMIN'), sendBroadcast);

module.exports = router;