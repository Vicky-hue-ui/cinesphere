import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In production, default to relative '/api' so it routes to the current host
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: auto-attach JWT token ───────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user?.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
      }
    } catch {
      // Silently ignore JSON parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 & static fallback detection ─────────────
axiosInstance.interceptors.response.use(
  (response) => {
    // Detect if static server answered an API call with an empty body or HTML doc
    if (
      typeof response.data === 'string' &&
      (response.data === '' || response.data.includes('<!DOCTYPE html>'))
    ) {
      return Promise.reject({
        response: {
          status: 503,
          data: {
            message:
              'Cannot reach backend server. Please verify your backend Web Service is running on Render.',
          },
        },
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth and redirect to login
      localStorage.removeItem('user');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
