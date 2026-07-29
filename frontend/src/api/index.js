import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- Auth ----
export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp, name) => api.post('/auth/verify-otp', { phone, otp, name }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateSafeStatus: (isSafe, location) => api.put('/auth/safe-status', { isSafe, location }),
};

// ---- SOS ----
export const sosAPI = {
  create: (data) => api.post('/sos', data),
  getAll: (params) => api.get('/sos', { params }),
  getById: (id) => api.get(`/sos/${id}`),
  accept: (id) => api.put(`/sos/${id}/accept`),
  updateStatus: (id, status, notes) => api.put(`/sos/${id}/status`, { status, notes }),
  cancel: (id) => api.delete(`/sos/${id}`),
};

// ---- Relief Requests ----
export const reliefAPI = {
  create: (data) => api.post('/relief', data),
  getAll: (params) => api.get('/relief', { params }),
  getById: (id) => api.get(`/relief/${id}`),
  approve: (id) => api.put(`/relief/${id}/approve`),
  assign: (id, volunteerId) => api.put(`/relief/${id}/assign`, { volunteerId }),
  updateStatus: (id, status) => api.put(`/relief/${id}/status`, { status }),
};

// ---- Camps ----
export const campAPI = {
  getAll: (params) => api.get('/camps', { params }),
  getById: (id) => api.get(`/camps/${id}`),
  create: (data) => api.post('/camps', data),
  update: (id, data) => api.put(`/camps/${id}`, data),
  delete: (id) => api.delete(`/camps/${id}`),
  updateOccupancy: (id, currentOccupancy) => api.put(`/camps/${id}/occupancy`, { currentOccupancy }),
};

// ---- Inventory ----
export const inventoryAPI = {
  getForCamp: (campId) => api.get(`/inventory/${campId}`),
  add: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  dispense: (id, quantity) => api.put(`/inventory/${id}/dispense`, { quantity }),
};

// ---- Alerts ----
export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  deactivate: (id) => api.put(`/alerts/${id}/deactivate`),
};

// ---- Tasks (Volunteer) ----
export const taskAPI = {
  getMyTasks: (params) => api.get('/tasks', { params }),
  getNearby: (params) => api.get('/tasks/nearby', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  updateStatus: (id, status, notes) => api.put(`/tasks/${id}/status`, { status, notes }),
};

// ---- Admin ----
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getReports: (params) => api.get('/admin/reports', { params }),
};

// ---- Notifications ----
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ---- Weather ----
export const weatherAPI = {
  get: (lat, lng) => api.get('/weather', { params: { lat, lng } }),
  getForecast: (lat, lng) => api.get('/weather/forecast', { params: { lat, lng } }),
  getIpLocation: () => api.get('/weather/ip-location'),
};

// ---- Donations ----
export const donationAPI = {
  getAll: () => api.get('/donations'),
  create: (data) => api.post('/donations', data),
  receive: (id) => api.put(`/donations/${id}/receive`),
};

// ---- News ----
export const newsAPI = {
  getLocal: () => api.get('/news/local'),
  getInternational: () => api.get('/news/international'),
  getTicker: () => api.get('/news/ticker'),
};

// ---- Global Safety Broadcasts ----
export const safetyAPI = {
  getAll: () => api.get('/safety'),
  post: (data) => api.post('/safety', data),
};

