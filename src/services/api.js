// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AUTH_KEYS = [
  'token', 'user_token', 'admin_token', 'couple_token', 'creator_token', 'client_token',
  'user_data', 'admin_data', 'user_logged_in', 'admin_logged_in', 'couple_logged_in',
  'creator_logged_in', 'client_logged_in', 'user_role', 'user_email', 'admin_email',
  'couple_email', 'creator_email', 'client_email', 'user_name', 'admin_name', 'couple_name',
  'creator_name', 'client_name', 'user_phone', 'user_username', 'user_bio', 'user_district',
  'user_profile_image', 'user_cover_image', 'user_social_links', 'user_notifications',
  'creator_profile', 'creator_profile_image', 'couple_name', 'creator_name'
];

// Helper to get token from localStorage
export const getToken = () => localStorage.getItem('token') ||
  localStorage.getItem('admin_token') ||
  localStorage.getItem('user_token') ||
  localStorage.getItem('couple_token') ||
  localStorage.getItem('creator_token');

export const clearStoredAuth = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const getStoredAuthState = () => {
  const token = getToken();
  const userData = localStorage.getItem('user_data') || localStorage.getItem('admin_data');
  let user = null;

  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch {
      user = null;
    }
  }

  const role = String(user?.role || localStorage.getItem('user_role') || '').toLowerCase();
  const isAuthenticated = Boolean(
    token || user || localStorage.getItem('user_logged_in') === 'true' ||
    localStorage.getItem('admin_logged_in') === 'true' ||
    localStorage.getItem('couple_logged_in') === 'true' ||
    localStorage.getItem('creator_logged_in') === 'true' ||
    localStorage.getItem('client_logged_in') === 'true'
  );

  return { token, user, role, isAuthenticated };
};

// Helper for authenticated requests
const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Helper to handle responses
const handleResponse = async (response) => {
  const rawText = await response.text();
  let data = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: rawText };
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();

      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
};

// ============ AUTH API ============

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

// Register as Couple
export const registerCouple = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register/couple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

// Register as Creator
export const registerCreator = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register/creator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(response);
};

export const googleSignIn = async (payload) => {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

// ============ BOOKING API ============

export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(bookingData)
  });
  return handleResponse(response);
};

export const getMyBookings = async () => {
  const response = await fetch(`${API_URL}/bookings/my-bookings`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getBookingById = async (id) => {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

// ============ VIDEO API ============

export const getVideos = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const response = await fetch(`${API_URL}/videos?${params}`);
  return handleResponse(response);
};

export const getAllVideos = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const response = await fetch(`${API_URL}/videos?${params}`);
  return handleResponse(response);
};

export const getVideoById = async (id) => {
  const response = await fetch(`${API_URL}/videos/${id}`);
  return handleResponse(response);
};

export const getFeaturedVideos = async () => {
  const response = await fetch(`${API_URL}/videos/featured`);
  return handleResponse(response);
};

export const getCoupleVideos = async (coupleId) => {
  const response = await fetch(`${API_URL}/videos/couple/${coupleId}`);
  return handleResponse(response);
};

export const uploadVideo = async (videoData) => {
  const response = await fetch(`${API_URL}/videos`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(videoData)
  });
  return handleResponse(response);
};

export const incrementVideoViews = async (id) => {
  const response = await fetch(`${API_URL}/videos/${id}/view`, {
    method: 'PUT'
  });
  return handleResponse(response);
};

// ============ COUPLE API ============

export const getCoupleById = async (id) => {
  const response = await fetch(`${API_URL}/couples/${id}`);
  return handleResponse(response);
};

