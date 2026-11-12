import { useState, useEffect, useRef } from 'react';
import API from '../api';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function Register({ onGoToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    kelas: '',
    email: '',
    password: '',
    role: 'siswa',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);

  // Simpan referensi fungsi navigasi agar timer tidak ter-reset saat re-render
  const onGoToLoginRef = useRef(onGoToLogin);
  useEffect(() => {
    onGoToLoginRef.current = onGoToLogin;
  }, [onGoToLogin]);

  // Hitung mundur berjalan stabil setiap 1 detik
  useEffect(() => {
    if (!successModal) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSuccessModal(false);
          if (onGoToLoginRef.current) onGoToLoginRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [successModal]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = formData.name.trim();
    const cleanNisn = formData.nisn.trim();
    const cleanKelas = formData.kelas.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!cleanName || !cleanNisn || !cleanKelas || !cleanEmail || !password) {
      setError('Semua data wajib diisi sebelum mendaftar!');
      return;
    }

    const ositaraEmailRegex = /^[a-zA-Z0-9._-]+@ositara\.com$/;
    if (!ositaraEmailRegex.test(cleanEmail)) {
      setError('Email wajib menggunakan alamat @ositara.com (contoh: nama@ositara.com)!');
      return;
    }

    if (password.length < 6) {
      setError('Password harus terdiri dari minimal 6 karakter!');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      name: cleanName,
      nisn: cleanNisn,
      kelas: cleanKelas,
      email: cleanEmail,
      password: password,
      role: 'siswa',
    };

    try {
      const response = await API.post('/register', payload);
      if (response.status === 200 || response.status === 201) {
        setCountdown(3);
        setSuccessModal(true);
      }
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstValidationMsg = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;
      const msg =
        firstValidationMsg ||
        err.response?.data?.message ||
        'Gagal terhubung ke server Laravel! Pastikan php artisan serve aktif.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const brandLetters = ['O', 'S', 'I', 'T', 'A', 'R', 'A'];

  return (
    <div className="min-h-screen bg-[#1751B3] flex items-center justify-center p-4 font-nunito relative">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-500/10 w-full max-w-3xl border border-slate-100 relative">

        {/* Tombol Kembali */}
        <button
          type="button"
          onClick={() => onGoToLogin && onGoToLogin()}
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 bg-slate-400 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-500 hover:-translate-x-0.5 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <span>‹</span> Kembali
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-center mt-6 md:mt-0">

          {/* Kolom Kiri: Logo Menyala & Teks OSITARA Bergerak + Ganti Warna */}
          <div className="flex flex-col items-center justify-center text-center py-4 select-none">
            <div className="group relative w-28 h-28 mb-2 flex items-center justify-center cursor-pointer">
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
                        ? 'text-[#F59E0B] -translate-y-1.5 scale-110 drop-shadow-xs'
                        : 'text-[#1E40AF]'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </h1>

            <p className="text-xs text-blue-800 font-bold mt-1">
              Buat Akun Siswa
            </p>
          </div>

          {/* Kolom Kanan: Form */}
          <div>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl mb-4 border border-red-200 text-center font-bold animate-[pulse_0.4s_ease-in-out]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 transition-all shadow-sm"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="nisn"
                  required
                  value={formData.nisn}
                  onChange={handleChange}
                  placeholder="NISN / NIPD"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 transition-all shadow-sm"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="kelas"
                  required
                  value={formData.kelas}
                  onChange={handleChange}
                  placeholder="Kelas"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 transition-all shadow-sm"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email (Nama@ositara.com)"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 transition-all shadow-sm"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-amber-400/50 hover:shadow-xl hover:shadow-amber-400/80 active:shadow-amber-400/90 active:scale-95 transition-all duration-300 mt-4 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* NOTIFIKASI TOAST KECIL & RESPONSIF (COCOK UNTUK DESKTOP & HP) */}
      {successModal && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[330px]">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-emerald-200 flex items-center gap-3 relative overflow-hidden">

            {/* Ikon centang hijau mungil */}
            <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Teks ringkas */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-extrabold text-slate-800 leading-tight">
                Pendaftaran Berhasil!
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                Menuju login dalam <span className="font-bold text-[#1751B3]">{countdown}d</span>...
              </p>
            </div>

            {/* Tombol langsung pindah tanpa menunggu */}
            <button
              type="button"
              onClick={() => {
                setSuccessModal(false);
                if (onGoToLoginRef.current) onGoToLoginRef.current();
              }}
              className="px-3 py-1.5 bg-[#1751B3] hover:bg-blue-800 text-white font-bold text-[11px] rounded-xl transition-all shrink-0 cursor-pointer active:scale-95"
            >
              Masuk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
