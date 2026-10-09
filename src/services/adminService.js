// src/services/adminService.js
// SHINECONNECT Admin Service — clean single source of truth
import * as api from './api';

const adminService = {
  // ─── DASHBOARD ──────────────────────────────────────────────
  getDashboard: () => api.getAdminDashboard(),
  getStats: () => api.getAdminStats(),

  // ─── USERS ──────────────────────────────────────────────────
  getUsers: (page = 1, limit = 50, filters = {}) => api.getAllUsers(page, limit, filters),
  getUserById: (id) => api.getUserById(id),
  updateUserRole: (id, role) => api.updateUserRole(id, role),
  toggleUserStatus: (id) => api.toggleUserStatus(id),
  deleteUser: (id) => api.deleteUser(id),

  // ─── BOOKINGS ───────────────────────────────────────────────
  getBookings: (page = 1, limit = 50, status = null) => api.getAllBookings(page, limit, status),
  getBookingById: (id) => api.getBookingById(id),
  updateBookingStatus: (id, status, totalAmount = null) =>
    api.updateBookingStatusAdmin(id, status, totalAmount),
  assignCreator: (bookingId, creatorId) =>
    api.assignCreatorToBooking(bookingId, creatorId),
  deleteBooking: (id) => api.deleteBooking(id),

  // ─── VIDEOS ─────────────────────────────────────────────────
  getVideos: (page = 1, limit = 50, filters = {}) => {
    const status = typeof filters === 'string' ? filters : filters?.status;
    return api.getAllVideosAdmin(page, limit, status ? { status } : {});
  },
  getVideoById: (id) => api.getVideoById(id),
  approveVideo: (id) => api.approveVideoAdmin(id),
  rejectVideo: (id, reason = '') => api.rejectVideo(id, reason),
  featureVideo: (id) => api.featureVideoAdmin(id),
  deleteVideo: (id) => api.deleteVideoAdmin(id),

  // ─── SUPPORTS / PAYMENTS ────────────────────────────────────
  getSupports: () => api.getAllSupports(),
  getPayments: () => api.getAllPayments(),

  // ─── POSTS ──────────────────────────────────────────────────
  getPosts: () => api.getAllPostsAdmin(),
  deletePost: (id) => api.deletePostAdmin(id),

  // ─── COUPLES ────────────────────────────────────────────────
  getCouples: (page = 1, limit = 50) => api.getCouples(page, limit),

  // ─── MESSAGES ───────────────────────────────────────────────
  getMessages: () => api.getMessages(),
  markMessageRead: (id) => api.markMessageRead(id),
  deleteMessage: (id) => api.deleteMessage(id),

  // ─── NOTIFICATIONS ──────────────────────────────────────────
  getAdminNotifications: () => api.getAdminNotifications(),
  markNotificationRead: (id) => api.markAdminNotificationRead(id),
  markAllNotificationsRead: () => api.markAllAdminNotificationsRead(),

  // ─── BROADCAST ──────────────────────────────────────────────
  sendBroadcast: (data) => api.sendBroadcast(data),

  // ─── SETTINGS ───────────────────────────────────────────────
  getSettings: () => api.getSettings(),
  updateSettings: (s) => api.updateSettings(s),

  // ─── AUDIT / EXPORT ─────────────────────────────────────────
  getAuditLogs: () => api.getAuditLogs(),
  exportData: (type) => api.exportData(type),
};

export default adminService;