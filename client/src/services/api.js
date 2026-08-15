import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      error.config?.url !== '/admin/login'
    ) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const eventAPI = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getCategories: () => api.get('/categories'),
  uploadImage: (file) => {
    const data = new FormData();
    data.append('image', file);
    return api.post('/events/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const announcementAPI = {
  getActive: () => api.get('/announcements'),
  getAll: () => api.get('/announcements/all'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getStats: () => api.get('/admin/stats'),
};

export const registrationAPI = {
  create: (data) => api.post('/register', data),
  getAll: () => api.get('/register/all'),
  search: (params = {}) => api.get('/register/search', { params }),
  updatePaymentStatus: (id, paymentStatus) => api.put(`/register/${id}/payment-status`, { paymentStatus }),
};

export const dashboardAPI = {
  getEventDashboard: (eventId) => api.get(`/events/${eventId}/dashboard`),
  exportEventData: (eventId, format = 'csv') =>
    api.get(`/events/${eventId}/export`, {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json',
    }),
};

export default api;
