import { useState, useRef } from 'react';
// Import logo dari folder src/assets/
import logoOsitaraImport from '../assets/LOGO OSITARA.png';

export default function DashboardPembina({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [logoSrc, setLogoSrc] = useState(logoOsitaraImport);

  // State untuk mengelola proposal yang diverifikasi
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [notification, setNotification] = useState(null);

  // State khusus untuk Tab Filter di Menu Laporan
  const [laporanTab, setLaporanTab] = useState('Kegiatan');

  // State khusus untuk Modal Profil saat Avatar di-tap
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // State untuk menyimpan foto profil kustom (URL dari galeri)
  const [profileImage, setProfileImage] = useState(null);

  // Ref untuk input file tersembunyi
  const fileInputRef = useRef(null);

  // Fungsi untuk menangani unggah foto dari galeri
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  // Trigger klik pada input file tersembunyi
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fungsi untuk menghapus foto profil
  const handleRemoveImage = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) {
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Data Dummy Laporan
  const dataLaporan = [
    {
      id: 1,
      kategori: 'Kegiatan',
      judul: 'Laporan Kegiatan',
      subjudul: 'Unduh',
      fileUrl: '/files/Laporan_Kegiatan_OSIS.pdf',
      icon: (
        <svg className="w-7 h-7 text-[#2158B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 2,
      kategori: 'Keuangan',
      judul: 'Laporan Keuangan',
      subjudul: 'Unduh',
      fileUrl: '/files/Laporan_Keuangan_OSIS.pdf',
      icon: (
        <svg className="w-7 h-7 text-[#2158B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 3,
      kategori: 'Anggota',
      judul: 'Rekap Data anggota',
      subjudul: 'Unduh',
      fileUrl: '/files/Rekap_Data_Anggota.pdf',
      icon: (
        <svg className="w-7 h-7 text-[#2158B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const menuItems = ['Beranda', 'Kegiatan', 'Proker', 'Anggota', 'Keuangan', 'Laporan'];

  const handleLogoError = () => {
    if (logoSrc !== '/assets/LOGO OSITARA.png') {
      setLogoSrc('/assets/LOGO OSITARA.png');
    }
  };

  const renderIcon = (name) => {
    const className = "w-5 h-5";
    switch (name) {
      case 'Beranda':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'Kegiatan':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'Proker':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'Anggota':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Keuangan':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'Laporan':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleSetujui = () => {
    setNotification({ type: 'success', message: 'Proposal Berhasil Disetujui!' });
    setTimeout(() => {
      setNotification(null);
      setSelectedProposal(null);
      setCatatan('');
    }, 1500);
  };

  const handleTolak = () => {
    setNotification({ type: 'error', message: 'Proposal Ditolak!' });
    setTimeout(() => {
      setNotification(null);
      setSelectedProposal(null);
      setCatatan('');
    }, 1500);
  };

  // Filter Laporan berdasarkan Tab Aktif
  const filteredLaporan = dataLaporan.filter(item => item.kategori === laporanTab);

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans antialiased text-slate-800">

      {/* INPUT FILE TERSEMBUNYI UNTUK UNGGAH FOTO DARI GALERI */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* SIDEBAR PEMBINA */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-5 shrink-0 min-h-screen shadow-lg">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2 pt-2">
            <img
              src={logoSrc}
              alt="Logo OSITARA"
              className="w-10 h-10 object-contain rounded"
              onError={handleLogoError}
            />
            <h1 className="text-2xl font-black tracking-wide text-white">OSITARA</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((name) => {
              const isActive = activeMenu === name && !selectedProposal;
              return (
                <button
                  key={name}
                  onClick={() => {
                    setActiveMenu(name);
                    setSelectedProposal(null);
                  }}
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
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* HEADER DENGAN AVATAR BISA DI-TAP */}
        <div className="flex items-center space-x-5 mb-8">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Klik untuk lihat Profil"
            className="w-16 h-16 bg-slate-300 border-2 border-slate-300 rounded-full flex items-center justify-center text-slate-500 shrink-0 hover:ring-4 hover:ring-[#86C5FF]/50 transition cursor-pointer overflow-hidden shadow-sm relative"
          >
            {profileImage ? (
              <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-10 h-10 text-slate-500 mt-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2158B8]">
              Selamat Datang, {user?.name || user?.email || 'Bapak Pembina'}!
            </h2>
            <p className="text-[#2158B8]/80 font-semibold text-sm mt-0.5">
              Pantau & Kelola Kegiatan OSIS
            </p>
          </div>
        </div>

        {/* HALAMAN VERIFIKASI PROPOSAL */}
        {selectedProposal ? (
          <div className="flex flex-col items-center">
            {notification && (
              <div className={`w-full max-w-2xl mb-4 p-4 rounded-2xl text-center font-bold text-sm shadow-md transition ${
                notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}>
                {notification.message}
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl w-full max-w-2xl border border-slate-100">
              <button
                onClick={() => setSelectedProposal(null)}
                className="mb-6 flex items-center space-x-2 text-xs font-bold text-[#2158B8] hover:underline cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Kembali ke Dashboard</span>
              </button>

              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/50 shadow-sm flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-[#2158B8] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h2 className="text-xl md:text-2xl font-black text-[#2158B8] leading-tight">
                    {selectedProposal.judul}
                  </h2>
                  <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">
                    Diajukan Oleh: <span className="text-[#2158B8] font-bold">{selectedProposal.pengirim}</span>
                  </p>
                </div>
              </div>

              <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-[#2158B8] mb-2">
                  Deskripsi / Catatan Pembina
                </label>
                <textarea
                  rows="4"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tuliskan catatan atau deskripsi untuk menyetujui atau menolak proposal..."
                  className="w-full p-4 bg-white border border-[#86C5FF]/60 rounded-2xl text-slate-700 font-semibold text-sm focus:outline-none focus:border-[#2158B8] focus:ring-2 focus:ring-[#86C5FF]/40 transition resize-none"
                ></textarea>
              </div>

              <div className="mb-8 text-left">
                <h3 className="text-lg font-black text-[#2158B8] mb-3">
                  Dokumen Proposal
                </h3>
                <div className="bg-white p-4 rounded-2xl border border-[#86C5FF]/50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#2158B8] text-white rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-bold text-[#2158B8] text-base truncate max-w-[200px] sm:max-w-xs">
                      {selectedProposal.fileName}
                    </span>
                  </div>

                  <a
                    href={selectedProposal.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-black text-[#2158B8] hover:underline bg-[#86C5FF]/20 hover:bg-[#86C5FF]/40 px-4 py-2 rounded-xl transition"
                  >
                    Lihat
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleTolak}
                  className="w-full py-3.5 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-base rounded-2xl shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Tolak
                </button>

                <button
                  type="button"
                  onClick={handleSetujui}
                  className="w-full py-3.5 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-base rounded-2xl shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Setujui
                </button>
              </div>
            </div>
          </div>
        ) : activeMenu === 'Beranda' ? (
          <>
            {/* 3 KARTU STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Menunggu Verifikasi</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">01</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Kegiatan Aktif</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">00</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Laporan Masuk</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">00</h3>
                </div>
              </div>
            </div>

            {/* LIST PROPOSAL TERBARU */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Proposal Terbaru</h3>
              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#2158B8] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2158B8] text-base">Proposal Classmeeting 2026</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">Diajukan oleh: Pengurus OSIS</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProposal({
                    id: 1,
                    judul: 'Proposal Classmeeting 2026',
                    pengirim: 'Pengurus OSIS (Sekretaris)',
                    fileUrl: '/files/Proposal_Classmeeting_2026.pdf',
                    fileName: 'Proposal_Classmeeting_2026.pdf'
                  })}
                  className="px-6 py-2.5 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-xs rounded-xl transition cursor-pointer shadow-sm active:scale-95"
                >
                  Verifikasi
                </button>
              </div>
            </div>
          </>
        ) : activeMenu === 'Laporan' ? (
          /* HALAMAN SIDEBAR LAPORAN */
          <div className="max-w-2xl mx-auto py-4">

            {/* TAB FILTER (Kegiatan, Keuangan, Anggota) */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              {['Kegiatan', 'Keuangan', 'Anggota'].map((tab) => {
                const isSelected = laporanTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setLaporanTab(tab)}
                    className={`px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm cursor-pointer ${
                      isSelected
                        ? 'bg-[#D9E9FF] text-[#2158B8] font-bold shadow-inner'
                        : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* DAFTAR LAPORAN */}
            <div className="space-y-4">
              {filteredLaporan.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-[#86C5FF]/40 shadow-sm flex items-center justify-between transition hover:shadow-md"
                >
                  {/* SISI KIRI: ICON + JUDUL & SUBJUDUL */}
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-[#D9E9FF]/50 rounded-xl flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2158B8] text-lg leading-tight">
                        {item.judul}
                      </h4>
                      <p className="text-xs text-[#2158B8]/70 font-semibold mt-1">
                        {item.subjudul}
                      </p>
                    </div>
                  </div>

                  {/* SISI KANAN: TOMBOL '>' MEMBUKA FILE PDF DI TAB BARU */}
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka File / PDF"
                    className="w-12 h-10 bg-[#D9E9FF]/60 hover:bg-[#2158B8] text-[#2158B8] hover:text-white rounded-xl flex items-center justify-center transition font-black text-lg cursor-pointer"
                  >
                    &gt;
                  </a>
                </div>
              ))}

              {filteredLaporan.length === 0 && (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium text-sm">
                  Tidak ada laporan untuk kategori ini.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
            <h3 className="text-xl font-bold text-[#2158B8] mb-2">Halaman {activeMenu}</h3>
            <p className="text-slate-500 text-sm">
              Ini adalah area konten untuk menu <span className="font-bold">{activeMenu}</span>.
            </p>
          </div>
        )}

        {/* MODAL / TAMPILAN PROFIL SAAT AVATAR DI-TAP */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative text-center">

              {/* TOMBOL TUTUP MODAL */}
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* AVATAR DENGAN TOMBOL UBAH FOTO (AKSES GALERI) */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="relative group">
                  <div
                    onClick={handleAvatarClick}
                    title="Klik untuk memilih foto dari galeri"
                    className="w-20 h-20 bg-slate-300 rounded-full flex items-center justify-center text-slate-500 shrink-0 overflow-hidden shadow-inner cursor-pointer hover:opacity-90 transition border-2 border-[#2158B8]"
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Foto Profil" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-14 h-14 text-slate-500 mt-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>

                  {/* IKON KAMERA PADA AVATAR */}
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    title="Pilih Foto dari Galeri"
                    className="absolute bottom-0 right-0 bg-[#2158B8] text-white p-1.5 rounded-full shadow-md hover:bg-blue-700 transition cursor-pointer border-2 border-white"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                <div className="text-left">
                  <h3 className="text-2xl font-extrabold text-[#2158B8]">
                    {user?.name || user?.email || 'Nama/usn'}
                  </h3>

                  <div className="flex items-center space-x-2 mt-0.5">
                    <button
                      onClick={handleAvatarClick}
                      className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer"
                    >
                      Ubah Foto
                    </button>
                    {profileImage && (
                      <>
                        <span className="text-slate-300 text-xs">•</span>
                        <button
                          onClick={handleRemoveImage}
                          className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* LIST MENU PROFIL (Data Pribadi, Informasi, Pengaturan) */}
              <div className="space-y-4 mb-8">
                {['Data Pribadi', 'Informasi', 'Pengaturan'].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-2xl p-4 border border-[#86C5FF]/50 shadow-sm flex items-center justify-between transition hover:border-[#2158B8]"
                  >
                    <span className="font-bold text-[#2158B8] text-sm">
                      {item}
                    </span>
                    <button
                      onClick={() => alert(`Membuka ${item}`)}
                      className="w-9 h-8 bg-[#D9E9FF]/60 hover:bg-[#2158B8] text-[#2158B8] hover:text-white rounded-lg flex items-center justify-center transition font-bold text-sm cursor-pointer"
                    >
                      &gt;
                    </button>
                  </div>
                ))}
              </div>

              {/* TOMBOL LOGOUT */}
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onLogout();
                }}
                className="text-slate-400 hover:text-red-500 font-bold text-xs tracking-wider uppercase transition cursor-pointer"
              >
                Logout
              </button>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