export const getCoupleSupportStats = async (coupleId) => {
  const response = await fetch(`${API_URL}/support/couple/${coupleId}/stats`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

// ============ SUPPORT API ============

export const supportCouple = async (supportData) => {
  const response = await fetch(`${API_URL}/support`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(supportData)
  });
  return handleResponse(response);
};

export const getMySupportHistory = async () => {
  const response = await fetch(`${API_URL}/support/my`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getCoupleEarnings = async () => {
  const response = await fetch(`${API_URL}/support/earnings`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getTopSupportedCouples = async () => {
  const response = await fetch(`${API_URL}/support/top-couples`);
  return handleResponse(response);
};

// ============ CREATOR API ============

export const getTopCreators = async () => {
  const response = await fetch(`${API_URL}/creators/top`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getCreatorById = async (id) => {
  const response = await fetch(`${API_URL}/creators/${id}`);
  return handleResponse(response);
};

export const getCreatorVideos = async (creatorId) => {
  const response = await fetch(`${API_URL}/creators/${creatorId}/videos`);
  return handleResponse(response);
};

// ============ PAYMENT API ============

export const processBookingPayment = async (paymentData) => {
  const response = await fetch(`${API_URL}/payments/booking`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(paymentData)
  });
  return handleResponse(response);
};

export const processSupportPayment = async (paymentData) => {
  const response = await fetch(`${API_URL}/payments/support`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(paymentData)
  });
  return handleResponse(response);
};

export const getMyPayments = async () => {
  const response = await fetch(`${API_URL}/payments/my`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

// ============ POST API ============

export const getAllPosts = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const response = await fetch(`${API_URL}/posts?${params}`);
  return handleResponse(response);
};

export const getPostById = async (id) => {
  const response = await fetch(`${API_URL}/posts/${id}`);
  return handleResponse(response);
};

export const getRelatedPosts = async (category, excludeId) => {
  const params = new URLSearchParams({ category, exclude: excludeId });
  const response = await fetch(`${API_URL}/posts/related?${params}`);
  return handleResponse(response);
};

export const createPost = async (postData) => {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(postData)
  });
  return handleResponse(response);
};

export const updatePost = async (id, postData) => {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify(postData)
  });
  return handleResponse(response);
};

export const deletePost = async (id) => {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const likePost = async (id) => {
  const response = await fetch(`${API_URL}/posts/${id}/like`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const savePost = async (id) => {
  const response = await fetch(`${API_URL}/posts/${id}/save`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const addComment = async (id, content) => {
  const response = await fetch(`${API_URL}/posts/${id}/comments`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ content })
  });
  return handleResponse(response);
};

export const incrementPostViews = async (id) => {
  const response = await fetch(`${API_URL}/posts/${id}/view`, {
    method: 'PUT'
  });
  return handleResponse(response);
};

// ============ NOTIFICATION API ============

export const getNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const markNotificationRead = async (id) => {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const markAllNotificationsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

// ============ EMAIL API ============

export const sendWelcomeEmail = async (email, name) => {
  const response = await fetch(`${API_URL}/email/welcome`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email, name })
  });
  return handleResponse(response);
};

export const sendBookingConfirmationEmail = async (email, booking) => {
  const response = await fetch(`${API_URL}/email/booking-confirmation`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email, booking })
  });
  return handleResponse(response);
};

export const sendPaymentReceiptEmail = async (email, payment) => {
  const response = await fetch(`${API_URL}/email/payment-receipt`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email, payment })
  });
  return handleResponse(response);
};

export const sendSupportReceiptEmail = async (email, support) => {
  const response = await fetch(`${API_URL}/email/support-receipt`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email, support })
  });
  return handleResponse(response);
};

// ============ ANALYTICS API ============

