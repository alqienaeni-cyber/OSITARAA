import { useState } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);

  // Nomor WhatsApp Admin / Pembina OSIS
  const whatsappAdminNumber = '628';

  const handleForgotPassword = () => {
    const message = encodeURIComponent(
      'Halo Admin OSITARA, saya lupa password akun saya. Mohon bantuannya untuk melakukan reset password.'
    );
    window.open(`https://wa.me/${whatsappAdminNumber}?text=${message}`, '_blank');
  };

  // Daftar akun seeder resmi (sesuai UserSeeder Laravel)
  const seederUsers = [
    { email: 'pembina@ositara.com', password: 'Osis26/27', name: 'Pak Sufiyan Muthahar', role: 'pembina' },
    { email: 'ketuaosis@ositara.com', password: 'Osis26/27', name: 'Anggi Anggraeni', role: 'pengurus' },
    { email: 'wakilketuaosis1@ositara.com', password: 'Osis26/27', name: 'Devi Fauziah', role: 'pengurus' },
    { email: 'wakilketuaosis2@ositara.com', password: 'Osis26/27', name: 'Oka Karina Siwi', role: 'pengurus' },
    { email: 'sekretaris1@ositara.com', password: 'Osis26/27', name: 'Naura Lutfiah', role: 'pengurus' },
    { email: 'sekretaris2@ositara.com', password: 'Osis26/27', name: 'Salfa Alena Eka Putri', role: 'pengurus' },
    { email: 'bendahara1@ositara.com', password: 'Osis26/27', name: 'Salsabila Zahir A', role: 'pengurus' },
    { email: 'bendahara2@ositara.com', password: 'Osis26/27', name: 'Shopia Widarti Noviani', role: 'pengurus' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !password) {
      setError('Email dan password wajib diisi terlebih dahulu!');
      return;
    }

    setLoading(true);

    try {
      // 1. Login via API Backend Laravel
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) localStorage.setItem('token', data.token);

        const userData = data.user || data.data?.user || data.data || data;
        localStorage.setItem('user', JSON.stringify(userData));
        if (onLoginSuccess) onLoginSuccess(userData);
        return;
      } else {
        // Bedakan pesan error dari backend Laravel (404 / belum terdaftar vs 401 / password salah)
        const rawMsg = (data.message || '').toLowerCase();
        if (
          response.status === 404 ||
          rawMsg.includes('tidak ditemukan') ||
          rawMsg.includes('belum terdaftar') ||
          rawMsg.includes('not found')
        ) {
          setError('Akun dengan email tersebut belum terdaftar. Silakan klik Daftar terlebih dahulu!');
        } else if (
          rawMsg.includes('password') ||
          rawMsg.includes('kata sandi') ||
          rawMsg.includes('salah')
        ) {
          setError('Password yang Anda masukkan salah! Silakan periksa kembali atau klik Lupa Password.');
        } else {
          setError(data.message || 'Email belum terdaftar atau password salah.');
        }
        setLoading(false);
        return;
      }
    } catch {
      // 2. Fallback Offline jika server Laravel belum aktif
      let registeredUsers = [];
      try {
        const storedUsers1 = localStorage.getItem('ositara_users');
        const storedUsers2 = localStorage.getItem('usersList');
        const storedUsers3 = localStorage.getItem('users');

        registeredUsers = [
          ...(storedUsers1 ? JSON.parse(storedUsers1) : []),
          ...(storedUsers2 ? JSON.parse(storedUsers2) : []),
          ...(storedUsers3 ? JSON.parse(storedUsers3) : []),
        ];
      } catch (err) {
        console.error('Gagal membaca user terdaftar dari storage', err);
      }

      const allLocalUsers = [...seederUsers, ...registeredUsers];

      // Cek apakah email sudah ada di daftar akun
      const foundUserByEmail = allLocalUsers.find(
        (u) => u.email?.toLowerCase().trim() === cleanEmail
      );

      if (!foundUserByEmail) {
        setError('Akun dengan email tersebut belum terdaftar. Silakan klik Daftar terlebih dahulu!');
        setLoading(false);
        return;
      }

      // Email ditemukan, cek kecocokan password
      if (foundUserByEmail.password && foundUserByEmail.password !== password) {
        setError('Password yang Anda masukkan salah! Silakan periksa kembali atau klik Lupa Password.');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(foundUserByEmail));
      if (onLoginSuccess) onLoginSuccess(foundUserByEmail);
    } finally {
      setLoading(false);
    }
  };

  const brandLetters = ['O', 'S', 'I', 'T', 'A', 'R', 'A'];

  return (
    <div className="min-h-screen bg-[#1751B3] flex items-center justify-center p-4 font-nunito">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-md text-center border border-slate-100">

        {/* Logo Menyala & Teks OSITARA Interaktif (Sama seperti halaman Register) */}
        <div className="flex flex-col items-center justify-center mb-5 select-none">
          <div className="group relative w-24 h-24 mb-2 flex items-center justify-center cursor-pointer">
            <div className="absolute inset-2 bg-amber-300/35 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={logoOsitara}
              alt="Logo OSITARA"
              className="relative w-full h-full object-contain animate-[bounce_3s_infinite] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-md"
            />
          </div>

          <h1 className="text-3xl font-black font-poppins text-[#1E40AF] tracking-wider flex items-center justify-center">
            {brandLetters.map((char, idx) => {
              const isLit = activeLetterIndex === idx;
              return (
                <span
                  key={idx}
                  onClick={() => setActiveLetterIndex(isLit ? null : idx)}
                  onMouseDown={() => setActiveLetterIndex(idx)}
                  className={`inline-block cursor-pointer transition-all duration-200 hover:text-[#FFC700] hover:-translate-y-1.5 hover:scale-110 active:scale-125 ${
                    isLit
                      ? 'text-[#FFC700] -translate-y-1.5 scale-110 drop-shadow-xs'
                      : 'text-[#1E40AF]'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </h1>

          <p className="text-xs font-bold text-[#2158B8] mt-1">
            Masuk Ke Akun Anda
          </p>
        </div>

        {/* Notifikasi Error Jelas & Terpisah */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold text-center animate-[pulse_0.4s_ease-in-out]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          <div>
            <input
              type="email"
              placeholder="Email (Nama@ositara.com)"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              required
              className={`w-full px-5 py-3.5 border border-transparent rounded-2xl text-slate-700 font-semibold text-sm focus:outline-none focus:border-[#2158B8] transition ${
                email.trim() ? 'bg-[#86C5FF]/20' : 'bg-slate-100'
              }`}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              required
              className={`w-full px-5 py-3.5 border border-transparent rounded-2xl text-slate-700 font-semibold text-sm focus:outline-none focus:border-[#2158B8] transition ${
                password ? 'bg-[#86C5FF]/20' : 'bg-slate-100'
              }`}
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
            className="w-full py-3.5 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-base rounded-2xl shadow-lg shadow-amber-400/50 hover:shadow-xl hover:shadow-amber-400/80 active:scale-95 transition-all duration-300 disabled:opacity-50 cursor-pointer"
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
