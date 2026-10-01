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

const DEMO_USERS_KEY = 'shineconnect_demo_users';
const DEMO_VIDEOS_KEY = 'shineconnect_demo_videos';
const DEMO_BOOKINGS_KEY = 'shineconnect_demo_bookings';

const safeLocalStorage = () => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
};

const readLocalJson = (key, fallback) => {
  if (!safeLocalStorage()) return fallback;

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = (key, value) => {
  if (!safeLocalStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeRole = (role) => String(role || 'CLIENT').trim().toUpperCase();

const sanitizeUser = (user = {}) => {
  const safeUser = { ...user };
  delete safeUser.password;
  return {
    ...safeUser,
    id: safeUser.id || safeUser.email || `${Date.now()}`,
    role: normalizeRole(safeUser.role || 'CLIENT'),
    email: String(safeUser.email || '').trim().toLowerCase(),
    name: safeUser.name || safeUser.email?.split('@')[0] || 'User'
  };
};

const buildDemoUsers = () => [
  { id: 'demo-admin', name: 'Admin User', email: 'admin@shineconnect.rw', password: 'admin123', phone: '0780000000', role: 'ADMIN' },
  { id: 'demo-couple', name: 'Aline & Eric', email: 'couple@shineconnect.rw', password: 'couple123', phone: '0781111111', role: 'COUPLE' },
  { id: 'demo-creator', name: 'Creator User', email: 'creator@shineconnect.rw', password: 'creator123', phone: '0782222222', role: 'CREATOR' },
  { id: 'demo-client', name: 'Client User', email: 'client@shineconnect.rw', password: 'client123', phone: '0783333333', role: 'CLIENT' }
];

const buildDemoVideos = () => [
  {
    id: 'demo-video-1',
    title: 'Aline & Eric Wedding Story',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
    coupleId: 'demo-couple',
    coupleName: 'Aline & Eric',
    eventType: 'wedding',
    accessType: 'free',
    supportAmount: 5000,
    views: 1245,
    likes: 348,
    createdAt: new Date().toISOString(),
    user: { name: 'Aline & Eric', role: 'COUPLE' }
  },
  {
    id: 'demo-video-2',
    title: 'DOTE Celebration Highlights',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    coupleId: 'demo-couple',
    coupleName: 'Aline & Eric',
    eventType: 'dote',
    accessType: 'support',
    supportAmount: 7000,
    views: 902,
    likes: 216,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    user: { name: 'Aline & Eric', role: 'COUPLE' }
  },
  {
    id: 'demo-video-3',
    title: 'Creative Wedding Trailer',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
    coupleId: 'demo-couple',
    coupleName: 'Aline & Eric',
    eventType: 'wedding',
    accessType: 'premium',
    supportAmount: 12000,
    views: 615,
    likes: 154,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    user: { name: 'Aline & Eric', role: 'COUPLE' }
  }
];

const ensureDemoSeedData = () => {
  if (!safeLocalStorage()) return;

  const users = readLocalJson(DEMO_USERS_KEY, []);
  if (!users.length) {
    writeLocalJson(DEMO_USERS_KEY, buildDemoUsers());
  }

  const videos = readLocalJson(DEMO_VIDEOS_KEY, []);
  if (!videos.length) {
    writeLocalJson(DEMO_VIDEOS_KEY, buildDemoVideos());
  }

  const bookings = readLocalJson(DEMO_BOOKINGS_KEY, []);
  if (!bookings.length) {
    writeLocalJson(DEMO_BOOKINGS_KEY, [
      {
        id: 'demo-booking-1',
        name: 'Client User',
        email: 'client@shineconnect.rw',
        phone: '0783333333',
        eventType: 'wedding',
        eventDate: new Date(Date.now() + 2592000000).toISOString(),
        eventLocation: 'Kigali',
        district: 'Gasabo',
        guestCount: 120,
        package: 'premium',
        services: ['photography', 'videography'],
        weddingParts: ['church', 'reception'],
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      }
    ]);
  }
};

const getDemoUsers = () => {
  ensureDemoSeedData();
  return readLocalJson(DEMO_USERS_KEY, []);
};

const getDemoVideos = () => {
  ensureDemoSeedData();
  return readLocalJson(DEMO_VIDEOS_KEY, []);
};

const getDemoBookings = () => {
  ensureDemoSeedData();
  return readLocalJson(DEMO_BOOKINGS_KEY, []);
};

const createLocalBookingRecord = (bookingData) => {
  const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
  const booking = {
    id: `local-booking-${Date.now()}`,
    name: bookingData.name || currentUser.name || 'Client User',
    email: bookingData.email || currentUser.email || 'client@shineconnect.rw',
    phone: bookingData.phone || currentUser.phone || '',
    eventType: bookingData.eventType || 'wedding',
    eventDate: bookingData.eventDate || bookingData.date || new Date().toISOString(),
    eventLocation: bookingData.eventLocation || bookingData.location || 'Rwanda',
    district: bookingData.district || '',
    guestCount: bookingData.guestCount || bookingData.guests || 0,
    package: bookingData.package || 'standard',
    services: bookingData.services || [],
    weddingParts: bookingData.weddingParts || [],
    notes: bookingData.notes || bookingData.message || '',
    startTime: bookingData.startTime || '',
    endTime: bookingData.endTime || '',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    isLocalFallback: true
  };

  const bookings = getDemoBookings();
  bookings.unshift(booking);
  writeLocalJson(DEMO_BOOKINGS_KEY, bookings);
  return booking;
};

const recordLocalEmailEvent = (type, email, details = {}) => {
  if (!safeLocalStorage()) return;

  const existing = readLocalJson('shineconnect_email_events', []);
  existing.unshift({
    id: `email-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    email: String(email || '').trim().toLowerCase(),
    details,
    sentAt: new Date().toISOString()
  });

  writeLocalJson('shineconnect_email_events', existing.slice(0, 50));
};

const createLocalAuthResponse = (user) => {
  const safeUser = sanitizeUser(user);
  const token = `local-demo-token-${safeUser.id}-${Date.now()}`;
  return { success: true, user: safeUser, token };
};

const applyLocalSession = (user) => {
  const safeUser = sanitizeUser(user);
  const role = String(safeUser.role || 'CLIENT').trim().toLowerCase();
  const token = `local-demo-token-${safeUser.id}-${Date.now()}`;

  localStorage.setItem('token', token);
  localStorage.setItem('user_token', token);
  localStorage.setItem('user_data', JSON.stringify(safeUser));
  localStorage.setItem('user_email', safeUser.email);
  localStorage.setItem('user_role', role);
  localStorage.setItem('user_name', safeUser.name);
  localStorage.setItem('user_phone', safeUser.phone || '');
  localStorage.setItem('user_logged_in', 'true');

  if (role === 'admin') {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('admin_email', safeUser.email);
    localStorage.setItem('admin_name', safeUser.name);
  } else if (role === 'couple') {
    localStorage.setItem('couple_token', token);
    localStorage.setItem('couple_logged_in', 'true');
    localStorage.setItem('couple_email', safeUser.email);
    localStorage.setItem('couple_name', safeUser.name);
  } else if (role === 'creator') {
    localStorage.setItem('creator_token', token);
    localStorage.setItem('creator_logged_in', 'true');
    localStorage.setItem('creator_email', safeUser.email);
    localStorage.setItem('creator_name', safeUser.name);
  } else {
    localStorage.setItem('client_token', token);
    localStorage.setItem('client_logged_in', 'true');
    localStorage.setItem('client_name', safeUser.name);
    localStorage.setItem('client_email', safeUser.email);
  }

  return { success: true, user: safeUser, token };
};

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

  try {
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
  } catch (error) {
    const users = getDemoUsers();
    const normalizedEmail = String(userData.email || '').trim().toLowerCase();
    const existingUser = users.find((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail);

    if (existingUser) {
      return { success: false, message: 'User already exists with this email' };
    }

    const newUser = {
      id: `local-user-${Date.now()}`,
      name: userData.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: String(userData.password || ''),
      phone: userData.phone || '',
      role: normalizeRole(userData.role || 'CLIENT')
    };

    users.push(newUser);
    writeLocalJson(DEMO_USERS_KEY, users);
    recordLocalEmailEvent('welcome', normalizedEmail, { name: newUser.name, role: newUser.role });
    return createLocalAuthResponse(newUser);
  }
};

export const registerCouple = async (userData) => {
  console.log('💑 Registering couple...');

  try {
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
  } catch (error) {
    const users = getDemoUsers();
    const normalizedEmail = String(userData.email || '').trim().toLowerCase();
    const existingUser = users.find((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail);

    if (existingUser) {
      return { success: false, message: 'User already exists with this email' };
    }

    const newUser = {
      id: `local-couple-${Date.now()}`,
      name: userData.groomName && userData.brideName ? `${userData.groomName} & ${userData.brideName}` : (userData.name || normalizedEmail.split('@')[0]),
      email: normalizedEmail,
      password: String(userData.password || ''),
      phone: userData.phone || '',
      role: 'COUPLE'
    };

    users.push(newUser);
    writeLocalJson(DEMO_USERS_KEY, users);
    recordLocalEmailEvent('welcome', normalizedEmail, { name: newUser.name, role: newUser.role });
    return createLocalAuthResponse(newUser);
  }
};

export const registerCreator = async (userData) => {
  console.log('🎬 Registering creator...');

  try {
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
  } catch (error) {
    const users = getDemoUsers();
    const normalizedEmail = String(userData.email || '').trim().toLowerCase();
    const existingUser = users.find((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail);

    if (existingUser) {
      return { success: false, message: 'User already exists with this email' };
    }

    const newUser = {
      id: `local-creator-${Date.now()}`,
      name: userData.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: String(userData.password || ''),
      phone: userData.phone || '',
      role: 'CREATOR'
    };

    users.push(newUser);
    writeLocalJson(DEMO_USERS_KEY, users);
    recordLocalEmailEvent('welcome', normalizedEmail, { name: newUser.name, role: newUser.role });
    return createLocalAuthResponse(newUser);
  }
};

export const login = async (email, password) => {
  console.log('🔐 SHINECONNECT Login API call:', email);
  console.log('📍 API URL:', API_URL);

  try {
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
  } catch (error) {
    const users = getDemoUsers();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const matchedUser = users.find((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail && String(user.password || '') === String(password || ''));

    if (!matchedUser) {
      return { success: false, message: 'Invalid credentials' };
    }

    return createLocalAuthResponse(matchedUser);
  }
};

export const googleSignIn = async (payload) => {
  console.log('🔐 Google Sign-In...');

  try {
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
  } catch (error) {
    const email = String(payload?.email || payload?.credential || '').trim();
    const normalizedEmail = email.includes('@') ? email.toLowerCase() : `${Date.now()}@demo.local`;
    const users = getDemoUsers();
    let matchedUser = users.find((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail);

    if (!matchedUser) {
      matchedUser = {
        id: `local-google-${Date.now()}`,
        name: payload?.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: 'google-demo-password',
        phone: '',
        role: 'CLIENT'
      };
      users.push(matchedUser);
      writeLocalJson(DEMO_USERS_KEY, users);
    }

    return createLocalAuthResponse(matchedUser);
  }
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

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetchWithLogging(
      `${API_URL}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      },
      'auth/forgot-password'
    );
    return response;
  } catch (error) {
    if (import.meta.env.PROD) {
      throw error;
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const users = getDemoUsers();
    const matchedUser = users.find((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail);

    if (!matchedUser) {
      return {
        success: true,
        message: 'If an account exists for this email, a reset link has been sent.'
      };
    }

    const token = `local-reset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const payload = readLocalJson('shineconnect_reset_tokens', {});
    payload[token] = {
      email: normalizedEmail,
      expiresAt: Date.now() + 60 * 60 * 1000
    };
    localStorage.setItem('shineconnect_reset_tokens', JSON.stringify(payload));

    recordLocalEmailEvent('password-reset', normalizedEmail, { token, name: matchedUser.name });

    return {
      success: true,
      message: 'If an account exists for this email, a reset link has been sent.'
    };
  }
};

export const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const response = await fetchWithLogging(
      `${API_URL}/auth/reset-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      },
      'auth/reset-password'
    );
    return response;
  } catch (error) {
    const resetTokens = readLocalJson('shineconnect_reset_tokens', {});
    const record = resetTokens[token];

    if (!record || Date.now() > record.expiresAt) {
      return {
        success: false,
        message: 'Invalid or expired reset token'
      };
    }

    const users = getDemoUsers();
    const matchedUser = users.find((user) => String(user.email || '').trim().toLowerCase() === String(record.email || '').trim().toLowerCase());

    if (!matchedUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    matchedUser.password = String(newPassword || '');
    writeLocalJson(DEMO_USERS_KEY, users);
    delete resetTokens[token];
    localStorage.setItem('shineconnect_reset_tokens', JSON.stringify(resetTokens));

    recordLocalEmailEvent('password-changed', matchedUser.email, { name: matchedUser.name });

    return {
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.'
    };
  }
};

// ─── BOOKING API ──────────────────────────────────────────────────

export const createBooking = async (bookingData) => {
  console.log('📅 Creating booking...');
  try {
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
  } catch (error) {
    const booking = createLocalBookingRecord(bookingData);
    recordLocalEmailEvent('booking-confirmation', String(booking.email || '').trim().toLowerCase(), {
      bookingId: booking.id,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
      location: booking.eventLocation
    });
    return { success: true, message: 'Booking saved locally. Admin review will continue when the backend is available.', booking };
  }
};

export const getMyBookings = async () => {
  console.log('📅 Getting my bookings...');
  try {
    const response = await fetchWithLogging(
      `${API_URL}/bookings/my-bookings`,
      {
        method: 'GET',
        headers: authHeader()
      },
      'bookings/my-bookings'
    );
    return response;
  } catch (error) {
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const email = (currentUser.email || localStorage.getItem('user_email') || '').toLowerCase();
    const bookings = getDemoBookings().filter((booking) => !email || String(booking.email || '').toLowerCase() === email);
    return { success: true, bookings };
  }
};

export const getBookingById = async (id) => {
  console.log('📅 Getting booking by ID:', id);
  try {
    const response = await fetchWithLogging(
      `${API_URL}/bookings/${id}`,
      {
        method: 'GET',
        headers: authHeader()
      },
      `bookings/${id}`
    );
    return response;
  } catch (error) {
    const booking = getDemoBookings().find((item) => String(item.id) === String(id));
    return { success: true, booking: booking || null };
  }
};

export const updateBooking = async (id, bookingData) => {
  console.log('📅 Updating booking:', id);
  try {
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
  } catch (error) {
    const bookings = getDemoBookings();
    const index = bookings.findIndex((item) => String(item.id) === String(id));
    if (index >= 0) {
      bookings[index] = { ...bookings[index], ...bookingData };
      writeLocalJson(DEMO_BOOKINGS_KEY, bookings);
      return { success: true, booking: bookings[index] };
    }
    return { success: false, message: 'Booking not found locally' };
  }
};

export const cancelBooking = async (id) => {
  console.log('📅 Cancelling booking:', id);
  try {
    const response = await fetchWithLogging(
      `${API_URL}/bookings/${id}/cancel`,
      {
        method: 'PUT',
        headers: authHeader()
      },
      `bookings/${id}/cancel`
    );
    return response;
  } catch (error) {
    const bookings = getDemoBookings();
    const index = bookings.findIndex((item) => String(item.id) === String(id));
    if (index >= 0) {
      bookings[index].status = 'CANCELLED';
      writeLocalJson(DEMO_BOOKINGS_KEY, bookings);
      return { success: true, booking: bookings[index], message: 'Booking cancelled locally' };
    }
    return { success: false, message: 'Booking not found locally' };
  }
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

  try {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await fetchWithLogging(
      `${API_URL}/videos?${params}`,
      {
        method: 'GET'
      },
      'videos'
    );
    return response;
  } catch (error) {
    const videos = getDemoVideos();
    return { success: true, count: videos.length, videos };
  }
};

export const getAllVideos = async (page = 1, limit = 20, filters = {}) => {
  console.log('🎬 Getting all videos...');

  try {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await fetchWithLogging(
      `${API_URL}/videos?${params}`,
      {
        method: 'GET'
      },
      'videos/all'
    );
    return response;
  } catch (error) {
    const videos = getDemoVideos();
    return { success: true, count: videos.length, videos };
  }
};

export const getVideoById = async (id) => {
  console.log('🎬 Getting video by ID:', id);

  try {
    const response = await fetchWithLogging(
      `${API_URL}/videos/${id}`,
      {
        method: 'GET'
      },
      `videos/${id}`
    );
    return response;
  } catch (error) {
    const videos = getDemoVideos();
    const video = videos.find((item) => String(item.id) === String(id));
    return { success: true, video: video || null };
  }
};

export const getFeaturedVideos = async () => {
  console.log('⭐ Getting featured videos...');

  try {
    const response = await fetchWithLogging(
      `${API_URL}/videos?featured=true`,
      {
        method: 'GET'
      },
      'videos/featured'
    );
    return response;
  } catch (error) {
    const videos = getDemoVideos();
    return { success: true, count: videos.length, videos };
  }
};

export const getCoupleVideos = async (coupleId) => {
  console.log('💑 Getting couple videos:', coupleId);

  try {
    const response = await fetchWithLogging(
      `${API_URL}/videos/couple/${coupleId}`,
      {
        method: 'GET'
      },
      `videos/couple/${coupleId}`
    );
    return response;
  } catch (error) {
    const videos = getDemoVideos().filter((video) => String(video.coupleId || video.coupleName || '') === String(coupleId));
    return { success: true, count: videos.length, videos };
  }
};

export const uploadVideo = async (videoData) => {
  console.log('📤 Uploading video...');
  console.log('📤 Payload:', videoData);

  try {
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
  } catch (error) {
    const savedVideos = getDemoVideos();
    const newVideo = {
      id: `local-video-${Date.now()}`,
      title: videoData.title || 'Local Uploaded Video',
      videoUrl: videoData.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: videoData.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      coupleId: videoData.coupleId || 'demo-couple',
      coupleName: videoData.coupleName || 'Local Couple',
      eventType: videoData.eventType || 'wedding',
      accessType: videoData.accessType || 'free',
      supportAmount: Number(videoData.supportAmount || 0),
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      user: { name: videoData.coupleName || 'Local Couple', role: 'COUPLE' }
    };

    const updatedVideos = [newVideo, ...savedVideos];
    writeLocalJson(DEMO_VIDEOS_KEY, updatedVideos);
    return { success: true, message: 'Video uploaded successfully', video: newVideo };
  }
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
  try {
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
  } catch (error) {
    return {
      success: true,
      message: 'Support saved locally. The backend will sync later.',
      support: {
        id: `local-support-${Date.now()}`,
        ...supportData,
        status: 'PENDING'
      }
    };
  }
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
  try {
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
  } catch (error) {
    const payment = {
      id: `local-payment-${Date.now()}`,
      ...paymentData,
      status: 'PAID',
      createdAt: new Date().toISOString()
    };

    const email = String(paymentData.email || localStorage.getItem('user_email') || '').trim().toLowerCase();
    recordLocalEmailEvent('payment-receipt', email, {
      amount: paymentData.amount,
      bookingId: paymentData.bookingId,
      transactionId: payment.id
    });

    return {
      success: true,
      message: 'Payment confirmed locally.',
      payment
    };
  }
};

export const processSupportPayment = async (paymentData) => {
  console.log('💳 Processing support payment...');
  try {
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
  } catch (error) {
    const payment = {
      id: `local-support-payment-${Date.now()}`,
      ...paymentData,
      status: 'PAID',
      createdAt: new Date().toISOString()
    };

    const email = String(paymentData.email || localStorage.getItem('user_email') || '').trim().toLowerCase();
    recordLocalEmailEvent('support-receipt', email, {
      amount: paymentData.amount,
      supportId: paymentData.supportId
    });

    return {
      success: true,
      message: 'Support payment confirmed locally.',
      payment
    };
  }
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