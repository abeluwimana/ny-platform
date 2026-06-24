const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const adminApi = {
  getToken: () => localStorage.getItem('admin_token'),
  
  async request(endpoint, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
      window.location.href = '/admin/login';
      throw new Error('Session expired');
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  },
  
  // Dashboard
  getDashboard: () => adminApi.request('/admin/dashboard'),
  
  // Users
  getUsers: (params = {}) => adminApi.request(`/admin/users?${new URLSearchParams(params)}`),
  getUserById: (id) => adminApi.request(`/admin/users/${id}`),
  updateUserRole: (id, role) => adminApi.request(`/admin/users/${id}/role`, { 
    method: 'PUT', 
    body: JSON.stringify({ role }) 
  }),
  toggleUserStatus: (id) => adminApi.request(`/admin/users/${id}/toggle-status`, { method: 'PUT' }),
  deleteUser: (id) => adminApi.request(`/admin/users/${id}`, { method: 'DELETE' }),
  
  // Bookings
  getBookings: (params = {}) => adminApi.request(`/admin/bookings?${new URLSearchParams(params)}`),
  updateBookingStatus: (id, status, totalAmount = null) => adminApi.request(`/admin/bookings/${id}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ status, totalAmount }) 
  }),
  
  // Videos
  getVideos: (params = {}) => adminApi.request(`/admin/videos?${new URLSearchParams(params)}`),
  approveVideo: (id) => adminApi.request(`/admin/videos/${id}/approve`, { method: 'PUT' }),
  rejectVideo: (id, reason) => adminApi.request(`/admin/videos/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  featureVideo: (id) => adminApi.request(`/admin/videos/${id}/feature`, { method: 'PUT' }),
  
  // Supports
  getSupports: () => adminApi.request('/admin/supports'),
  
  // Payments
  getPayments: () => adminApi.request('/admin/payments'),
  
  // Posts
  getPosts: () => adminApi.request('/admin/posts'),
  deletePost: (id) => adminApi.request(`/admin/posts/${id}`, { method: 'DELETE' }),
};

export default adminApi;