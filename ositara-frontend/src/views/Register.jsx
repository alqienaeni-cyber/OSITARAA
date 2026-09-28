import { useState } from 'react';
import API from '../api';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function Register({ onGoToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    kelas: '',
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
      // Mengirimkan data registrasi ke Laravel API backend
      const response = await API.post('/register', formData);
      alert(response.data.message || 'Pendaftaran Berhasil!');
      onGoToLogin();
    } catch (err) {
      // Menampilkan pesan error sebenarnya dari server Laravel jika terjadi kegagalan
      const msg = err.response?.data?.message || 'Gagal terhubung ke server Laravel!';
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-nunito relative">
      {/* Container Modal / Card Utama */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-500/10 w-full max-w-3xl border border-slate-100 relative">

        {/* Tombol Kembali ke Halaman Login */}
        <button
          onClick={onGoToLogin}
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 bg-slate-400 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-500 transition-all shadow-sm"
        >
          <span>‹</span> Kembali
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-center mt-6 md:mt-0">

          {/* Bagian Kiri: Logo OSITARA & Label Header */}
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="w-28 h-28 mb-2 flex items-center justify-center">
              <img
                src={logoOsitara}
                alt="Logo OSITARA"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-black font-poppins text-blue-900 tracking-wider">OSITARA</h1>
            <p className="text-xs text-blue-800 font-bold mt-1">Buat Akun</p>
          </div>

          {/* Bagian Kanan: Form Input Registrasi */}
          <div>
            {error && (
              <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl mb-4 border border-red-100 text-center font-semibold">
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* Tombol Submit Registrasi */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-extrabold py-3 rounded-xl text-xs shadow-md transition-all mt-4 disabled:opacity-50"
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
