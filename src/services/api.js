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
    `${API_URL}/videos/featured`,
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

// ─── COUPLE API ───────────────────────────────────────────────────

export const getCoupleById = async (id) => {
  console.log('💑 Getting couple by ID:', id);
  const response = await fetchWithLogging(
    `${API_URL}/couples/${id}`,
    {
      method: 'GET'
    },
    `couples/${id}`
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

// ─── CREATOR API ──────────────────────────────────────────────────

export const getTopCreators = async () => {
  console.log('🎬 Getting top creators...');
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

// ─── ADMIN API ────────────────────────────────────────────────────

export const getAllUsers = async (page = 1, limit = 50, filters = {}) => {
  console.log('👥 Getting all users...');
  const params = new URLSearchParams({ page, limit, ...filters });
  const response = await fetchWithLogging(
    `${API_URL}/admin/users?${params}`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/users'
  );
  return response;
};

export const getUserById = async (id) => {
  console.log('👤 Getting user by ID:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/users/${id}`,
    {
      method: 'GET',
      headers: authHeader()
    },
    `admin/users/${id}`
  );
  return response;
};

export const updateUserRole = async (id, role) => {
  console.log('👤 Updating user role:', id, role);
  const response = await fetchWithLogging(
    `${API_URL}/admin/users/${id}/role`,
    {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ role })
    },
    `admin/users/${id}/role`
  );
  return response;
};

export const toggleUserStatus = async (id) => {
  console.log('👤 Toggling user status:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/users/${id}/toggle-status`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `admin/users/${id}/toggle-status`
  );
  return response;
};

export const deleteUser = async (id) => {
  console.log('🗑️ Deleting user:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/users/${id}`,
    {
      method: 'DELETE',
      headers: authHeader()
    },
    `admin/users/${id}`
  );
  return response;
};

export const getAllBookings = async (page = 1, limit = 50, status = null) => {
  console.log('📅 Getting all bookings...');
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  const response = await fetchWithLogging(
    `${API_URL}/admin/bookings?${params}`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/bookings'
  );
  return response;
};

export const updateBookingStatusAdmin = async (id, status, totalAmount = null) => {
  console.log('📅 Updating booking status:', id, status);
  const response = await fetchWithLogging(
    `${API_URL}/admin/bookings/${id}/status`,
    {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ status, totalAmount })
    },
    `admin/bookings/${id}/status`
  );
  return response;
};

export const deleteBooking = async (id) => {
  console.log('🗑️ Deleting booking:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/bookings/${id}`,
    {
      method: 'DELETE',
      headers: authHeader()
    },
    `admin/bookings/${id}`
  );
  return response;
};

export const getAllVideosAdmin = async (page = 1, limit = 50, status = null) => {
  console.log('🎬 Getting all videos (admin)...');
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  const response = await fetchWithLogging(
    `${API_URL}/admin/videos?${params}`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/videos'
  );
  return response;
};

export const approveVideoAdmin = async (id) => {
  console.log('✅ Approving video:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/videos/${id}/approve`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `admin/videos/${id}/approve`
  );
  return response;
};

export const rejectVideo = async (id, reason = '') => {
  console.log('❌ Rejecting video:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/videos/${id}/reject`,
    {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ reason })
    },
    `admin/videos/${id}/reject`
  );
  return response;
};

export const featureVideoAdmin = async (id) => {
  console.log('⭐ Featuring video:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/videos/${id}/feature`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `admin/videos/${id}/feature`
  );
  return response;
};

export const deleteVideoAdmin = async (id) => {
  console.log('🗑️ Deleting video:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/videos/${id}`,
    {
      method: 'DELETE',
      headers: authHeader()
    },
    `admin/videos/${id}`
  );
  return response;
};

export const getAllSupports = async () => {
  console.log('❤️ Getting all supports...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/supports`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/supports'
  );
  return response;
};

export const getAllPayments = async () => {
  console.log('💳 Getting all payments...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/payments`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/payments'
  );
  return response;
};

export const getAllPostsAdmin = async () => {
  console.log('📝 Getting all posts (admin)...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/posts`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/posts'
  );
  return response;
};

export const deletePostAdmin = async (id) => {
  console.log('🗑️ Deleting post (admin):', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/posts/${id}`,
    {
      method: 'DELETE',
      headers: authHeader()
    },
    `admin/posts/${id}`
  );
  return response;
};

export const getAdminDashboard = async () => {
  console.log('📊 Getting admin dashboard...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/dashboard`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/dashboard'
  );
  return response;
};

export const getAdminStats = async () => {
  console.log('📊 Getting admin stats...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/stats`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/stats'
  );
  return response;
};

export const getRevenueAnalytics = async (period = 'month') => {
  console.log('💰 Getting revenue analytics...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/revenue?period=${period}`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/revenue'
  );
  return response;
};

export const getAuditLogs = async () => {
  console.log('📜 Getting audit logs...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/audit-logs`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/audit-logs'
  );
  return response;
};

export const getAdminNotifications = async () => {
  console.log('🔔 Getting admin notifications...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/notifications`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/notifications'
  );
  return response;
};

export const markAdminNotificationRead = async (id) => {
  console.log('🔔 Marking admin notification read:', id);
  const response = await fetchWithLogging(
    `${API_URL}/admin/notifications/${id}/read`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    `admin/notifications/${id}/read`
  );
  return response;
};

export const markAllAdminNotificationsRead = async () => {
  console.log('🔔 Marking all admin notifications read...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/notifications/read-all`,
    {
      method: 'PUT',
      headers: authHeader()
    },
    'admin/notifications/read-all'
  );
  return response;
};

export const sendBroadcast = async (data) => {
  console.log('📢 Sending broadcast...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/broadcast`,
    {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(data)
    },
    'admin/broadcast'
  );
  return response;
};

export const getSettings = async () => {
  console.log('⚙️ Getting settings...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/settings`,
    {
      method: 'GET',
      headers: authHeader()
    },
    'admin/settings'
  );
  return response;
};

export const updateSettings = async (settings) => {
  console.log('⚙️ Updating settings...');
  const response = await fetchWithLogging(
    `${API_URL}/admin/settings`,
    {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(settings)
    },
    'admin/settings'
  );
  return response;
};

export const exportData = async (type) => {
  console.log('📤 Exporting data:', type);
  const response = await fetch(`${API_URL}/admin/export/${type}`, {
    method: 'GET',
    headers: authHeader()
  });
  const blob = await response.blob();
  return blob;
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
  // Videos
  getVideos,
  getAllVideos,
  getVideoById,
  getFeaturedVideos,
  getCoupleVideos,
  uploadVideo,
  incrementVideoViews,
  // Couples
  getCoupleById,
  getCoupleSupportStats,
  // Support
  supportCouple,
  getMySupportHistory,
  getCoupleEarnings,
  getTopSupportedCouples,
  // Creators
  getTopCreators,
  getCreatorById,
  getCreatorVideos,
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
  markAllNotificationsRead,
  // Admin
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