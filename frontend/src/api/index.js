import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If any response returns 401, clear storage and redirect to login
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

// ─── Auth APIs ───────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login', data);
export const getMe        = ()     => api.get('/auth/me');

// ─── Settings APIs ───────────────────────────────────────────────
export const updateProfile  = (data) => api.patch('/settings/profile', data);
export const updatePassword = (data) => api.patch('/settings/password', data);

// ─── Activity APIs ───────────────────────────────────────────────
export const createActivity  = (data) => api.post('/activities', data);
export const getActivities   = (params) => api.get('/activities', { params });
export const getActivityById = (id) => api.get(`/activities/${id}`);
export const updateActivity  = (id, data) => api.patch(`/activities/${id}`, data);
export const deleteActivity  = (id) => api.delete(`/activities/${id}`);

// ─── Notification APIs ───────────────────────────────────────────
export const createNotification = (data) => api.post('/notifications', data);
export const getNotifications   = (params) => api.get('/notifications', { params });
export const getUnreadCount     = (recipientId) => api.get('/notifications/unread-count', { params: { recipientId } });
export const markAsRead         = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead      = (recipientId) => api.patch('/notifications/read-all', { recipientId });
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ─── User APIs ───────────────────────────────────────────────────
export const createUser = (data) => api.post('/users', data);
export const getUsers   = ()     => api.get('/users');