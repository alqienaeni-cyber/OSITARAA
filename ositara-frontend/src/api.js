import axios from 'axios';

const api = axios.create({
  // Ganti dengan URL backend Wasmer kamu jika beda domain, atau gunakan '/api' jika satu domain
  baseURL: import.meta.env.VITE_API_URL || 'https://ositaraa.wasmer.app/api',
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
