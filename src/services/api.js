// src/services/api.js
// SHINECONNECT API Service

const API_URL = import.meta.env.VITE_API_URL || 'https://ny-entertainment-backend.onrender.com/api';
console.log('🔍 SHINECONNECT API URL:', API_URL);
console.log('📡 Environment:', import.meta.env.MODE || 'development');

const AUTH_KEYS = [
  'token', 'user_token', 'admin_token', 'couple_token', 'creator_token', 'client_token',
  'user_data', 'admin_data', 'user_logged_in', 'admin_logged_in', 'couple_logged_in',
  'creator_logged_in', 'client_logged_in', 'user_role', 'user_email', 'admin_email',
  'couple_email', 'creator_email', 'client_email', 'user_name', 'admin_name', 'couple_name',
  'creator_name', 'client_name', 'user_phone', 'user_username', 'user_bio', 'user_district',
  'user_profile_image', 'user_cover_image', 'user_social_links', 'user_notifications',
  'creator_profile', 'creator_profile_image', 'couple_name', 'creator_name'
];

// ─── HELPER: Get token ──────────────────────────────────────────
export const getToken = () => {
  const token = localStorage.getItem('token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('user_token') ||
    localStorage.getItem('couple_token') ||
    localStorage.getItem('creator_token');
  
  console.log('🔑 Token present:', !!token);
  return token;
};

export const clearStoredAuth = () => {
  console.log('🗑️ Clearing auth data...');
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const getStoredAuthState = () => {
  const token = getToken();
  const storageCandidates = [
    localStorage.getItem('user_data'),
    localStorage.getItem('admin_data'),
    localStorage.getItem('client_data'),
    localStorage.getItem('creator_data'),
    localStorage.getItem('couple_data')
  ];

  let user = null;
  for (const rawUserData of storageCandidates) {
    if (!rawUserData) continue;

    try {
      user = JSON.parse(rawUserData);
      if (user) break;
    } catch {
      continue;
    }
  }

  const role = String(
    user?.role ||
    localStorage.getItem('user_role') ||
    localStorage.getItem('admin_role') ||
    localStorage.getItem('client_role') ||
    localStorage.getItem('creator_role') ||
    localStorage.getItem('couple_role') ||
    ''
  ).trim().toLowerCase();

  const fallbackName = localStorage.getItem('user_name') ||
    localStorage.getItem('admin_name') ||
    localStorage.getItem('client_name') ||
    localStorage.getItem('creator_name') ||
    localStorage.getItem('couple_name') ||
    '';

  const fallbackEmail = localStorage.getItem('user_email') ||
    localStorage.getItem('admin_email') ||
    localStorage.getItem('client_email') ||
    localStorage.getItem('creator_email') ||
    localStorage.getItem('couple_email') ||
    '';

  const userWithFallback = user || (fallbackName || fallbackEmail || role ? {
    name: fallbackName,
    email: fallbackEmail,
    role
  } : null);

  const isAuthenticated = Boolean(
    token || userWithFallback || localStorage.getItem('user_logged_in') === 'true' ||
    localStorage.getItem('admin_logged_in') === 'true' ||
    localStorage.getItem('couple_logged_in') === 'true' ||
    localStorage.getItem('creator_logged_in') === 'true' ||
    localStorage.getItem('client_logged_in') === 'true'
  );

  return { token, user: userWithFallback, role, isAuthenticated };
};

// ─── AUTH HEADER ──────────────────────────────────────────────────
const authHeader = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// ─── RESPONSE HANDLER ────────────────────────────────────────────
const handleResponse = async (response, endpoint = '') => {
  console.log(`📥 Response ${endpoint}:`, response.status, response.statusText);
  
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
    console.error(`❌ API Error ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      data: data
    });

    if (response.status === 401) {
      console.warn('🔒 Unauthorized - clearing auth');
      clearStoredAuth();

      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    const error = new Error(data.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
};

// ─── FETCH WRAPPER WITH LOGGING ──────────────────────────────────
const fetchWithLogging = async (url, options = {}, endpoint = '') => {
  console.log(`📤 ${options.method || 'GET'} ${endpoint || url}`);
  console.log('📍 URL:', url);
  
  try {
    const response = await fetch(url, options);
    return await handleResponse(response, endpoint);
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      console.error('❌ Network Error - Cannot connect to server:', url);
      const networkError = new Error(`Cannot connect to SHINECONNECT server. Please check your internet connection.`);
      networkError.status = 0;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

// ─── AUTH API ─────────────────────────────────────────────────────

export const register = async (userData) => {
  console.log('📝 Registering user...');
  const response = await fetchWithLogging(
    `${API_URL}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    },
    'auth/register'
  );
  return response;
};

export const registerCouple = async (userData) => {
  console.log('💑 Registering couple...');
  const response = await fetchWithLogging(
    `${API_URL}/auth/register/couple`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    },
    'auth/register/couple'
  );
  return response;
};

