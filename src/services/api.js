// src/services/api.js
// SHINECONNECT API Service

const API_URL = import.meta.env.VITE_API_URL || 'https://ny-entertainment-backend.onrender.com/api';
console.log('🔍 SHINECONNECT API URL:', API_URL);

// ─── AUTH KEYS & HELPERS ──────────────────────────────────────────
const AUTH_KEYS = [
  'token', 'user_token', 'admin_token', 'couple_token', 'creator_token', 'client_token',
  'user_data', 'admin_data', 'user_logged_in', 'admin_logged_in', 'couple_logged_in',
  'creator_logged_in', 'client_logged_in', 'user_role', 'user_email', 'admin_email',
  'couple_email', 'creator_email', 'client_email', 'user_name', 'admin_name', 'couple_name',
  'creator_name', 'client_name', 'user_phone', 'user_username', 'user_bio', 'user_district',
  'user_profile_image', 'user_cover_image', 'user_social_links', 'user_notifications',
  'creator_profile', 'creator_profile_image'
];

// ─── TOKEN HELPERS ────────────────────────────────────────────────
export const getToken = () => {
  const token = localStorage.getItem('token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('user_token') ||
    localStorage.getItem('couple_token') ||
    localStorage.getItem('creator_token');
  return token;
};

export const clearStoredAuth = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const getStoredAuthState = () => {
  const token = getToken();
  const storageCandidates = [
    localStorage.getItem('user_data'),
    localStorage.getItem('admin_data'),
    localStorage.getItem('couple_data')
  ];

  let user = null;
  for (const rawUserData of storageCandidates) {
    if (!rawUserData) continue;
    try {
      user = JSON.parse(rawUserData);
      if (user) break;
    } catch { continue; }
  }

  const role = String(
    user?.role ||
    localStorage.getItem('user_role') ||
    localStorage.getItem('admin_role') ||
    ''
  ).trim().toLowerCase();

  const fallbackName = localStorage.getItem('user_name') || localStorage.getItem('admin_name') || '';
  const fallbackEmail = localStorage.getItem('user_email') || localStorage.getItem('admin_email') || '';

  const userWithFallback = user || (fallbackName || fallbackEmail || role ? {
    name: fallbackName, email: fallbackEmail, role
  } : null);

  const isAuthenticated = Boolean(token || userWithFallback);

  return { token, user: userWithFallback, role, isAuthenticated };
};

// ─── AUTH HEADERS ─────────────────────────────────────────────────
const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken() || ''}`
});

const adminAuthHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token') || ''}`
});

// ─── FETCH HELPERS ────────────────────────────────────────────────
const handleResponse = async (response, endpoint = '') => {
  const rawText = await response.text();
  let data = {};
  if (rawText) {
    try { data = JSON.parse(rawText); }
    catch { data = { message: rawText }; }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        // Redirect admin pages to /admin/login, others to /login
        const isAdminPath = path.startsWith('/admin');
        window.location.href = isAdminPath ? '/admin/login' : '/login';
      }
    }
    const error = new Error(data.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
};

const fetchWithLogging = async (url, options = {}, endpoint = '') => {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response, endpoint);
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      const networkError = new Error(`Cannot connect to SHINECONNECT server. Please check your internet connection.`);
      networkError.status = 0;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════
export const register = (userData) =>
  fetchWithLogging(`${API_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData)
  }, 'auth/register');

export const registerCouple = (userData) =>
  fetchWithLogging(`${API_URL}/auth/register/couple`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData)
  }, 'auth/register/couple');

export const registerCreator = (userData) =>
  fetchWithLogging(`${API_URL}/auth/register/creator`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData)
  }, 'auth/register/creator');

export const login = (email, password) =>
  fetchWithLogging(`${API_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
  }, 'auth/login');

export const googleSignIn = (payload) =>
  fetchWithLogging(`${API_URL}/auth/google`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  }, 'auth/google');

export const getCurrentUser = () =>
  fetchWithLogging(`${API_URL}/auth/me`, { method: 'GET', headers: authHeader() }, 'auth/me');

export const requestPasswordReset = (email) =>
  fetchWithLogging(`${API_URL}/auth/forgot-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
  }, 'auth/forgot-password');

export const resetPasswordWithToken = (token, newPassword) =>
  fetchWithLogging(`${API_URL}/auth/reset-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword })
  }, 'auth/reset-password');

