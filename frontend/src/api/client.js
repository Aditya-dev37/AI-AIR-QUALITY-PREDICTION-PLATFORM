import axios from 'axios';

// Automatically detect whether app is running on localhost or live deployed HTTPS server
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const RENDER_PROD_API = 'https://ai-air-quality-prediction-platform.onrender.com/api/v1';
const LOCAL_DEV_API = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (isLocalhost ? LOCAL_DEV_API : RENDER_PROD_API),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
