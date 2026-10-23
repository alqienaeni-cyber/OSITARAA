import { useState, useEffect, useCallback } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// --- DEKLARASI SVG / ICON DI LUAR KOMPONEN UTAMA ---
function Icon({ type }) {
  const icons = {
    beranda: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
    kegiatan: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    riwayat: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    logout: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    ),
    bell: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    check: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    )
  };
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[type] || null}
    </svg>
  );
}

const getInitialData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + performance.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
};

export default function DashboardSiswa({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // BACA DARI PROKER OSIS (KETUA) DAN KEGIATAN (SEKRETARIS)
  const [prokerList, setProkerList] = useState(() => getInitialData('ositara_proker', []));
  const [kegiatanList, setKegiatanList] = useState(() => getInitialData('ositara_kegiatan', []));
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const primary = getInitialData('ositara_pendaftaran', null);
    const secondary = getInitialData('pendaftaranList', []);
    return primary || secondary;
  });

  // State Profil Siswa & Modal Avatar
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_siswa_avatar') || null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // State Modal Form Pendaftaran
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [nisInput, setNisInput] = useState('');
  const [kelasInput, setKelasInput] = useState('');
  const [catatanInput, setCatatanInput] = useState('');

  // Sync Data Real-time
  const handleSync = useCallback(() => {
    setProkerList(getInitialData('ositara_proker', []));
    setKegiatanList(getInitialData('ositara_kegiatan', []));
    const savedPendaftaran = getInitialData('ositara_pendaftaran', null) || getInitialData('pendaftaranList', []);
    setPendaftaranList(savedPendaftaran);
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleSync);
    window.addEventListener('ositara_proker_updated', handleSync);
    window.addEventListener('ositara_kegiatan_updated', handleSync);
    window.addEventListener('ositara_pendaftaran_updated', handleSync);
    const interval = setInterval(handleSync, 1000);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ositara_proker_updated', handleSync);
      window.removeEventListener('ositara_kegiatan_updated', handleSync);
      window.removeEventListener('ositara_pendaftaran_updated', handleSync);
      clearInterval(interval);
    };
  }, [handleSync]);

  // Handler Upload / Ganti Avatar
  const handleUploadAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_siswa_avatar', reader.result);
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Hapus Avatar
  const handleHapusAvatar = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) {
      setAvatarUrl(null);
      localStorage.removeItem('ositara_siswa_avatar');
      setShowAvatarModal(false);
    }
  };

  const namaUser = user?.nama || user?.name || user?.username || 'Siswa OSITARA';
  const inisialNama = namaUser.charAt(0).toUpperCase();

  // Buka Modal Form Pendaftaran
  const handleOpenDaftar = (kegiatan) => {
    if (kegiatan.isProker) return;
    const isAlreadyRegistered = pendaftaranList.some(
      (p) => (p.kegiatanId === kegiatan.id || p.namaKegiatan === (kegiatan.namaKegiatan || kegiatan.nama)) && (p.namaSiswa === namaUser || p.nama === namaUser)
    );
    if (isAlreadyRegistered) {
      alert('Anda sudah terdaftar dalam kegiatan ini!');
      return;
    }
    setSelectedKegiatan(kegiatan);
  };

  // Submit Form Pendaftaran
  const handleSubmitPendaftaran = (e) => {
    e.preventDefault();
    if (!nisInput.trim() || !kelasInput.trim()) {
      alert('Mohon lengkapi NIS dan Kelas!');
      return;
    }
    const pendaftaranBaru = {
      id: generateUniqueId(),
      kegiatanId: selectedKegiatan.id,
      namaKegiatan: selectedKegiatan.namaKegiatan || selectedKegiatan.nama,
      tanggal: selectedKegiatan.tanggal,
      namaSiswa: namaUser,
      nama: namaUser,
      nis: nisInput.trim(),
      kelas: kelasInput.trim(),
      catatan: catatanInput.trim() || '-',
      status: 'Terdaftar',
      tanggalDaftar: new Date().toLocaleDateString('id-ID')
    };
    const updated = [pendaftaranBaru, ...pendaftaranList];
    setPendaftaranList(updated);
    localStorage.setItem('pendaftaranList', JSON.stringify(updated));
    localStorage.setItem('ositara_pendaftaran', JSON.stringify(updated));
    window.dispatchEvent(new Event('ositara_pendaftaran_updated'));
    setSelectedKegiatan(null);
    setNisInput('');
    setKelasInput('');
    setCatatanInput('');
    alert(`Berhasil mendaftar kegiatan "${selectedKegiatan.namaKegiatan || selectedKegiatan.nama}"!`);
  };

  const pendaftaranSaya = pendaftaranList.filter((p) => p.namaSiswa === namaUser || p.nama === namaUser);

  const menuList = [
    { id: 'beranda', label: 'Beranda', icon: 'beranda' },
    { id: 'kegiatan', label: 'Daftar Kegiatan', icon: 'kegiatan' },
    { id: 'riwayat', label: 'Kegiatan Saya', icon: 'riwayat' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F4F7] font-sans text-slate-800 w-full overflow-x-hidden">

      {/* HEADER NAVBAR MOBILE */}
      <div className="md:hidden bg-[#2158B8] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md w-full">
        <div className="flex items-center space-x-2.5">
          <img src={logoOsitara} alt="Logo OSITARA" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <h1 className="text-base font-black tracking-wider leading-none">OSITARA</h1>
            <p className="text-[9px] text-[#FFF5BF] font-bold tracking-wide uppercase mt-0.5">DASHBOARD SISWA</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition focus:outline-none cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* OVERLAY DRAWER MOBILE */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:sticky top-0 inset-y-0 left-0 z-50 h-screen
        w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0 shadow-xl
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="hidden md:flex items-center space-x-3 mb-10">
            <img src={logoOsitara} alt="Logo OSITARA" className="w-10 h-10 object-contain shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-[#FFF5BF] font-bold tracking-wide mt-1 uppercase">DASHBOARD SISWA</p>
            </div>
          </div>
          <nav className="space-y-1.5 mt-4 md:mt-0">
            {menuList.map((menu) => (
              <button
                key={menu.id}
                onClick={() => {
                  setActiveMenu(menu.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer text-left ${
                  activeMenu === menu.id ? 'bg-[#FFF3BF] text-[#2158B8] shadow-sm' : 'hover:bg-white/10 text-white'
                }`}
              >
                <Icon type={menu.icon} />
                <span className="leading-snug">{menu.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer text-left mt-6 md:mt-0">
          <Icon type="logout" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-x-hidden min-w-0 w-full">
        {/* HEADER USER */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 w-full">
            <div
              onClick={() => setShowAvatarModal(true)}
              className="relative group cursor-pointer shrink-0"
              title="Atur Foto Profil"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 rounded-full flex items-center justify-center text-[#2158B8] border-2 border-white shadow-sm font-black text-lg sm:text-xl">
                  {inisialNama}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold">
                Atur
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-2xl font-black text-[#2158B8] leading-tight break-words">
                Selamat Datang, {namaUser}!
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-snug">
                Cari dan ikuti berbagai kegiatan seru sekolah di OSITARA.
              </p>
            </div>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6">
            {/* STATISTIK RINGKAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-[#2158B8]/10 text-[#2158B8] rounded-2xl shrink-0">
                  <Icon type="calendar" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Total Proker OSIS</p>
                  <p className="text-xl sm:text-2xl font-black text-[#2158B8]">{prokerList.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
                  <Icon type="check" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Kegiatan Diikuti</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600">{pendaftaranSaya.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-[#FFF3BF] text-amber-700 rounded-2xl shrink-0">
                  <Icon type="bell" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Status Pendaftaran</p>
                  <p className="text-xl sm:text-2xl font-black text-amber-600">
                    {pendaftaranSaya.length > 0 ? 'Aktif' : 'Belum Ada'}
                  </p>
                </div>
              </div>
            </div>

            {/* BANNER INFORMASI OSIS */}
            <div className="bg-gradient-to-r from-[#2158B8] to-[#3b71d6] p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-[#FFF3BF] text-[#2158B8] text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 inline-block">
                  Pengumuman Resmi OSIS
                </span>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Portal Informasi OSITARA</h3>
                <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                  Selamat datang di portal OSITARA Siswa! Di sini kamu bisa memantau jadwal Program Kerja mingguan pengurus OSIS serta mendaftarkan diri pada event kegiatan sekolah yang sedang terbuka.
                </p>
              </div>
            </div>

            {/* JADWAL PROGRAM KERJA OSIS (HANYA INFO) */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#2158B8]">Program Kerja OSIS</h3>
                  <p className="text-xs text-slate-500 font-semibold">Jadwal dan agenda proker mingguan dari pengurus OSIS</p>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                  Informasi Agenda
                </span>
              </div>
              {prokerList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm font-semibold text-slate-400">Belum ada jadwal program kerja OSIS.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prokerList.map((item) => (
                    <div key={item.id} className="p-4 sm:p-5 border border-amber-100 bg-amber-50/30 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2 gap-2">
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                            Proker OSIS
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 shrink-0">{item.target || item.tanggal || '-'}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{item.nama}</h4>
                        <p className="text-xs text-slate-500">Divisi / Sekbid: <span className="font-semibold text-slate-700">{item.divisi || item.sekbid || 'Umum'}</span></p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-amber-100 text-center">
                        <span className="text-[11px] font-bold text-slate-400 italic">Hanya Informasi Proker</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. DAFTAR KEGIATAN SEKOLAH */}
        {activeMenu === 'kegiatan' && (
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8]">Daftar Kegiatan Sekolah Tersedia</h3>
            {kegiatanList.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl sm:rounded-3xl border border-slate-200 text-center text-slate-400">
                Belum ada agenda kegiatan sekolah yang dibuka.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {kegiatanList.map((item) => {
                  const isRegistered = pendaftaranList.some(
                    (p) => (p.kegiatanId === item.id || p.namaKegiatan === (item.namaKegiatan || item.nama)) && (p.namaSiswa === namaUser || p.nama === namaUser)
                  );
                  return (
                    <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base">{item.namaKegiatan || item.nama}</h4>
                          <span className="px-2.5 py-1 bg-blue-100 text-[#2158B8] font-bold text-[10px] rounded-full shrink-0">
                            Kegiatan
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-600 truncate">Jadwal: {item.tanggal}</span>
                        <button
                          disabled={isRegistered}
                          onClick={() => handleOpenDaftar(item)}
                          className={`px-3.5 py-2 font-bold text-xs rounded-xl transition shadow-sm cursor-pointer shrink-0 ${
                            isRegistered
                              ? 'bg-emerald-100 text-emerald-700 font-bold cursor-not-allowed border border-emerald-300'
                              : 'bg-[#FFB800] hover:bg-[#e0a200] text-slate-900'
                          }`}
                        >
                          {isRegistered ? 'Terdaftar' : 'Daftar Event'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. RIWAYAT KEGIATAN SAYA */}
        {activeMenu === 'riwayat' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto w-full">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Kegiatan yang Diikuti</h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="py-3.5 px-4 sm:px-6">Nama Kegiatan</th>
                  <th className="py-3.5 px-4 sm:px-6">NIS / Kelas</th>
                  <th className="py-3.5 px-4 sm:px-6">Jadwal Pelaksanaan</th>
                  <th className="py-3.5 px-4 sm:px-6">Tanggal Mendaftar</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendaftaranSaya.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400">Kamu belum mendaftar kegiatan apapun.</td></tr>
                ) : (
                  pendaftaranSaya.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">{item.namaKegiatan}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-600 font-medium">{item.nis || '-'} / {item.kelas || '-'}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-600 font-semibold">{item.tanggal}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500">{item.tanggalDaftar || '-'}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span className={`px-2.5 py-1 font-bold text-[10px] sm:text-xs rounded-full inline-block ${
                          item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          item.status === 'Ditolak' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        }`}>
                          {item.status || 'Terdaftar'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL FORM PENDAFTARAN */}
      {selectedKegiatan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-1">Form Pendaftaran Event</h3>
            <p className="text-xs font-semibold text-slate-500 mb-4">
              Nama Event: <span className="font-bold text-slate-800">{selectedKegiatan.namaKegiatan || selectedKegiatan.nama}</span>
            </p>
            <form onSubmit={handleSubmitPendaftaran} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2158B8] mb-1">NISN / NIS</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 242510076"
                  value={nisInput}
                  onChange={(e) => setNisInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2158B8] mb-1">Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: XI PPLG 4"
                  value={kelasInput}
                  onChange={(e) => setKelasInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2158B8] mb-1">Catatan (Opsional)</label>
                <textarea
                  rows="2"
                  placeholder="Tulis catatan jika ada..."
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FFB800] text-slate-900 font-bold text-xs rounded-2xl hover:bg-[#e0a200] transition cursor-pointer shadow-sm"
                >
                  Kirim Pendaftaran
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedKegiatan(null)}
                  className="py-3 px-4 bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl hover:bg-slate-300 transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL OPSI FOTO PROFIL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 border border-blue-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-[#2158B8]">Atur Foto Profil</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 pt-2">
              <label
                htmlFor="avatar-file-input-siswa"
                className="w-full py-3 bg-[#2158B8] text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer hover:bg-blue-700 transition"
              >
                <span>Ganti / Unggah Foto Baru</span>
              </label>
              <input
                id="avatar-file-input-siswa"
                type="file"
                accept="image/*"
                onChange={handleUploadAvatar}
                className="hidden"
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleHapusAvatar}
                  className="w-full py-3 bg-rose-100 text-rose-700 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer hover:bg-rose-200 transition"
                >
                  <span>Hapus Foto Profil</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