// ═══════════════════════════════════════════════════════════════
// EMAIL
// ═══════════════════════════════════════════════════════════════
export const sendWelcomeEmail = (email, name) =>
  fetchWithLogging(`${API_URL}/email/welcome`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify({ email, name })
  }, 'email/welcome');

export const sendBookingConfirmationEmail = (email, booking) =>
  fetchWithLogging(`${API_URL}/email/booking-confirmation`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify({ email, booking })
  }, 'email/booking-confirmation');

export const sendPaymentReceiptEmail = (email, payment) =>
  fetchWithLogging(`${API_URL}/email/payment-receipt`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify({ email, payment })
  }, 'email/payment-receipt');

export const sendSupportReceiptEmail = (email, support) =>
  fetchWithLogging(`${API_URL}/email/support-receipt`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify({ email, support })
  }, 'email/support-receipt');

// ═══════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════
export const createBooking = (bookingData) =>
  fetchWithLogging(`${API_URL}/bookings`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify(bookingData)
  }, 'bookings');

export const getMyBookings = () =>
  fetchWithLogging(`${API_URL}/bookings/my-bookings`, { method: 'GET', headers: authHeader() }, 'bookings/my-bookings');

export const getBookingById = (id) =>
  fetchWithLogging(`${API_URL}/bookings/${id}`, { method: 'GET', headers: authHeader() }, `bookings/${id}`);

export const updateBooking = (id, bookingData) =>
  fetchWithLogging(`${API_URL}/bookings/${id}`, {
    method: 'PUT', headers: authHeader(), body: JSON.stringify(bookingData)
  }, `bookings/${id}`);

export const cancelBooking = (id) =>
  fetchWithLogging(`${API_URL}/bookings/${id}/cancel`, { method: 'PUT', headers: authHeader() }, `bookings/${id}/cancel`);

export const getBookingStats = () =>
  fetchWithLogging(`${API_URL}/bookings/stats`, { method: 'GET', headers: authHeader() }, 'bookings/stats');

export const getAvailableSlots = (date, serviceType) => {
  const params = new URLSearchParams({ date, serviceType });
  return fetchWithLogging(`${API_URL}/bookings/available-slots?${params}`, { method: 'GET' }, 'bookings/available-slots');
};

// ═══════════════════════════════════════════════════════════════
// VIDEOS (public)
// ═══════════════════════════════════════════════════════════════
export const getVideos = (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  return fetchWithLogging(`${API_URL}/videos?${params}`, { method: 'GET' }, 'videos');
};

export const getAllVideos = getVideos;

export const getVideoById = (id) =>
  fetchWithLogging(`${API_URL}/videos/${id}`, { method: 'GET' }, `videos/${id}`);

export const getFeaturedVideos = () =>
  fetchWithLogging(`${API_URL}/videos?featured=true`, { method: 'GET' }, 'videos/featured');

export const getCoupleVideos = (coupleId) =>
  fetchWithLogging(`${API_URL}/videos/couple/${coupleId}`, { method: 'GET' }, `videos/couple/${coupleId}`);

export const uploadVideo = (videoData) =>
  fetchWithLogging(`${API_URL}/videos`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify(videoData)
  }, 'videos/upload');

export const incrementVideoViews = (id) =>
  fetchWithLogging(`${API_URL}/videos/${id}/view`, { method: 'PUT' }, `videos/${id}/view`);

export const likeVideo = (id) =>
  fetchWithLogging(`${API_URL}/videos/${id}/like`, { method: 'PUT', headers: authHeader() }, `videos/${id}/like`);

export const purchaseVideo = (id) =>
  fetchWithLogging(`${API_URL}/videos/${id}/purchase`, { method: 'POST', headers: authHeader() }, `videos/${id}/purchase`);

export const checkVideoAccess = (id) =>
  fetchWithLogging(`${API_URL}/videos/${id}/access`, { method: 'GET', headers: authHeader() }, `videos/${id}/access`);

// ═══════════════════════════════════════════════════════════════
// CREATORS
// ═══════════════════════════════════════════════════════════════
export const getTopCreators = () =>
  fetchWithLogging(`${API_URL}/creators/top`, { method: 'GET', headers: authHeader() }, 'creators/top');

export const getCreatorById = (id) =>
  fetchWithLogging(`${API_URL}/creators/${id}`, { method: 'GET' }, `creators/${id}`);

