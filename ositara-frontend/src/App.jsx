import { useState } from 'react';
import Login from './views/Login';
import Register from './views/Register';

export default function App() {
  // State untuk berpindah antara 'login' dan 'register'
  const [currentView, setCurrentView] = useState('login');

  const handleLoginSuccess = (data) => {
    alert(`Login Berhasil! Selamat datang, ${data?.user?.name || 'Pengguna'}.`);
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {currentView === 'login' ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => setCurrentView('register')}
        />
      ) : (
        <Register
          onGoToLogin={() => setCurrentView('login')}
          onBackToLanding={() => setCurrentView('login')}
        />
      )}
    </div>
  );
}
