import { useState } from 'react';

export default function DashboardSiswa({ user, onLogout }) {
  const [kegiatan] = useState([
    { id: 1, nama: 'Peringatan Hari Kemerdekaan', tanggal: '17 Agustus 2026', lokasi: 'Lapangan Utama', status: 'Terdaftar' },
    { id: 2, nama: 'Lomba Debat Bahasa Indonesia', tanggal: '25 Agustus 2026', lokasi: 'Aula Sekolah', status: 'Buka' },
  ]);

  return (
    <div className="min-h-screen bg-brand-bg font-nunito flex flex-col">
      {/* Navbar Dashboard */}
      <header className="bg-brand-royal text-white px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-golden rounded-full flex items-center justify-center font-bold text-brand-royal font-poppins">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg font-poppins">OSITARA - Siswa</h1>
            <p className="text-xs text-brand-sky">Selamat Datang, {user?.name || 'Siswa'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          Keluar
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto w-full flex-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold font-poppins text-brand-royal mb-2">Kegiatan & Acara OSIS</h2>
          <p className="text-slate-500 text-xs mb-6">Daftar kegiatan OSIS yang dapat Anda ikuti.</p>

          <div className="grid md:grid-cols-2 gap-4">
            {kegiatan.map((item) => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold mb-2 ${
                    item.status === 'Terdaftar' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm font-poppins">{item.nama}</h3>
                  <p className="text-xs text-slate-500 mt-1">🗓️ {item.tanggal} | 📍 {item.lokasi}</p>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-brand-royal text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-800 transition-all">
                    {item.status === 'Terdaftar' ? 'Lihat Detail' : 'Daftar Kegiatan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