export const getCreatorVideos = (creatorId) =>
  fetchWithLogging(`${API_URL}/creators/${creatorId}/videos`, { method: 'GET' }, `creators/${creatorId}/videos`);

// ═══════════════════════════════════════════════════════════════
// SUPPORT
// ═══════════════════════════════════════════════════════════════
export const supportCouple = (supportData) =>
  fetchWithLogging(`${API_URL}/support`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify(supportData)
  }, 'support');

export const getCoupleSupportStats = (coupleId) =>
  fetchWithLogging(`${API_URL}/support/couple/${coupleId}/stats`, { method: 'GET', headers: authHeader() }, `support/couple/${coupleId}/stats`);

export const getMySupportHistory = () =>
  fetchWithLogging(`${API_URL}/support/my`, { method: 'GET', headers: authHeader() }, 'support/my');

export const getCoupleEarnings = () =>
  fetchWithLogging(`${API_URL}/support/earnings`, { method: 'GET', headers: authHeader() }, 'support/earnings');

export const getTopSupportedCouples = () =>
  fetchWithLogging(`${API_URL}/support/top-couples`, { method: 'GET' }, 'support/top-couples');

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════
export const processBookingPayment = (paymentData) =>
  fetchWithLogging(`${API_URL}/payments/booking`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify(paymentData)
  }, 'payments/booking');

export const processSupportPayment = (paymentData) =>
  fetchWithLogging(`${API_URL}/payments/support`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify(paymentData)
  }, 'payments/support');

export const getMyPayments = () =>
  fetchWithLogging(`${API_URL}/payments/my`, { method: 'GET', headers: authHeader() }, 'payments/my');

// ═══════════════════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════════════════
export const getAllPosts = (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  return fetchWithLogging(`${API_URL}/posts?${params}`, { method: 'GET' }, 'posts');
};

export const getPostById = (id) =>
  fetchWithLogging(`${API_URL}/posts/${id}`, { method: 'GET' }, `posts/${id}`);

export const getRelatedPosts = (category, excludeId) => {
  const params = new URLSearchParams({ category, exclude: excludeId });
  return fetchWithLogging(`${API_URL}/posts/related?${params}`, { method: 'GET' }, 'posts/related');
};

export const createPost = (postData) =>
  fetchWithLogging(`${API_URL}/posts`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify(postData)
  }, 'posts');

export const updatePost = (id, postData) =>
  fetchWithLogging(`${API_URL}/posts/${id}`, {
    method: 'PUT', headers: authHeader(), body: JSON.stringify(postData)
  }, `posts/${id}`);

export const deletePost = (id) =>
  fetchWithLogging(`${API_URL}/posts/${id}`, { method: 'DELETE', headers: authHeader() }, `posts/${id}`);

export const likePost = (id) =>
  fetchWithLogging(`${API_URL}/posts/${id}/like`, { method: 'PUT', headers: authHeader() }, `posts/${id}/like`);

export const savePost = (id) =>
  fetchWithLogging(`${API_URL}/posts/${id}/save`, { method: 'PUT', headers: authHeader() }, `posts/${id}/save`);

export const addComment = (id, content) =>
  fetchWithLogging(`${API_URL}/posts/${id}/comments`, {
    method: 'POST', headers: authHeader(), body: JSON.stringify({ content })
  }, `posts/${id}/comments`);

export const incrementPostViews = (id) =>
  fetchWithLogging(`${API_URL}/posts/${id}/view`, { method: 'PUT' }, `posts/${id}/view`);

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS (user)
// ═══════════════════════════════════════════════════════════════
export const getNotifications = () =>
  fetchWithLogging(`${API_URL}/notifications`, { method: 'GET', headers: authHeader() }, 'notifications');

