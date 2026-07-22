import axios from 'axios';

const DEFAULT_CLOUD_API_URL = 'https://mini-erp-crm-operational-portal.onrender.com/api/v1';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  let url = envUrl && envUrl.trim() !== '' ? envUrl.trim() : DEFAULT_CLOUD_API_URL;
  if (!url.endsWith('/')) {
    url += '/';
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Robustly construct target URL to guarantee /api/v1 path prefix is never stripped by relative URL resolution
    if (config.url) {
      const base = getBaseUrl();
      const path = config.url.startsWith('/') ? config.url.substring(1) : config.url;
      config.url = base + path;
      config.baseURL = undefined; // Prevents Axios double-prefixing
    }

    const token = localStorage.getItem('token');
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
