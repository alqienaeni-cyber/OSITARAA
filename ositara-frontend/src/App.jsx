import { useState } from 'react';
import Login from './views/Login';
import DashboardPengurus from './views/DashboardPengurus';
import DashboardPembina from './views/DashboardPembina';
import DashboardSiswa from './views/DashboardSiswa';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Gagal membaca user dari localStorage:", e);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [, setPage] = useState('login');

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setPage('login');
  };

  // Render Dashboard jika pengguna sudah login
  if (user) {
    // Menangani fleksibilitas struktur data role dari backend
    const userRole = (user.role || user.data?.role || '').toString().toLowerCase().trim();

    // 1. Jika Role adalah Pembina
    if (userRole === 'pembina') {
      return <DashboardPembina user={user} onLogout={handleLogout} />;
    }

    // 2. Jika Role adalah Siswa Biasa
    if (userRole === 'siswa') {
      return <DashboardSiswa user={user} onLogout={handleLogout} />;
    }

    // 3. Semua Role Pengurus OSIS (Ketua, Sekretaris, Bendahara, Pengurus, dll)
    return <DashboardPengurus user={user} onLogout={handleLogout} />;
  }

  // Tampilan Login jika belum login
  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onGoToRegister={() => setPage('register')}
    />
  );
}