export const markNotificationRead = (id) =>
  fetchWithLogging(`${API_URL}/notifications/${id}/read`, { method: 'PUT', headers: authHeader() }, `notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  fetchWithLogging(`${API_URL}/notifications/read-all`, { method: 'PUT', headers: authHeader() }, 'notifications/read-all');

// ═══════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════
export const getAdminDashboard = () =>
  fetchWithLogging(`${API_URL}/admin/dashboard`, { method: 'GET', headers: adminAuthHeader() }, 'admin/dashboard');

export const getAdminStats = () =>
  fetchWithLogging(`${API_URL}/admin/stats`, { method: 'GET', headers: adminAuthHeader() }, 'admin/stats');

export const getAllUsers = (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  return fetchWithLogging(`${API_URL}/admin/users?${params}`, { method: 'GET', headers: adminAuthHeader() }, 'admin/users');
};

export const getUserById = (userId) =>
  fetchWithLogging(`${API_URL}/admin/users/${userId}`, { method: 'GET', headers: adminAuthHeader() }, `admin/users/${userId}`);

export const updateUserRole = (userId, role) =>
  fetchWithLogging(`${API_URL}/admin/users/${userId}/role`, {
    method: 'PUT', headers: adminAuthHeader(), body: JSON.stringify({ role })
  }, `admin/users/${userId}/role`);

export const toggleUserStatus = (userId) =>
  fetchWithLogging(`${API_URL}/admin/users/${userId}/toggle-status`, { method: 'PUT', headers: adminAuthHeader() }, `admin/users/${userId}/toggle-status`);

export const deleteUser = (userId) =>
  fetchWithLogging(`${API_URL}/admin/users/${userId}`, { method: 'DELETE', headers: adminAuthHeader() }, `admin/users/${userId}`);

export const getAllBookings = (page = 1, limit = 50, status = null) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  return fetchWithLogging(`${API_URL}/admin/bookings?${params}`, { method: 'GET', headers: adminAuthHeader() }, 'admin/bookings');
};

export const updateBookingStatusAdmin = (bookingId, status, totalAmount = null) =>
  fetchWithLogging(`${API_URL}/admin/bookings/${bookingId}/status`, {
    method: 'PUT', headers: adminAuthHeader(), body: JSON.stringify({ status, totalAmount })
  }, `admin/bookings/${bookingId}/status`);

export const assignCreatorToBooking = (bookingId, creatorId) =>
  fetchWithLogging(`${API_URL}/admin/bookings/${bookingId}/assign-creator`, {
    method: 'PUT', headers: adminAuthHeader(), body: JSON.stringify({ creatorId })
  }, `admin/bookings/${bookingId}/assign-creator`);

export const deleteBooking = (bookingId) =>
  fetchWithLogging(`${API_URL}/admin/bookings/${bookingId}`, { method: 'DELETE', headers: adminAuthHeader() }, `admin/bookings/${bookingId}`);

export const getAllVideosAdmin = (page = 1, limit = 50, filters = {}) => {
  const normalizedFilters = {};
  const rawStatus = typeof filters === 'string' ? filters : filters?.status;
  if (rawStatus && rawStatus !== 'all' && rawStatus !== 'ALL') {
    normalizedFilters.status = String(rawStatus).toUpperCase();
  }
  const params = new URLSearchParams({ page, limit, ...normalizedFilters });
  return fetchWithLogging(`${API_URL}/admin/videos?${params}`, { method: 'GET', headers: adminAuthHeader() }, 'admin/videos');
};

export const approveVideoAdmin = (videoId) =>
  fetchWithLogging(`${API_URL}/admin/videos/${videoId}/approve`, { method: 'PUT', headers: adminAuthHeader() }, `admin/videos/${videoId}/approve`);

export const rejectVideo = (videoId, reason = '') =>
  fetchWithLogging(`${API_URL}/admin/videos/${videoId}/reject`, {
    method: 'PUT', headers: adminAuthHeader(), body: JSON.stringify({ reason })
  }, `admin/videos/${videoId}/reject`);

export const featureVideoAdmin = (videoId) =>
  fetchWithLogging(`${API_URL}/admin/videos/${videoId}/feature`, { method: 'PUT', headers: adminAuthHeader() }, `admin/videos/${videoId}/feature`);

export const deleteVideoAdmin = (videoId) =>
  fetchWithLogging(`${API_URL}/admin/videos/${videoId}`, { method: 'DELETE', headers: adminAuthHeader() }, `admin/videos/${videoId}`);

export const getAllSupports = () =>
  fetchWithLogging(`${API_URL}/admin/supports`, { method: 'GET', headers: adminAuthHeader() }, 'admin/supports');

export const getAllPayments = () =>
  fetchWithLogging(`${API_URL}/admin/payments`, { method: 'GET', headers: adminAuthHeader() }, 'admin/payments');

export const getAllPostsAdmin = () =>
  fetchWithLogging(`${API_URL}/admin/posts`, { method: 'GET', headers: adminAuthHeader() }, 'admin/posts');

export const deletePostAdmin = (postId) =>
  fetchWithLogging(`${API_URL}/admin/posts/${postId}`, { method: 'DELETE', headers: adminAuthHeader() }, `admin/posts/${postId}`);

export const getAdminNotifications = () =>
  fetchWithLogging(`${API_URL}/admin/notifications`, { method: 'GET', headers: adminAuthHeader() }, 'admin/notifications');

export const markAdminNotificationRead = (notificationId) =>
  fetchWithLogging(`${API_URL}/admin/notifications/${notificationId}/read`, { method: 'PUT', headers: adminAuthHeader() }, `admin/notifications/${notificationId}/read`);

export const markAllAdminNotificationsRead = () =>
  fetchWithLogging(`${API_URL}/admin/notifications/read-all`, { method: 'PUT', headers: adminAuthHeader() }, 'admin/notifications/read-all');

export const getCouples = (page = 1, limit = 50) => {
  const params = new URLSearchParams({ page, limit });
  return fetchWithLogging(`${API_URL}/admin/couples?${params}`, { method: 'GET', headers: adminAuthHeader() }, 'admin/couples');
};

export const getMessages = () =>
  fetchWithLogging(`${API_URL}/admin/messages`, { method: 'GET', headers: adminAuthHeader() }, 'admin/messages');

export const markMessageRead = (id) =>
  fetchWithLogging(`${API_URL}/admin/messages/${id}/read`, { method: 'PUT', headers: adminAuthHeader() }, `admin/messages/${id}/read`);

export const deleteMessage = (id) =>
  fetchWithLogging(`${API_URL}/admin/messages/${id}`, { method: 'DELETE', headers: adminAuthHeader() }, `admin/messages/${id}`);

export const sendBroadcast = (data) =>
  fetchWithLogging(`${API_URL}/admin/broadcast`, {
    method: 'POST', headers: adminAuthHeader(), body: JSON.stringify(data)
  }, 'admin/broadcast');

export const getSettings = () =>
  fetchWithLogging(`${API_URL}/admin/settings`, { method: 'GET', headers: adminAuthHeader() }, 'admin/settings');

export const updateSettings = (settings) =>
  fetchWithLogging(`${API_URL}/admin/settings`, {
    method: 'PUT', headers: adminAuthHeader(), body: JSON.stringify(settings)
  }, 'admin/settings');

export const getAuditLogs = () =>
  fetchWithLogging(`${API_URL}/admin/audit-logs`, { method: 'GET', headers: adminAuthHeader() }, 'admin/audit-logs');

export const exportData = async (type) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/export/${type}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.blob();
};

// ═══════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════
export default {
  // Auth
  register, registerCouple, registerCreator, login, googleSignIn, getCurrentUser,
  requestPasswordReset, resetPasswordWithToken,

  // Email
  sendWelcomeEmail, sendBookingConfirmationEmail, sendPaymentReceiptEmail, sendSupportReceiptEmail,

  // Bookings
  createBooking, getMyBookings, getBookingById, updateBooking, cancelBooking, getBookingStats, getAvailableSlots,

  // Videos
  getVideos, getAllVideos, getVideoById, getFeaturedVideos, getCoupleVideos,
  uploadVideo, incrementVideoViews, likeVideo, purchaseVideo, checkVideoAccess,

  // Creators
  getTopCreators, getCreatorById, getCreatorVideos,

  // Support
  supportCouple, getCoupleSupportStats, getMySupportHistory, getCoupleEarnings, getTopSupportedCouples,

  // Payments
  processBookingPayment, processSupportPayment, getMyPayments,

  // Posts
  getAllPosts, getPostById, getRelatedPosts, createPost, updatePost, deletePost,
  likePost, savePost, addComment, incrementPostViews,

  // Notifications
  getNotifications, markNotificationRead, markAllNotificationsRead,

  // Admin
  getAdminDashboard, getAdminStats, getAllUsers, getUserById, updateUserRole,
  toggleUserStatus, deleteUser,
  getAllBookings, updateBookingStatusAdmin, assignCreatorToBooking, deleteBooking,
  getAllVideosAdmin, approveVideoAdmin, rejectVideo, featureVideoAdmin, deleteVideoAdmin,
  getAllSupports, getAllPayments, getAllPostsAdmin, deletePostAdmin,
  getAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead,
  getCouples, getMessages, markMessageRead, deleteMessage,
  sendBroadcast, getSettings, updateSettings, getAuditLogs, exportData,
};