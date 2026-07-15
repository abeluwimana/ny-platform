// src/services/adminService.js
// SHINECONNECT Admin Service - with better error handling

import api from './api';

// Helper to handle API errors consistently
const handleApiError = (error, endpoint) => {
  console.error(`❌ Error in ${endpoint}:`, error);
  
  // Check if it's a network error
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return { 
      success: false, 
      message: 'Cannot connect to server. Please check your internet connection.',
      error: error.message
    };
  }
  
  // Check if response exists
  if (error.response) {
    console.error('📥 Response data:', error.response.data);
    console.error('📥 Response status:', error.response.status);
    return { 
      success: false, 
      message: error.response.data?.message || 'Server error',
      status: error.response.status,
      data: error.response.data
    };
  }
  
  return { 
    success: false, 
    message: error.message || 'Unknown error occurred',
    error: error.message
  };
};

const adminService = {
  // ============ DASHBOARD ============
  getDashboard: async () => {
    try {
      console.log('📤 Fetching admin dashboard...');
      const response = await api.get('/admin/dashboard');
      console.log('📥 Dashboard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard:', error);
      throw handleApiError(error, 'getDashboard');
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw handleApiError(error, 'getStats');
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
      throw handleApiError(error, 'getRevenueAnalytics');
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
      throw handleApiError(error, 'getUsers');
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw handleApiError(error, 'getUserById');
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw handleApiError(error, 'updateUserRole');
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw handleApiError(error, 'toggleUserStatus');
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw handleApiError(error, 'deleteUser');
    }
  },

  // ============ BOOKING MANAGEMENT ============
  getBookings: async (page = 1, limit = 50, status = null) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      const response = await api.get('/admin/bookings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw handleApiError(error, 'getBookings');
    }
  },

  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw handleApiError(error, 'getBookingById');
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
      throw handleApiError(error, 'updateBookingStatus');
    }
  },

  deleteBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw handleApiError(error, 'deleteBooking');
    }
  },

  // ============ VIDEO MANAGEMENT ============
  getVideos: async (page = 1, limit = 50, status = null) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      const response = await api.get('/admin/videos', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw handleApiError(error, 'getVideos');
    }
  },

  getVideoById: async (videoId) => {
    try {
      const response = await api.get(`/admin/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw handleApiError(error, 'getVideoById');
    }
  },

  approveVideo: async (videoId) => {
    try {
      const response = await api.put(`/admin/videos/${videoId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving video:', error);
      throw handleApiError(error, 'approveVideo');
    }
  },

  rejectVideo: async (videoId, reason = '') => {
    try {
      const response = await api.put(`/admin/videos/${videoId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting video:', error);
      throw handleApiError(error, 'rejectVideo');
    }
  },

  featureVideo: async (videoId) => {
    try {
      const response = await api.put(`/admin/videos/${videoId}/feature`);
      return response.data;
    } catch (error) {
      console.error('Error featuring video:', error);
      throw handleApiError(error, 'featureVideo');
    }
  },

  deleteVideo: async (videoId) => {
    try {
      const response = await api.delete(`/admin/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw handleApiError(error, 'deleteVideo');
    }
  },

  // ============ SUPPORT MANAGEMENT ============
  getSupports: async () => {
    try {
      const response = await api.get('/admin/supports');
      return response.data;
    } catch (error) {
      console.error('Error fetching supports:', error);
      throw handleApiError(error, 'getSupports');
    }
  },

  // ============ PAYMENT MANAGEMENT ============
  getPayments: async () => {
    try {
      const response = await api.get('/admin/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw handleApiError(error, 'getPayments');
    }
  },

  getPaymentStats: async () => {
    try {
      const response = await api.get('/admin/payments/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw handleApiError(error, 'getPaymentStats');
    }
  },

  // ============ POST MANAGEMENT ============
  getPosts: async () => {
    try {
      const response = await api.get('/admin/posts');
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw handleApiError(error, 'getPosts');
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw handleApiError(error, 'deletePost');
    }
  },

  // ============ NOTIFICATIONS ============
  getAdminNotifications: async () => {
    try {
      const response = await api.get('/admin/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw handleApiError(error, 'getAdminNotifications');
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.put(`/admin/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification read:', error);
      throw handleApiError(error, 'markNotificationRead');
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const response = await api.put('/admin/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      throw handleApiError(error, 'markAllNotificationsRead');
    }
  },

  // ============ BROADCAST ============
  sendBroadcast: async (data) => {
    try {
      const response = await api.post('/admin/broadcast', data);
      return response.data;
    } catch (error) {
      console.error('Error sending broadcast:', error);
      throw handleApiError(error, 'sendBroadcast');
    }
  },

  // ============ SETTINGS ============
  getSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw handleApiError(error, 'getSettings');
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw handleApiError(error, 'updateSettings');
    }
  },

  // ============ AUDIT LOGS ============
  getAuditLogs: async () => {
    try {
      const response = await api.get('/admin/audit-logs');
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw handleApiError(error, 'getAuditLogs');
    }
  },

  // ============ REPORTS ============
  getReports: async () => {
    try {
      const response = await api.get('/admin/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw handleApiError(error, 'getReports');
    }
  },

  resolveReport: async (reportId) => {
    try {
      const response = await api.put(`/admin/reports/${reportId}/resolve`);
      return response.data;
    } catch (error) {
      console.error('Error resolving report:', error);
      throw handleApiError(error, 'resolveReport');
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
      throw handleApiError(error, 'getCouples');
    }
  },

  approveCouple: async (coupleId) => {
    try {
      const response = await api.put(`/admin/couples/${coupleId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving couple:', error);
      throw handleApiError(error, 'approveCouple');
    }
  },

  // ============ GALLERY MANAGEMENT ============
  getGalleries: async () => {
    try {
      const response = await api.get('/admin/galleries');
      return response.data;
    } catch (error) {
      console.error('Error fetching galleries:', error);
      throw handleApiError(error, 'getGalleries');
    }
  },

  approveGallery: async (galleryId) => {
    try {
      const response = await api.put(`/admin/galleries/${galleryId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving gallery:', error);
      throw handleApiError(error, 'approveGallery');
    }
  },

  deleteGallery: async (galleryId) => {
    try {
      const response = await api.delete(`/admin/galleries/${galleryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting gallery:', error);
      throw handleApiError(error, 'deleteGallery');
    }
  },

  // ============ COMMENT MANAGEMENT ============
  getComments: async () => {
    try {
      const response = await api.get('/admin/comments');
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw handleApiError(error, 'getComments');
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/admin/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw handleApiError(error, 'deleteComment');
    }
  },

  // ============ MESSAGE MANAGEMENT ============
  getMessages: async () => {
    try {
      const response = await api.get('/admin/messages');
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw handleApiError(error, 'getMessages');
    }
  },

  markMessageRead: async (messageId) => {
    try {
      const response = await api.put(`/admin/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking message read:', error);
      throw handleApiError(error, 'markMessageRead');
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/admin/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw handleApiError(error, 'deleteMessage');
    }
  },

  // ============ HOME PAGE MANAGEMENT ============
  getHomepageSettings: async () => {
    try {
      const response = await api.get('/admin/homepage');
      return response.data;
    } catch (error) {
      console.error('Error fetching homepage settings:', error);
      throw handleApiError(error, 'getHomepageSettings');
    }
  },

  updateHomepageSettings: async (settings) => {
    try {
      const response = await api.put('/admin/homepage', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating homepage settings:', error);
      throw handleApiError(error, 'updateHomepageSettings');
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
      throw handleApiError(error, 'exportData');
    }
  },

  // ============ MAINTENANCE ============
  toggleMaintenance: async (enabled) => {
    try {
      const response = await api.put('/admin/maintenance', { enabled });
      return response.data;
    } catch (error) {
      console.error('Error toggling maintenance:', error);
      throw handleApiError(error, 'toggleMaintenance');
    }
  },

  getMaintenanceStatus: async () => {
    try {
      const response = await api.get('/admin/maintenance');
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      throw handleApiError(error, 'getMaintenanceStatus');
    }
  }
};

export default adminService;