export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/analytics/dashboard`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

// ============ ADMIN API ============

export const getAllUsers = async (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const response = await fetch(`${API_URL}/admin/users?${params}`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getUserById = async (id) => {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const updateUserRole = async (id, role) => {
  const response = await fetch(`${API_URL}/admin/users/${id}/role`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ role })
  });
  return handleResponse(response);
};

export const toggleUserStatus = async (id) => {
  const response = await fetch(`${API_URL}/admin/users/${id}/toggle-status`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAllBookings = async (page = 1, limit = 50, status = null) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  const response = await fetch(`${API_URL}/admin/bookings?${params}`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const updateBookingStatusAdmin = async (id, status, totalAmount = null) => {
  const response = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ status, totalAmount })
  });
  return handleResponse(response);
};

export const deleteBooking = async (id) => {
  const response = await fetch(`${API_URL}/admin/bookings/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAllVideosAdmin = async (page = 1, limit = 50, status = null) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  const response = await fetch(`${API_URL}/admin/videos?${params}`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const approveVideoAdmin = async (id) => {
  const response = await fetch(`${API_URL}/admin/videos/${id}/approve`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const rejectVideo = async (id, reason = '') => {
  const response = await fetch(`${API_URL}/admin/videos/${id}/reject`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ reason })
  });
  return handleResponse(response);
};

export const featureVideoAdmin = async (id) => {
  const response = await fetch(`${API_URL}/admin/videos/${id}/feature`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const deleteVideoAdmin = async (id) => {
  const response = await fetch(`${API_URL}/admin/videos/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAllSupports = async () => {
  const response = await fetch(`${API_URL}/admin/supports`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAllPayments = async () => {
  const response = await fetch(`${API_URL}/admin/payments`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAllPostsAdmin = async () => {
  const response = await fetch(`${API_URL}/admin/posts`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const deletePostAdmin = async (id) => {
  const response = await fetch(`${API_URL}/admin/posts/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAdminDashboard = async () => {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAdminStats = async () => {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getRevenueAnalytics = async (period = 'month') => {
  const response = await fetch(`${API_URL}/admin/revenue?period=${period}`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAuditLogs = async () => {
  const response = await fetch(`${API_URL}/admin/audit-logs`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const getAdminNotifications = async () => {
  const response = await fetch(`${API_URL}/admin/notifications`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const markAdminNotificationRead = async (id) => {
  const response = await fetch(`${API_URL}/admin/notifications/${id}/read`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const markAllAdminNotificationsRead = async () => {
  const response = await fetch(`${API_URL}/admin/notifications/read-all`, {
    method: 'PUT',
    headers: authHeader()
  });
  return handleResponse(response);
};

export const sendBroadcast = async (data) => {
  const response = await fetch(`${API_URL}/admin/broadcast`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getSettings = async () => {
  const response = await fetch(`${API_URL}/admin/settings`, {
    headers: authHeader()
  });
  return handleResponse(response);
};

export const updateSettings = async (settings) => {
  const response = await fetch(`${API_URL}/admin/settings`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify(settings)
  });
  return handleResponse(response);
};

export const exportData = async (type) => {
  const response = await fetch(`${API_URL}/admin/export/${type}`, {
    headers: authHeader()
  });
  const blob = await response.blob();
  return blob;
};

// ============ DEFAULT EXPORT ============
export default {
  register,
  registerCouple,
  registerCreator,
  login,
  getCurrentUser,
  createBooking,
  getMyBookings,
  getBookingById,
  getVideos,
  getAllVideos,
  getVideoById,
  getFeaturedVideos,
  getCoupleVideos,
  uploadVideo,
  incrementVideoViews,
  getCoupleById,
  getCoupleSupportStats,
  supportCouple,
  getMySupportHistory,
  getCoupleEarnings,
  getTopSupportedCouples,
  getTopCreators,
  getCreatorById,
  getCreatorVideos,
  processBookingPayment,
  processSupportPayment,
  getMyPayments,
  getAllPosts,
  getPostById,
  getRelatedPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  savePost,
  addComment,
  incrementPostViews,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendSupportReceiptEmail,
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllBookings,
  updateBookingStatusAdmin,
  deleteBooking,
  getAllVideosAdmin,
  approveVideoAdmin,
  rejectVideo,
  featureVideoAdmin,
  deleteVideoAdmin,
  getAllSupports,
  getAllPayments,
  getAllPostsAdmin,
  deletePostAdmin,
  getAdminDashboard,
  getAdminStats,
  getRevenueAnalytics,
  getAuditLogs,
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  sendBroadcast,
  getSettings,
  updateSettings,
  exportData
};