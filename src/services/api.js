// src/services/api.js

const API_URL = 'https://ny-entertainment-backend.onrender.com/api';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper for authenticated requests
const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// ============ AUTH API ============

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeader()
  });
  return response.json();
};

// ============ BOOKING API ============

export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(bookingData)
  });
  return response.json();
};

export const getMyBookings = async () => {
  const response = await fetch(`${API_URL}/bookings/my-bookings`, {
    headers: authHeader()
  });
  return response.json();
};

// ============ VIDEO API ============

export const getVideos = async () => {
  const response = await fetch(`${API_URL}/videos`);
  return response.json();
};

export const uploadVideo = async (videoData) => {
  const response = await fetch(`${API_URL}/videos`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(videoData)
  });
  return response.json();
};

// ============ SUPPORT API ============

export const supportCouple = async (supportData) => {
  const response = await fetch(`${API_URL}/support`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(supportData)
  });
  return response.json();
};

export const getMySupportHistory = async () => {
  const response = await fetch(`${API_URL}/support/my`, {
    headers: authHeader()
  });
  return response.json();
};

export const getCoupleEarnings = async () => {
  const response = await fetch(`${API_URL}/support/earnings`, {
    headers: authHeader()
  });
  return response.json();
};

export const getTopSupportedCouples = async () => {
  const response = await fetch(`${API_URL}/support/top-couples`);
  return response.json();
};

// ============ PAYMENT API ============

export const processBookingPayment = async (paymentData) => {
  const response = await fetch(`${API_URL}/payments/booking`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(paymentData)
  });
  return response.json();
};

export const processSupportPayment = async (paymentData) => {
  const response = await fetch(`${API_URL}/payments/support`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(paymentData)
  });
  return response.json();
};

export const getMyPayments = async () => {
  const response = await fetch(`${API_URL}/payments/my`, {
    headers: authHeader()
  });
  return response.json();
};

// ============ NOTIFICATION API ============

export const getNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: authHeader()
  });
  return response.json();
};

export const markNotificationRead = async (id) => {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: authHeader()
  });
  return response.json();
};

export const markAllNotificationsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: authHeader()
  });
  return response.json();
};

// ============ EMAIL API ============

export const sendWelcomeEmail = async (email, name) => {
  const response = await fetch(`${API_URL}/email/welcome`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email, name })
  });
  return response.json();
};

export const sendBookingConfirmationEmail = async (email, booking) => {
  const response = await fetch(`${API_URL}/email/booking-confirmation`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email, booking })
  });
  return response.json();
};

export const sendPaymentReceiptEmail = async (email, payment) => {
  const response = await fetch(`${API_URL}/email/payment-receipt`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email, payment })
  });
  return response.json();
};

export const sendSupportReceiptEmail = async (email, support) => {
  const response = await fetch(`${API_URL}/email/support-receipt`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email, support })
  });
  return response.json();
};

// ============ ANALYTICS API ============

export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/analytics/dashboard`, {
    headers: authHeader()
  });
  return response.json();
};

// ============ ADMIN API ============

export const getAllUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: authHeader()
  });
  return response.json();
};

export const updateBookingStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ status })
  });
  return response.json();
};

export const approveVideo = async (id) => {
  const response = await fetch(`${API_URL}/admin/videos/${id}/approve`, {
    method: 'PUT',
    headers: authHeader()
  });
  return response.json();
};