export const registerCreator = async (userData) => {
  console.log('🎬 Registering creator...');
  const response = await fetchWithLogging(
    `${API_URL}/auth/register/creator`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    },
    'auth/register/creator'
  );
  return response;
};

export const login = async (email, password) => {
  console.log('🔐 SHINECONNECT Login API call:', email);
  console.log('📍 API URL:', API_URL);
  
  const response = await fetchWithLogging(
    `${API_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    },
    'auth/login'
  );
  return response;
};

export const googleSignIn = async (payload) => {
  console.log('🔐 Google Sign-In...');
  const response = await fetchWithLogging(
    `${API_URL}/auth/google`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    'auth/google'
  );
  return response;
};

export const getCurrentUser = async () => {
  console.log('👤 Getting current user...');
  const response = await fetchWithLogging(
    `${API_URL}/auth/me`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'auth/me'
  );
  return response;
};

// ─── EMAIL API ────────────────────────────────────────────────────

export const sendWelcomeEmail = async (email, name) => {
  console.log('📧 Sending welcome email...');
  try {
    const response = await fetchWithLogging(
      `${API_URL}/email/welcome`,
      {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ email, name })
      },
      'email/welcome'
    );
    return response;
  } catch (error) {
    console.error('Send welcome email error:', error);
    throw error;
  }
};

export const sendBookingConfirmationEmail = async (email, booking) => {
  console.log('📧 Sending booking confirmation email...');
  try {
    const response = await fetchWithLogging(
      `${API_URL}/email/booking-confirmation`,
      {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ email, booking })
      },
      'email/booking-confirmation'
    );
    return response;
  } catch (error) {
    console.error('Send booking confirmation email error:', error);
    throw error;
  }
};

export const sendPaymentReceiptEmail = async (email, payment) => {
  console.log('📧 Sending payment receipt email...');
  try {
    const response = await fetchWithLogging(
      `${API_URL}/email/payment-receipt`,
      {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ email, payment })
      },
      'email/payment-receipt'
    );
    return response;
  } catch (error) {
    console.error('Send payment receipt email error:', error);
    throw error;
  }
};

export const sendSupportReceiptEmail = async (email, support) => {
  console.log('📧 Sending support receipt email...');
  try {
    const response = await fetchWithLogging(
      `${API_URL}/email/support-receipt`,
      {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ email, support })
      },
      'email/support-receipt'
    );
    return response;
  } catch (error) {
    console.error('Send support receipt email error:', error);
    throw error;
  }
};

// ─── BOOKING API ──────────────────────────────────────────────────

export const createBooking = async (bookingData) => {
  console.log('📅 Creating booking...');
  const response = await fetchWithLogging(
    `${API_URL}/bookings`,
    {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(bookingData)
    },
    'bookings'
  );
  return response;
};

export const getMyBookings = async () => {
  console.log('📅 Getting my bookings...');
  const response = await fetchWithLogging(
    `${API_URL}/bookings/my-bookings`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'bookings/my-bookings'
  );
  return response;
};

export const getBookingById = async (id) => {
  console.log('📅 Getting booking by ID:', id);
  const response = await fetchWithLogging(
    `${API_URL}/bookings/${id}`,
    {
      method: 'GET',
      headers: authHeader()
    },
    `bookings/${id}`
  );
  return response;
};

export const updateBooking = async (id, bookingData) => {
  console.log('📅 Updating booking:', id);
  const response = await fetchWithLogging(
    `${API_URL}/bookings/${id}`,
    {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(bookingData)
    },
    `bookings/${id}`
  );
  return response;
};

export const cancelBooking = async (id) => {
  console.log('📅 Cancelling booking:', id);
  const response = await fetchWithLogging(
    `${API_URL}/bookings/${id}/cancel`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `bookings/${id}/cancel`
  );
  return response;
};

export const getBookingStats = async () => {
  console.log('📊 Getting booking stats...');
  const response = await fetchWithLogging(
    `${API_URL}/bookings/stats`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'bookings/stats'
  );
  return response;
};

export const getAvailableSlots = async (date, serviceType) => {
  console.log('📅 Getting available slots...');
  const params = new URLSearchParams({ date, serviceType });
  const response = await fetchWithLogging(
    `${API_URL}/bookings/available-slots?${params}`,
    {
      method: 'GET'
    },
    'bookings/available-slots'
  );
  return response;
};

// ─── VIDEO API ────────────────────────────────────────────────────

export const getVideos = async (page = 1, limit = 20, filters = {}) => {
  console.log('🎬 Getting videos...');
  const params = new URLSearchParams({ page, limit, ...filters });
  const response = await fetchWithLogging(
    `${API_URL}/videos?${params}`,
    {
      method: 'GET'
    },
    'videos'
  );
  return response;
};

export const getAllVideos = async (page = 1, limit = 20, filters = {}) => {
  console.log('🎬 Getting all videos...');
  const params = new URLSearchParams({ page, limit, ...filters });
  const response = await fetchWithLogging(
    `${API_URL}/videos?${params}`,
    {
      method: 'GET'
    },
    'videos/all'
  );
  return response;
};

export const getVideoById = async (id) => {
  console.log('🎬 Getting video by ID:', id);
  const response = await fetchWithLogging(
    `${API_URL}/videos/${id}`,
    {
      method: 'GET'
    },
    `videos/${id}`
  );
  return response;
};

export const getFeaturedVideos = async () => {
  console.log('⭐ Getting featured videos...');
  const response = await fetchWithLogging(
    `${API_URL}/videos?featured=true`,
    {
      method: 'GET'
    },
    'videos/featured'
  );
  return response;
};

export const getCoupleVideos = async (coupleId) => {
  console.log('💑 Getting couple videos:', coupleId);
  const response = await fetchWithLogging(
    `${API_URL}/videos/couple/${coupleId}`,
    {
      method: 'GET'
    },
    `videos/couple/${coupleId}`
  );
  return response;
};

export const uploadVideo = async (videoData) => {
  console.log('📤 Uploading video...');
  console.log('📤 Payload:', videoData);
  
  const response = await fetchWithLogging(
    `${API_URL}/videos`,
    {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(videoData)
    },
    'videos/upload'
  );
  return response;
};

export const incrementVideoViews = async (id) => {
  console.log('👁️ Incrementing video views:', id);
  const response = await fetchWithLogging(
    `${API_URL}/videos/${id}/view`,
    {
      method: 'PUT'
    },
    `videos/${id}/view`
  );
  return response;
};

export const likeVideo = async (id) => {
  console.log('❤️ Liking video:', id);
  const response = await fetchWithLogging(
    `${API_URL}/videos/${id}/like`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `videos/${id}/like`
  );
  return response;
};

export const purchaseVideo = async (id) => {
  console.log('💳 Purchasing video:', id);
  const response = await fetchWithLogging(
    `${API_URL}/videos/${id}/purchase`,
    {
      method: 'POST',
      headers: authHeader()
    },
    `videos/${id}/purchase`
  );
  return response;
};

export const checkVideoAccess = async (id) => {
  console.log('🔑 Checking video access:', id);
  const response = await fetchWithLogging(
    `${API_URL}/videos/${id}/access`,
    {
      method: 'GET',
      headers: authHeader()
    },
    `videos/${id}/access`
  );
  return response;
};

// ─── CREATOR API ──────────────────────────────────────────────────

export const getTopCreators = async () => {
  console.log('🏆 Getting top creators...');
  const response = await fetchWithLogging(
    `${API_URL}/creators/top`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'creators/top'
  );
  return response;
};

export const getCreatorById = async (id) => {
  console.log('🎬 Getting creator by ID:', id);
  const response = await fetchWithLogging(
    `${API_URL}/creators/${id}`,
    {
      method: 'GET'
    },
    `creators/${id}`
  );
  return response;
};

export const getCreatorVideos = async (creatorId) => {
  console.log('🎬 Getting creator videos:', creatorId);
  const response = await fetchWithLogging(
    `${API_URL}/creators/${creatorId}/videos`,
    {
      method: 'GET'
    },
    `creators/${creatorId}/videos`
  );
  return response;
};

// ─── SUPPORT API ──────────────────────────────────────────────────

export const supportCouple = async (supportData) => {
  console.log('❤️ Supporting couple...');
  const response = await fetchWithLogging(
    `${API_URL}/support`,
    {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(supportData)
    },
    'support'
  );
  return response;
};

export const getCoupleSupportStats = async (coupleId) => {
  console.log('📊 Getting couple support stats:', coupleId);
  const response = await fetchWithLogging(
    `${API_URL}/support/couple/${coupleId}/stats`,
    {
      method: 'GET',
      headers: authHeader()
    },
    `support/couple/${coupleId}/stats`
  );
  return response;
};

export const getMySupportHistory = async () => {
  console.log('📊 Getting my support history...');
  const response = await fetchWithLogging(
    `${API_URL}/support/my`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'support/my'
  );
  return response;
};

export const getCoupleEarnings = async () => {
  console.log('💰 Getting couple earnings...');
  const response = await fetchWithLogging(
    `${API_URL}/support/earnings`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'support/earnings'
  );
  return response;
};

export const getTopSupportedCouples = async () => {
  console.log('🏆 Getting top supported couples...');
  const response = await fetchWithLogging(
    `${API_URL}/support/top-couples`,
    {
      method: 'GET'
    },
    'support/top-couples'
  );
  return response;
};

// ─── PAYMENT API ──────────────────────────────────────────────────

export const processBookingPayment = async (paymentData) => {
  console.log('💳 Processing booking payment...');
  const response = await fetchWithLogging(
    `${API_URL}/payments/booking`,
    {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(paymentData)
    },
    'payments/booking'
  );
  return response;
};

export const processSupportPayment = async (paymentData) => {
  console.log('💳 Processing support payment...');
  const response = await fetchWithLogging(
    `${API_URL}/payments/support`,
    {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(paymentData)
    },
    'payments/support'
  );
  return response;
};

export const getMyPayments = async () => {
  console.log('💳 Getting my payments...');
  const response = await fetchWithLogging(
    `${API_URL}/payments/my`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'payments/my'
  );
  return response;
};

// ─── POST API ─────────────────────────────────────────────────────

export const getAllPosts = async (page = 1, limit = 20, filters = {}) => {
  console.log('📝 Getting posts...');
  const params = new URLSearchParams({ page, limit, ...filters });
  const response = await fetchWithLogging(
    `${API_URL}/posts?${params}`,
    {
      method: 'GET'
    },
    'posts'
  );
  return response;
};

export const getPostById = async (id) => {
  console.log('📝 Getting post by ID:', id);
  const response = await fetchWithLogging(
    `${API_URL}/posts/${id}`,
    {
      method: 'GET'
    },
    `posts/${id}`
  );
  return response;
};

export const getRelatedPosts = async (category, excludeId) => {
  console.log('📝 Getting related posts:', category);
  const params = new URLSearchParams({ category, exclude: excludeId });
  const response = await fetchWithLogging(
    `${API_URL}/posts/related?${params}`,
    {
      method: 'GET'
    },
    'posts/related'
  );
  return response;
};

export const createPost = async (postData) => {
  console.log('📝 Creating post...');
  const response = await fetchWithLogging(
    `${API_URL}/posts`,
    {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(postData)
    },
    'posts'
  );
  return response;
};

export const updatePost = async (id, postData) => {
  console.log('📝 Updating post:', id);
  const response = await fetchWithLogging(
    `${API_URL}/posts/${id}`,
    {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(postData)
    },
    `posts/${id}`
  );
  return response;
};

export const deletePost = async (id) => {
  console.log('🗑️ Deleting post:', id);
  const response = await fetchWithLogging(
    `${API_URL}/posts/${id}`,
    {
      method: 'DELETE',
      headers: authHeader()
    },
    `posts/${id}`
  );
  return response;
};

export const likePost = async (id) => {
  console.log('❤️ Liking post:', id);
  const response = await fetchWithLogging(
    `${API_URL}/posts/${id}/like`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `posts/${id}/like`
  );
  return response;
};

export const savePost = async (id) => {
  console.log('💾 Saving post:', id);
  const response = await fetchWithLogging(
    `${API_URL}/posts/${id}/save`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `posts/${id}/save`
  );
  return response;
};

export const addComment = async (id, content) => {
  console.log('💬 Adding comment to post:', id);
  const response = await fetchWithLogging(
    `${API_URL}/posts/${id}/comments`,
    {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ content })
    },
    `posts/${id}/comments`
  );
  return response;
};

export const incrementPostViews = async (id) => {
  console.log('👁️ Incrementing post views:', id);
  const response = await fetchWithLogging(
    `${API_URL}/posts/${id}/view`,
    {
      method: 'PUT'
    },
    `posts/${id}/view`
  );
  return response;
};

// ─── NOTIFICATION API ─────────────────────────────────────────────

export const getNotifications = async () => {
  console.log('🔔 Getting notifications...');
  const response = await fetchWithLogging(
    `${API_URL}/notifications`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'notifications'
  );
  return response;
};

export const markNotificationRead = async (id) => {
  console.log('🔔 Marking notification read:', id);
  const response = await fetchWithLogging(
    `${API_URL}/notifications/${id}/read`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `notifications/${id}/read`
  );
  return response;
};

export const markAllNotificationsRead = async () => {
  console.log('🔔 Marking all notifications read...');
  const response = await fetchWithLogging(
    `${API_URL}/notifications/read-all`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    'notifications/read-all'
  );
  return response;
};

// ─── DEFAULT EXPORT ──────────────────────────────────────────────
export default {
  // Auth
  register,
  registerCouple,
  registerCreator,
  login,
  googleSignIn,
  getCurrentUser,
  
  // Email
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendSupportReceiptEmail,
  
  // Bookings
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getBookingStats,
  getAvailableSlots,
  
  // Videos
  getVideos,
  getAllVideos,
  getVideoById,
  getFeaturedVideos,
  getCoupleVideos,
  uploadVideo,
  incrementVideoViews,
  likeVideo,
  purchaseVideo,
  checkVideoAccess,
  
  // Creators
  getTopCreators,
  getCreatorById,
  getCreatorVideos,
  
  // Support
  supportCouple,
  getCoupleSupportStats,
  getMySupportHistory,
  getCoupleEarnings,
  getTopSupportedCouples,
  
  // Payments
  processBookingPayment,
  processSupportPayment,
  getMyPayments,
  
  // Posts
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
  
  // Notifications
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};