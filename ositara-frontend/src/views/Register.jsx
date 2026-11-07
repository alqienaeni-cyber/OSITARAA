import { useState } from 'react';
import API from '../api';
import logoositara from '../assets/LOGO OSITARA.png';

export default function Register({ onGoToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    kelas: '',
    email: '',
    password: '',
    role: 'siswa', // Nilai role dikunci langsung ke 'siswa'
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

    const cleanEmail = formData.email.toLowerCase().trim();

    try {
      // 1. Coba kirim data ke API Backend Laravel via Axios
      const response = await API.post('/register', {
        ...formData,
        email: cleanEmail,
      });

      alert(response.data.message || 'Pendaftaran Siswa Berhasil!');
      onGoToLogin();
    } catch (err) {
      console.warn(
        'API Laravel tidak merespon / Network Error. Menyalakan mode fallback lokal...',
        err
      );

      // 2. MODE FALLBACK: Jika server Laravel mati/offline, simpan ke localStorage
      try {
        const storedUsers = localStorage.getItem('ositara_users');
        const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];

        // Cek apakah email sudah terdaftar sebelumnya
        const isExist = registeredUsers.some(
          (u) => u.email?.toLowerCase().trim() === cleanEmail
        );

        if (isExist) {
          setError(
            'Email sudah terdaftar! Silakan gunakan email lain atau langsung masuk.'
          );
          setLoading(false);
          return;
        }

        // Buat data siswa baru secara lokal
        const newUser = {
          id: Date.now(),
          name: formData.name,
          nama: formData.name,
          namaLengkap: formData.name,
          nisn: formData.nisn,
          kelas: formData.kelas,
          email: cleanEmail,
          password: formData.password,
          role: 'siswa',
        };

        registeredUsers.push(newUser);
        localStorage.setItem('ositara_users', JSON.stringify(registeredUsers));

        alert(
          'Pendaftaran Berhasil (Mode Lokal)! Silakan login dengan akun yang baru dibuat.'
        );
        onGoToLogin();
      } catch (storageErr) {
        console.error('Gagal menyimpan ke localStorage:', storageErr);
        setError('Gagal memproses pendaftaran secara lokal.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2158B8] flex items-center justify-center p-4 font-nunito relative">
      {/* Container utama dengan Shadow 3D yang lebih dalam */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(15,23,42,0.35)] w-full max-w-3xl border border-white/40 relative transform transition-all duration-300">

        {/* Tombol Kembali dengan Interaksi Hover & Click */}
        <button
          onClick={onGoToLogin}
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 bg-slate-400 hover:bg-slate-500 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <span>‹</span> Kembali
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-center mt-6 md:mt-0">

          {/* BAGIAN LOGO & JUDUL */}
          <div className="flex flex-col items-center justify-center text-center py-4 select-none">

            {/* Logo OSITARA Interaktif */}
            <div className="relative mb-3 group cursor-pointer">
              <img
                src={logoositara}
                alt="Logo OSITARA"
                className="w-32 h-32 md:w-36 md:h-36 object-contain drop-shadow-xl animate-bounce hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Judul OSITARA: Pop-Up per huruf */}
            <h1 className="text-3xl font-black font-poppins text-blue-900 tracking-wider flex justify-center items-center overflow-hidden py-1">
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

            {/* Subtitle "Buat Akun Siswa" */}
            <p className="text-xs text-blue-800 font-bold mt-1">
              Buat Akun Siswa
            </p>

          </div>

          {/* FORM PENDAFTARAN DENGAN INTERAKSI KONTROL */}
          <div>
            {error && (
              <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl mb-4 border border-red-200 text-center font-semibold shadow-sm animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="nisn"
                  required
                  value={formData.nisn}
                  onChange={handleChange}
                  placeholder="NISN/NIPD"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5"
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5"
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5"
                />
              </div>

              {/* Tombol Daftar Interaktif */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-extrabold py-3 rounded-xl text-xs shadow-md hover:shadow-lg hover:shadow-amber-400/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer mt-4"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
