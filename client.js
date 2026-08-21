import axios from 'axios';

// Default to Render live API URL when deployed, or localhost when developing locally
const RENDER_LIVE_API_URL = 'https://ai-air-quality-prediction-platform.onrender.com/api/v1';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || RENDER_LIVE_API_URL,
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
