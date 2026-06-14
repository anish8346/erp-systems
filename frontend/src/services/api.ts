import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Force the interceptor to ALWAYS pull the latest token from storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Aggressively disable browser caching for API requests too
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
