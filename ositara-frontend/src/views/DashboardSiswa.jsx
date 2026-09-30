import { useState } from 'react';
// Import logo dari folder src/assets/
import logoOsitaraImport from '../assets/LOGO OSITARA.png';

export default function DashboardPengurus({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [logoSrc, setLogoSrc] = useState(logoOsitaraImport);

  // Menu lengkap Pengurus OSIS termasuk Laporan Keuangan
  const menuItems = [
    'Beranda',
    'Pengajuan Proposal',
    'Program Kerja',
    'Anggota OSIS',
    'Laporan Keg.',
    'Laporan Keuangan'
  ];

  // Handler jika logo tidak ditemukan di src/assets
  const handleLogoError = () => {
    if (logoSrc !== '/assets/LOGO OSITARA.png') {
      setLogoSrc('/assets/LOGO OSITARA.png');
    }
  };

  // Render SVG Icon (Lengkap untuk semua menu)
  const renderIcon = (name) => {
    const className = "w-5 h-5";
    switch (name) {
      case 'Beranda':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'Pengajuan Proposal':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'Program Kerja':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'Anggota OSIS':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Laporan Keg.':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'Laporan Keuangan':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans antialiased text-slate-800">

      {/* SIDEBAR PENGURUS */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-5 shrink-0 min-h-screen shadow-lg">
        <div>
          {/* BRAND & LOGO OSITARA */}
          <div className="flex items-center space-x-3 mb-8 px-2 pt-2">
            <img
              src={logoSrc}
              alt="Logo OSITARA"
              className="w-10 h-10 object-contain rounded"
              onError={handleLogoError}
            />
            <div>
              <h1 className="text-2xl font-black tracking-wide text-white leading-none">OSITARA</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFF5BF] opacity-90">Pengurus OSIS</span>
            </div>
          </div>

          {/* NAVIGASI MENU */}
          <nav className="space-y-2">
            {menuItems.map((name) => {
              const isActive = activeMenu === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveMenu(name)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFF5BF] text-[#2158B8] shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span className={isActive ? 'text-[#2158B8]' : 'text-white'}>
                    {renderIcon(name)}
                  </span>
                  <span>{name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-white/90 hover:text-white font-bold text-sm transition hover:bg-white/10 rounded-xl cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* HEADER PROFIL */}
        <div className="flex items-center space-x-5 mb-8">
          <div className="w-16 h-16 bg-slate-200 border-2 border-slate-300 rounded-full flex items-center justify-center text-slate-400 shrink-0">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2158B8]">
              Halo, {user?.name || user?.email || 'Pengurus OSIS'}!
            </h2>
            <p className="text-[#2158B8]/80 font-semibold text-sm mt-0.5">
              Kelola proposal, program kerja, dan kegiatan siswa di sini.
            </p>
          </div>
        </div>

        {activeMenu === 'Beranda' ? (
          <>
            {/* 3 KARTU STATISTIK PENGURUS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Proposal Diajukan</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">00</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Proker Disetujui</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">00</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Kegiatan Mendarat</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">00</h3>
                </div>
              </div>
            </div>

            {/* STATUS PROPOSAL TERAKHIR */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#2158B8]">Status Pengajuan Terbaru</h3>
                <button
                  onClick={() => setActiveMenu('Pengajuan Proposal')}
                  className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer"
                >
                  + Buat Proposal
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#2158B8] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2158B8] text-base">Proposal Classmeeting 2026</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">Status: Menunggu Pembina</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-[#FFF5BF] text-[#2158B8] font-bold text-xs rounded-xl border border-[#2158B8]/20">
                  Proses
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
            <h3 className="text-xl font-bold text-[#2158B8] mb-2">Halaman {activeMenu}</h3>
            <p className="text-slate-500 text-sm">
              Area khusus untuk fitur <span className="font-bold">{activeMenu}</span> pengurus OSIS.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
