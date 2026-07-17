import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function getAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403 && error.response?.data?.message?.includes('FORCE_PASSWORD_CHANGE')) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.is_first_login = true;
      localStorage.setItem('user', JSON.stringify(user));

      if (window.location.pathname !== '/change-password') {
        window.location.href = '/change-password';
      }
    }

    return Promise.reject(error);
  },
);

export const authService = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  changePassword: (payload) => api.put('/auth/change-password', payload),
  changePasswordGuru: (payload) => api.put('/guru/change-password', payload),
};

export const entityService = {
  list: (endpoint, params = {}) => api.get(endpoint, { params }),
  get: (endpoint, id) => api.get(`${endpoint}/${id}`),
  create: (endpoint, payload) => api.post(endpoint, payload),
  update: (endpoint, id, payload) => api.put(`${endpoint}/${id}`, payload),
  remove: (endpoint, id) => api.delete(`${endpoint}/${id}`),
};

export default api;
