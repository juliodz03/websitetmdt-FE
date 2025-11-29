import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem('sessionId');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// User API
export const userAPI = {
  addAddress: (data) => api.post('/users/me/addresses', data),
  updateAddress: (id, data) => api.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`),
};

// Product API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getNew: () => api.get('/products/new'),
  getCategories: () => api.get('/products/categories'),
  getBrands: () => api.get('/products/brands'),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  addRating: (id, rating) => api.post(`/products/${id}/rating`, { rating }),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  updateCart: (data) => api.post('/cart', data),
  clearCart: () => api.delete('/cart'),
  mergeCart: (sessionId) => api.post('/cart/merge', { sessionId }),
};

// Checkout API
export const checkoutAPI = {
  preview: (data) => api.post('/checkout/preview', data),
  checkout: (data) => api.post('/checkout', data),
};

// Order API
export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
};

// Discount API
export const discountAPI = {
  validate: (code, params) => api.get(`/discounts/${code}/validate`, { params }),
};

// Admin API
export const adminAPI = {
  // Stats
  getStats: (params) => api.get('/admin/stats', { params }),
  
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrderDetails: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleUserBan: (id) => api.put(`/admin/users/${id}/ban`),
  
  // Products
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Discounts
  createDiscount: (data) => api.post('/admin/discounts', data),
  getDiscounts: (params) => api.get('/admin/discounts', { params }),
  toggleDiscount: (id) => api.put(`/admin/discounts/${id}/toggle`),
};
