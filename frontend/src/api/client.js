import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname || 'localhost'}:8000`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if it's 401 and not the login request itself
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
      // Avoid infinite redirect loop
      console.warn('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;
