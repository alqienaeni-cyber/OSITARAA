import { useState } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Nomor WhatsApp Admin / Pembina OSIS (Silakan sesuaikan nomor ini)
  const whatsappAdminNumber = "628";

  const handleForgotPassword = () => {
    const message = encodeURIComponent("Halo Admin OSITARA, saya lupa password akun saya. Mohon bantuannya untuk melakukan reset password.");
    window.open(`https://wa.me/${whatsappAdminNumber}?text=${message}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        const userData = data.user || data;
        localStorage.setItem('user', JSON.stringify(userData));
        onLoginSuccess(userData);
        return;
      } else {
        setError(data.message || 'Email atau password salah.');
      }
    } catch {
      console.log("Menjalankan mode fallback login...");

      // Fallback otomatis jika API belum terhubung/offline
      let dummyRole = 'siswa';
      if (email.includes('pembina')) dummyRole = 'pembina';

      if (
        email.includes('pengurus') ||
        email.includes('sekretaris') ||
        email.includes('ketua') ||
        email.includes('bendahara')
      ) {
        dummyRole = 'bendahara';
      }

      const dummyUser = {
        name: email.split('@')[0] || 'User OSITARA',
        email: email,
        role: dummyRole
      };

      localStorage.setItem('token', 'dummy-token-12345');
      localStorage.setItem('user', JSON.stringify(dummyUser));
      onLoginSuccess(dummyUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-4 font-nunito">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl w-full max-w-md border border-slate-100 text-center">
        <div className="flex justify-center mb-4">
          <img src={logoOsitara} alt="OSITARA Logo" className="w-20 h-20 object-contain" />
        </div>

        <h1 className="text-3xl font-black font-poppins text-[#2158B8] tracking-wider mb-1">
          OSITARA
        </h1>
        <p className="text-sm font-bold text-[#2158B8] mb-6">
          Masuk Ke Akun Anda
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Masukkan Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-[#86C5FF]/15 border border-transparent rounded-2xl text-slate-700 font-semibold text-sm focus:outline-none focus:border-[#2158B8] transition"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-[#86C5FF]/15 border border-transparent rounded-2xl text-slate-700 font-semibold text-sm focus:outline-none focus:border-[#2158B8] transition"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer"
            >
              Lupa Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-base rounded-2xl shadow-md transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-xs font-bold text-slate-500">
          Belum Punya Akun?{' '}
          <button
            type="button"
            onClick={() => onGoToRegister && onGoToRegister()}
            className="text-[#2158B8] font-black hover:underline cursor-pointer"
          >
            Daftar
          </button>
        </p>
      </div>
    </div>
  );
}
