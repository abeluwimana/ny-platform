// backend/controllers/notificationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;
    
    const where = { userId: req.user.id };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: parseInt(offset),
      take: parseInt(limit)
    });
    
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });
    
    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });
    
    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if notification belongs to user
    if (notification.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      notification: updated
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking all as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if notification belongs to user
    if (notification.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting notification'
    });
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications/delete-all
// @access  Private
const deleteAllNotifications = async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id }
    });
    
    res.json({
      success: true,
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting notifications'
    });
  }
};

// @desc    Create custom notification (Admin only)
// @route   POST /api/notifications/admin/send
// @access  Private/Admin
const sendAdminNotification = async (req, res) => {
  try {
    const { userIds, message, type, title } = req.body;
    
    if (!message || !userIds || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide message and user IDs'
      });
    }
    
    const notifications = [];
    for (const userId of userIds) {
      const notification = await prisma.notification.create({
        data: {
          userId: parseInt(userId),
          type: type || 'MESSAGE',
          message: message,
          relatedId: null
        }
      });
      notifications.push(notification);
    }
    
    res.json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Send admin notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending notification'
    });
  }
};

// @desc    Send broadcast to all users (Admin only)
// @route   POST /api/notifications/admin/broadcast
// @access  Private/Admin
const sendBroadcast = async (req, res) => {
  try {
    const { message, type, role } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }
    
    const where = {};
    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }
    
    const users = await prisma.user.findMany({
      where,
      select: { id: true }
    });
    
    const notifications = [];
    for (const user of users) {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          type: type || 'MESSAGE',
          message: message,
          relatedId: null
        }
      });
      notifications.push(notification);
    }
    
    res.json({
      success: true,
      message: `Broadcast sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Send broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending broadcast'
    });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if notification belongs to user
    if (notification.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notification'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendAdminNotification,
  sendBroadcast,
  getNotificationById
};