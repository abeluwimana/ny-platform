// src/services/adminService.js
import api from './api';

const adminService = {
  // ============ DASHBOARD ============
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  getRevenueAnalytics: async (period = 'month') => {
    try {
      const response = await api.get('/admin/revenue', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  },

  // ============ USER MANAGEMENT ============
  getUsers: async (page = 1, limit = 50, filters = {}) => {
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // ============ BOOKING MANAGEMENT ============
  getBookings: async (page = 1, limit = 50, status = null) => {
    try {
      const response = await api.get('/admin/bookings', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status, totalAmount = null) => {
    try {
      const response = await api.put(`/admin/bookings/${bookingId}/status`, {
        status,
        totalAmount
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  deleteBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  // ============ VIDEO MANAGEMENT ============
  getVideos: async (page = 1, limit = 50, status = null) => {
    try {
      const response = await api.get('/admin/videos', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  getVideoById: async (videoId) => {
    try {
      const response = await api.get(`/admin/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  approveVideo: async (videoId) => {
    try {
      const response = await api.put(`/admin/videos/${videoId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving video:', error);
      throw error;
    }
  },

  rejectVideo: async (videoId, reason = '') => {
    try {
      const response = await api.put(`/admin/videos/${videoId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting video:', error);
      throw error;
    }
  },

  featureVideo: async (videoId) => {
    try {
      const response = await api.put(`/admin/videos/${videoId}/feature`);
      return response.data;
    } catch (error) {
      console.error('Error featuring video:', error);
      throw error;
    }
  },

  deleteVideo: async (videoId) => {
    try {
      const response = await api.delete(`/admin/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  // ============ SUPPORT MANAGEMENT ============
  getSupports: async () => {
    try {
      const response = await api.get('/admin/supports');
      return response.data;
    } catch (error) {
      console.error('Error fetching supports:', error);
      throw error;
    }
  },

  // ============ PAYMENT MANAGEMENT ============
  getPayments: async () => {
    try {
      const response = await api.get('/admin/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  getPaymentStats: async () => {
    try {
      const response = await api.get('/admin/payments/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },

  // ============ POST MANAGEMENT ============
  getPosts: async () => {
    try {
      const response = await api.get('/admin/posts');
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // ============ NOTIFICATIONS ============
  getAdminNotifications: async () => {
    try {
      const response = await api.get('/admin/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.put(`/admin/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification read:', error);
      throw error;
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const response = await api.put('/admin/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      throw error;
    }
  },

  // ============ BROADCAST ============
  sendBroadcast: async (data) => {
    try {
      const response = await api.post('/admin/broadcast', data);
      return response.data;
    } catch (error) {
      console.error('Error sending broadcast:', error);
      throw error;
    }
  },

  // ============ SETTINGS ============
  getSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // ============ AUDIT LOGS ============
  getAuditLogs: async () => {
    try {
      const response = await api.get('/admin/audit-logs');
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // ============ REPORTS ============
  getReports: async () => {
    try {
      const response = await api.get('/admin/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  resolveReport: async (reportId) => {
    try {
      const response = await api.put(`/admin/reports/${reportId}/resolve`);
      return response.data;
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  },

  // ============ COUPLE MANAGEMENT ============
  getCouples: async (page = 1, limit = 50) => {
    try {
      const response = await api.get('/admin/couples', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching couples:', error);
      throw error;
    }
  },

  approveCouple: async (coupleId) => {
    try {
      const response = await api.put(`/admin/couples/${coupleId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving couple:', error);
      throw error;
    }
  },

  // ============ GALLERY MANAGEMENT ============
  getGalleries: async () => {
    try {
      const response = await api.get('/admin/galleries');
      return response.data;
    } catch (error) {
      console.error('Error fetching galleries:', error);
      throw error;
    }
  },

  approveGallery: async (galleryId) => {
    try {
      const response = await api.put(`/admin/galleries/${galleryId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving gallery:', error);
      throw error;
    }
  },

  deleteGallery: async (galleryId) => {
    try {
      const response = await api.delete(`/admin/galleries/${galleryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting gallery:', error);
      throw error;
    }
  },

  // ============ COMMENT MANAGEMENT ============
  getComments: async () => {
    try {
      const response = await api.get('/admin/comments');
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/admin/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // ============ MESSAGE MANAGEMENT ============
  getMessages: async () => {
    try {
      const response = await api.get('/admin/messages');
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  markMessageRead: async (messageId) => {
    try {
      const response = await api.put(`/admin/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking message read:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/admin/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // ============ HOME PAGE MANAGEMENT ============
  getHomepageSettings: async () => {
    try {
      const response = await api.get('/admin/homepage');
      return response.data;
    } catch (error) {
      console.error('Error fetching homepage settings:', error);
      throw error;
    }
  },

  updateHomepageSettings: async (settings) => {
    try {
      const response = await api.put('/admin/homepage', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating homepage settings:', error);
      throw error;
    }
  },

  // ============ EXPORT ============
  exportData: async (type) => {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // ============ MAINTENANCE ============
  toggleMaintenance: async (enabled) => {
    try {
      const response = await api.put('/admin/maintenance', { enabled });
      return response.data;
    } catch (error) {
      console.error('Error toggling maintenance:', error);
      throw error;
    }
  },

  getMaintenanceStatus: async () => {
    try {
      const response = await api.get('/admin/maintenance');
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      throw error;
    }
  }
};

export default adminService;