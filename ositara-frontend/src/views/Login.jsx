import { useState } from 'react';
import logoositara from '../assets/LOGO OSITARA.png';

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Nomor WhatsApp Admin
  const whatsappAdminNumber = "6283853924997";

  const handleForgotPassword = () => {
    const message = encodeURIComponent(
      "Halo Admin OSITARA, saya lupa password akun saya. Mohon bantuannya untuk melakukan reset password."
    );
    window.open(`https://wa.me/${whatsappAdminNumber}?text=${message}`, '_blank');
  };

  // DAFTAR AKUN SEEDER RESMI (SESUAI USERSEEDER LARAVEL)
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
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      // 1. Coba koneksi dan login via API Backend Laravel
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        const userData = data.user || data.data?.user || data.data || data;
        localStorage.setItem('user', JSON.stringify(userData));
        onLoginSuccess(userData);
        return;
      } else {
        setError(data.message || 'Email atau password salah. Akun belum terdaftar!');
        setLoading(false);
        return;
      }
    } catch {
      console.log("Menjalankan validasi akun terdaftar (Mode Offline/Fallback)...");

      // 2. Ambil data user terdaftar dari localStorage (Hasil Form Register)
      let registeredUsers = [];
      try {
        const storedUsers1 = localStorage.getItem('ositara_users');
        const storedUsers2 = localStorage.getItem('usersList');
        const storedUsers3 = localStorage.getItem('users');
        registeredUsers = [
          ...(storedUsers1 ? JSON.parse(storedUsers1) : []),
          ...(storedUsers2 ? JSON.parse(storedUsers2) : []),
          ...(storedUsers3 ? JSON.parse(storedUsers3) : [])
        ];
      } catch (err) {
        console.error("Gagal membaca user terdaftar dari storage", err);
      }

      // 3. Pencocokan akun di daftar Seeder atau Pendaftaran Siswa
      const matchedSeeder = seederUsers.find(
        (u) => u.email === cleanEmail && u.password === password
      );
      const matchedRegister = registeredUsers.find(
        (u) =>
          u.email?.toLowerCase().trim() === cleanEmail &&
          (u.password === password || !u.password)
      );

      const validUser = matchedSeeder || matchedRegister;

      // 4. Jika akun terdaftar & password benar
      if (validUser) {
        const loggedInUser = {
          id: validUser.id || 2,
          name: validUser.name || validUser.nama || validUser.namaLengkap || 'Siswa OSITARA',
          email: validUser.email,
          role: validUser.role || 'siswa',
          nisn: validUser.nisn || '',
          kelas: validUser.kelas || '',
        };

        localStorage.setItem('token', 'dummy-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        onLoginSuccess(loggedInUser);
      } else {
        setError('Akun belum terdaftar atau password salah. Silakan daftar terlebih dahulu!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2158B8] flex items-center justify-center p-4 font-nunito">
      {/* Container utama dengan Shadow 3D yang halus & kuat */}
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.35)] w-full max-w-md border border-white/40 text-center select-none transform transition-all duration-300">

        {/* LOGO OSITARA DENGAN ANIMASI INTERAKTIF */}
        <div className="flex justify-center mb-3">
          <div className="relative group cursor-pointer">
            <img
              src={logoositara}
              alt="OSITARA Logo"
              className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-xl animate-bounce hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>

        {/* TEKS OSITARA DENGAN ANIMASI POP-UP PER HURUF */}
        <h1 className="text-3xl font-black font-poppins text-[#2158B8] tracking-wider mb-1 flex justify-center items-center overflow-hidden py-1">
          {['O', 'S', 'I', 'T', 'A', 'R', 'A'].map((char, index) => (
            <span
              key={index}
              className="inline-block animate-[bounce_1s_ease-in-out_infinite] hover:scale-125 hover:text-amber-500 transition-all cursor-default"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* SUBTITLE */}
        <p className="text-sm font-bold text-[#2158B8] mb-6">
          Masuk Ke Akun Anda
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-xs font-bold text-center border border-red-200 shadow-sm animate-shake">
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
              className={`w-full px-5 py-3.5 border rounded-2xl text-slate-700 font-semibold text-sm focus:outline-none transition-all duration-200 hover:-translate-y-0.5 shadow-sm ${
                email.trim() !== ''
                  ? 'bg-[#86C5FF]/20 border-[#2158B8] ring-2 ring-[#2158B8]/20'
                  : 'bg-slate-100 border-slate-300 focus:border-[#2158B8] focus:bg-white focus:ring-2 focus:ring-[#2158B8]/30'
              }`}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-5 py-3.5 border rounded-2xl text-slate-700 font-semibold text-sm focus:outline-none transition-all duration-200 hover:-translate-y-0.5 shadow-sm ${
                password !== ''
                  ? 'bg-[#86C5FF]/20 border-[#2158B8] ring-2 ring-[#2158B8]/20'
                  : 'bg-slate-100 border-slate-300 focus:border-[#2158B8] focus:bg-white focus:ring-2 focus:ring-[#2158B8]/30'
              }`}
            />
          </div>

          {/* Lupa Password dengan Efek Hover */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-bold text-[#2158B8] hover:text-amber-500 hover:underline transition-colors duration-200 cursor-pointer"
            >
              Lupa Password?
            </button>
          </div>

          {/* Tombol Masuk Interaktif */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-base rounded-2xl shadow-md hover:shadow-lg hover:shadow-amber-400/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-xs font-bold text-slate-500">
          Belum Punya Akun?{' '}
          <button
            type="button"
            onClick={() => onGoToRegister && onGoToRegister()}
            className="text-[#2158B8] font-black hover:text-amber-500 hover:underline transition-colors duration-200 cursor-pointer"
          >
            Daftar
          </button>
        </p>

      </div>
    </div>
  );
}
