import { useState } from 'react';
import API from '../api';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function Login({ onGoToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mengirimkan request login ke Laravel API
      const response = await API.post('/login', formData);

      // Mengambil objek user dari respon API
      const user = response.data.user;
      const userName = user?.name || 'User';

      // Menyimpan data user dan token ke localStorage
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Notifikasi selamat datang dinamis sesuai nama user yang login
      alert(`Login Berhasil! Selamat datang, ${userName}.`);

      // Mengarahkan ke halaman dashboard sesuai role
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau Password salah!';
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-nunito">
      {/* Container Card Login */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-500/10 w-full max-w-md border border-slate-100 relative">

        {/* Header Logo OSITARA */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="w-24 h-24 mb-2 flex items-center justify-center">
            <img
              src={logoOsitara}
              alt="Logo OSITARA"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-black font-poppins text-blue-900 tracking-wider">OSITARA</h1>
          <p className="text-xs text-blue-800 font-bold mt-1">Masuk Ke Akun Anda</p>
        </div>

        {/* Pesan Error Validasi / Kredensial Salah */}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl mb-4 border border-red-100 text-center font-semibold">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-[11px] text-blue-600 font-bold hover:underline"
            >
              Lupa Password?
            </button>
          </div>

          {/* Tombol Submit Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-extrabold py-3 rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Footer Navigasi ke Halaman Register */}
        <div className="mt-6 text-center text-xs font-semibold text-slate-500">
          <span>Belum Punya Akun? </span>
          <button
            onClick={onGoToRegister}
            className="text-blue-600 font-extrabold hover:underline"
          >
            Daftar
          </button>
        </div>

      </div>
    </div>
  );
}
