import axios from 'axios';

// Membuat instance utama koneksi ke backend Laravel OSITARA
const API = axios.create({
  // Otomatis membaca dari .env atau fallback ke URL Railway produksi jika .env kosong
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ositaraa-production.up.railway.app/api',
  timeout: 10000, // Batas waktu maksimal request (10 detik)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk menyisipkan token Bearer secara otomatis di setiap request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani respon error global
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Jika token kedaluwarsa atau tidak valid (Unauthorized)
      if (error.response.status === 401) {
        console.warn('Sesi habis atau token tidak valid. Silakan login ulang.');
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
