import axios from 'axios';

// Membuat koneksi utama ke Laravel
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Alamat backend Laravel kamu
});

// Menempelkan token otomatis jika user sudah login
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
