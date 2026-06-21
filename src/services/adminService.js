// src/services/adminService.js
import api from './api';

// Note: Since api now exports individual functions, we need to import them differently
// Or we can use the default export

const adminService = {
  // ============ DASHBOARD ============
  getDashboard: async () => {
    try {
      const response = await api.getAdminDashboard();
      return response;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  // ============ USER MANAGEMENT ============
  getUsers: async (page = 1, limit = 50, filters = {}) => {
    try {
      const response = await api.getAllUsers(page, limit, filters);
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await api.updateUserRole(userId, role);
      return response;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const response = await api.toggleUserStatus(userId);
      return response;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.deleteUser(userId);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // ============ BOOKING MANAGEMENT ============
  getBookings: async (page = 1, limit = 50, status = null) => {
    try {
      const response = await api.getAllBookings(page, limit, status);
      return response;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status, totalAmount = null) => {
    try {
      const response = await api.updateBookingStatusAdmin(bookingId, status, totalAmount);
      return response;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  deleteBooking: async (bookingId) => {
    try {
      const response = await api.deleteBooking(bookingId);
      return response;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  // ============ VIDEO MANAGEMENT ============
  getVideos: async (page = 1, limit = 50, status = null) => {
    try {
      const response = await api.getAllVideos(page, limit, status);
      return response;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  approveVideo: async (videoId) => {
    try {
      const response = await api.approveVideoAdmin(videoId);
      return response;
    } catch (error) {
      console.error('Error approving video:', error);
      throw error;
    }
  },

  rejectVideo: async (videoId, reason = '') => {
    try {
      const response = await api.rejectVideo(videoId, reason);
      return response;
    } catch (error) {
      console.error('Error rejecting video:', error);
      throw error;
    }
  },

  featureVideo: async (videoId) => {
    try {
      const response = await api.featureVideo(videoId);
      return response;
    } catch (error) {
      console.error('Error featuring video:', error);
      throw error;
    }
  },

  deleteVideo: async (videoId) => {
    try {
      const response = await api.deleteVideo(videoId);
      return response;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  // ============ SUPPORT MANAGEMENT ============
  getSupports: async () => {
    try {
      const response = await api.getAllSupports();
      return response;
    } catch (error) {
      console.error('Error fetching supports:', error);
      throw error;
    }
  },

  // ============ PAYMENT MANAGEMENT ============
  getPayments: async () => {
    try {
      const response = await api.getAllPayments();
      return response;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // ============ POST MANAGEMENT ============
  getPosts: async () => {
    try {
      const response = await api.getAllPosts();
      return response;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.deletePostAdmin(postId);
      return response;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // ============ NOTIFICATIONS ============
  getAdminNotifications: async () => {
    try {
      const response = await api.getAdminNotifications();
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.markAdminNotificationRead(notificationId);
      return response;
    } catch (error) {
      console.error('Error marking notification read:', error);
      throw error;
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const response = await api.markAllAdminNotificationsRead();
      return response;
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      throw error;
    }
  },

  // ============ BROADCAST ============
  sendBroadcast: async (data) => {
    try {
      const response = await api.sendBroadcast(data);
      return response;
    } catch (error) {
      console.error('Error sending broadcast:', error);
      throw error;
    }
  },

  // ============ SETTINGS ============
  getSettings: async () => {
    try {
      const response = await api.getSettings();
      return response;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await api.updateSettings(settings);
      return response;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // ============ AUDIT LOGS ============
  getAuditLogs: async () => {
    try {
      const response = await api.getAuditLogs();
      return response;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // ============ EXPORT ============
  exportData: async (type) => {
    try {
      const response = await api.exportData(type);
      return response;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
};

export default adminService;