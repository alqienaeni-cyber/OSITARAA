import { useState, useEffect, useCallback } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// --- HELPER COMPONENT: ICON ---
function Icon({ type }) {
  const icons = {
    beranda: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
    keuangan: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    proposal: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    proker: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 022 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    anggota: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    ),
    kegiatan: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    logout: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    ),
    download: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    edit: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    ),
    trash: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
};

const getProposalData = () => {
  try {
    const primary = localStorage.getItem('ositara_proposal');
    const secondary = localStorage.getItem('ositara_proposals');
    const fallback = localStorage.getItem('proposals');
    const result = primary || secondary || fallback;
    return result ? JSON.parse(result) : [];
  } catch (e) {
    console.error('Error reading proposal data', e);
    return [];
  }
};

const getAnggotaData = () => {
  try {
    const primary = localStorage.getItem('ositara_anggota');
    const fallback = localStorage.getItem('anggotaList');
    const result = primary || fallback;
    return result ? JSON.parse(result) : [];
  } catch (e) {
    console.error('Error reading anggota data', e);
    return [];
  }
};

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + performance.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
};

export default function DashboardBendahara({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  // State Mobile Menu Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State Modal & Avatar Profil
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_bendahara_avatar') || null);
  // State Data Sinkronisasi Real-time
  const [keuanganList, setKeuanganList] = useState(() => getInitialData('ositara_keuangan', []));
  const [proposalList, setProposalList] = useState(() => getProposalData());
  const [prokerList, setProkerList] = useState(() => getInitialData('ositara_proker', []));
  const [anggotaList, setAnggotaList] = useState(() => getAnggotaData());
  const [kegiatanList, setKegiatanList] = useState(() => getInitialData('ositara_kegiatan', []));
  // State Form Keuangan
  const [keterangan, setKeterangan] = useState('');
  const [jenis, setJenis] = useState('Pemasukan');
  const [jumlah, setJumlah] = useState('');
  const [editingKeuanganId, setEditingKeuanganId] = useState(null);

  // LOGIKA SAPAAN NAMA
  const namaDisplay = user?.name || user?.namaLengkap || user?.nama || user?.username || 'Bendahara OSIS';
  const inisialNama = namaDisplay.charAt(0).toUpperCase();

  // SINKRONISASI REAL-TIME
  const handleSyncData = useCallback(() => {
    setKeuanganList(getInitialData('ositara_keuangan', []));
    setProposalList(getProposalData());
    setProkerList(getInitialData('ositara_proker', []));
    setAnggotaList(getAnggotaData());
    setKegiatanList(getInitialData('ositara_kegiatan', []));
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleSyncData);
    window.addEventListener('ositara_proposal_updated', handleSyncData);
    window.addEventListener('ositara_proker_updated', handleSyncData);
    window.addEventListener('ositara_keuangan_updated', handleSyncData);
    const interval = setInterval(handleSyncData, 1000);
    return () => {
      window.removeEventListener('storage', handleSyncData);
      window.removeEventListener('ositara_proposal_updated', handleSyncData);
      window.removeEventListener('ositara_proker_updated', handleSyncData);
      window.removeEventListener('ositara_keuangan_updated', handleSyncData);
      clearInterval(interval);
    };
  }, [handleSyncData]);

  // Handler Upload/Ganti Avatar
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
        localStorage.setItem('ositara_bendahara_avatar', reader.result);
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Hapus Avatar
  const handleHapusAvatar = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) {
      setAvatarUrl(null);
      localStorage.removeItem('ositara_bendahara_avatar');
      setShowAvatarModal(false);
    }
  };

  // Handler Keuangan
  const handleSimpanKeuangan = (e) => {
    e.preventDefault();
    if (!keterangan.trim() || !jumlah) return alert('Mohon isi keterangan dan jumlah nominal!');
    let updated;
    if (editingKeuanganId) {
      updated = keuanganList.map((item) =>
        item.id === editingKeuanganId
          ? { ...item, keterangan: keterangan.trim(), jenis, jumlah: Number(jumlah) }
          : item
      );
    } else {
      const dataBaru = {
        id: generateUniqueId(),
        keterangan: keterangan.trim(),
        jenis,
        jumlah: Number(jumlah),
        tanggal: new Date().toLocaleDateString('id-ID')
      };
      updated = [dataBaru, ...keuanganList];
    }
    setKeuanganList(updated);
    localStorage.setItem('ositara_keuangan', JSON.stringify(updated));
    window.dispatchEvent(new Event('ositara_keuangan_updated'));
    resetFormKeuangan();
  };

  const handleEditKeuangan = (item) => {
    setEditingKeuanganId(item.id);
    setKeterangan(item.keterangan);
    setJenis(item.jenis || item.kategori || 'Pemasukan');
    setJumlah(item.jumlah);
  };

  const resetFormKeuangan = () => {
    setEditingKeuanganId(null);
    setKeterangan('');
    setJenis('Pemasukan');
    setJumlah('');
  };

  const handleHapusKeuangan = (id) => {
    if (window.confirm('Hapus transaksi ini?')) {
      const updated = keuanganList.filter((item) => item.id !== id);
      setKeuanganList(updated);
      localStorage.setItem('ositara_keuangan', JSON.stringify(updated));
      window.dispatchEvent(new Event('ositara_keuangan_updated'));
    }
  };

  // Kalkulasi Keuangan
  const totalPemasukan = keuanganList
    .filter((k) => k.jenis === 'Pemasukan' || k.kategori === 'Pemasukan')
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  const totalPengeluaran = keuanganList
    .filter((k) => k.jenis === 'Pengeluaran' || k.kategori === 'Pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  const sisaSaldo = totalPemasukan - totalPengeluaran;

  const menuList = [
    { id: 'beranda', label: 'Beranda', icon: 'beranda' },
    { id: 'laporan-keuangan', label: 'Laporan Keuangan', icon: 'keuangan' },
    { id: 'pengajuan-proposal', label: 'Pengajuan Proposal', icon: 'proposal' },
    { id: 'program-kerja', label: 'Program Kerja', icon: 'proker' },
    { id: 'anggota-osis', label: 'Anggota OSIS', icon: 'anggota' },
    { id: 'kelola-kegiatan', label: 'Kelola Kegiatan', icon: 'kegiatan' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F4F7] font-sans text-slate-800 relative overflow-x-hidden">

      {/* HEADER MOBILE (Hanya Tampil di Layar HP/Tablet Kecil) */}
      <div className="md:hidden bg-[#2158B8] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <img src={logoOsitara} alt="Logo" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <h1 className="text-base font-black tracking-wider leading-none">OSITARA</h1>
            <p className="text-[9px] text-[#FFF5BF] font-bold tracking-wide uppercase mt-0.5">BENDAHARA OSIS</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* OVERLAY HITAM SAAT MOBILE MENU TERBUKA */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* SIDEBAR NAVIGATION (Responsive Drawer di HP) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0 shadow-xl
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="hidden md:flex items-center space-x-3 mb-10">
            <img src={logoOsitara} alt="Logo OSITARA" className="w-10 h-10 object-contain shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-[#FFF5BF] font-bold tracking-wide mt-1 uppercase">BENDAHARA OSIS</p>
            </div>
          </div>
          <nav className="space-y-1.5 mt-4 md:mt-0">
            {menuList.map((menu) => (
              <button
                key={menu.id}
                onClick={() => {
                  setActiveMenu(menu.id);
                  setIsMobileMenuOpen(false); // Otomatis Tutup Drawer di HP saat menu diklik
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
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer text-left mt-8 md:mt-0"
        >
          <Icon type="logout" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
        {/* HEADER USER */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 sm:space-x-4">
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
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2158B8]">Halo, {namaDisplay}!</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Jabatan: <span className="font-bold text-[#2158B8]">Bendahara OSIS</span></p>
            </div>
          </div>
        </div>

        {/* 1. BERANDA (RINGKASAN DASHBOARD) */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6 sm:space-y-8">
            {/* CARDS RINGKASAN DATA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Sisa Saldo Kas</p>
                  <h3 className="text-lg sm:text-xl font-black text-[#2158B8] mt-1 truncate">{formatRupiah(sisaSaldo)}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-[#2158B8] rounded-2xl flex items-center justify-center shrink-0 ml-2">
                  <Icon type="keuangan" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Total Pemasukan</p>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-600 mt-1 truncate">{formatRupiah(totalPemasukan)}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 ml-2">
                  <Icon type="keuangan" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Total Pengeluaran</p>
                  <h3 className="text-lg sm:text-xl font-black text-rose-500 mt-1 truncate">{formatRupiah(totalPengeluaran)}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 ml-2">
                  <Icon type="keuangan" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Catatan Transaksi</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{keuanganList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 ml-2">
                  <Icon type="keuangan" />
                </div>
              </div>
            </div>

            {/* RINGKASAN AKTIVITAS TERBARU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#2158B8]">Transaksi Terbaru</h3>
                  <button onClick={() => setActiveMenu('laporan-keuangan')} className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                    Lihat Semua →
                  </button>
                </div>
                <div className="space-y-3">
                  {keuanganList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Belum ada transaksi recorded.</p>
                  ) : (
                    keuanganList.slice(0, 4).map((item) => (
                      <div key={item.id} className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{item.keterangan}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{item.tanggal || '-'}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-full shrink-0 ${
                          (item.jenis || item.kategori) === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {(item.jenis || item.kategori) === 'Pemasukan' ? '+' : '-'} {formatRupiah(item.jumlah)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#2158B8]">Proposal Masuk</h3>
                  <button onClick={() => setActiveMenu('pengajuan-proposal')} className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                    Lihat Semua →
                  </button>
                </div>
                <div className="space-y-3">
                  {proposalList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Belum ada proposal diajukan.</p>
                  ) : (
                    proposalList.slice(0, 4).map((p) => (
                      <div key={p.id} className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{p.judul || p.judul_proposal}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{formatRupiah(p.anggaran)}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full shrink-0 ${
                          p.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'Ditolak' ? 'bg-gray-100 text-gray-700' : 'bg-[#FFF5BF] text-amber-800'
                        }`}>
                          {p.status || 'Menunggu'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. KELOLA KEUANGAN */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase">Total Pemasukan</p>
                <h3 className="text-lg sm:text-2xl font-black text-emerald-600 mt-1 sm:mt-2 truncate">{formatRupiah(totalPemasukan)}</h3>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase">Total Pengeluaran</p>
                <h3 className="text-lg sm:text-2xl font-black text-rose-500 mt-1 sm:mt-2 truncate">{formatRupiah(totalPengeluaran)}</h3>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase">Sisa Saldo Kas OSIS</p>
                <h3 className="text-lg sm:text-2xl font-black text-[#2158B8] mt-1 sm:mt-2 truncate">{formatRupiah(sisaSaldo)}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
                <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Catatan Arus Kas Keuangan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                        <th className="py-3 px-3 sm:px-4">Keterangan Transaksi</th>
                        <th className="py-3 px-3 sm:px-4">Jenis</th>
                        <th className="py-3 px-3 sm:px-4">Nominal</th>
                        <th className="py-3 px-3 sm:px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {keuanganList.length === 0 ? (
                        <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada transaksi recorded.</td></tr>
                      ) : (
                        keuanganList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-3 sm:px-4 font-bold text-slate-800">{item.keterangan}</td>
                            <td className="py-3 px-3 sm:px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold inline-block ${
                                (item.jenis || item.kategori) === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'
                              }`}>
                                {item.jenis || item.kategori}
                              </span>
                            </td>
                            <td className="py-3 px-3 sm:px-4 font-black text-slate-800">{formatRupiah(item.jumlah)}</td>
                            <td className="py-3 px-3 sm:px-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                                <button onClick={() => handleEditKeuangan(item)} className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition cursor-pointer" title="Edit Transaksi">
                                  <Icon type="edit" />
                                </button>
                                <button onClick={() => handleHapusKeuangan(item.id)} className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition cursor-pointer" title="Hapus Transaksi">
                                  <Icon type="trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">{editingKeuanganId ? 'Edit Transaksi' : 'Catat Transaksi Kas'}</h3>
                <form onSubmit={handleSimpanKeuangan} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Keterangan Transaksi</label>
                    <input type="text" required placeholder="Contoh: Dana Kas Sekolah" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Jenis Arus Kas</label>
                    <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2158B8] bg-white cursor-pointer">
                      <option value="Pemasukan">Pemasukan (+ Kas)</option>
                      <option value="Pengeluaran">Pengeluaran (- Kas)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Nominal (Rp)</label>
                    <input type="number" required placeholder="100000" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button type="submit" className="flex-1 py-3 bg-[#FFB800] text-slate-900 font-bold text-xs rounded-2xl hover:bg-[#e0a200] transition cursor-pointer shadow-sm">
                      {editingKeuanganId ? 'Simpan Perubahan' : 'Catat Transaksi'}
                    </button>
                    {editingKeuanganId && (
                      <button type="button" onClick={resetFormKeuangan} className="py-3 px-4 bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl hover:bg-slate-300 transition cursor-pointer">
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 3. PENGAJUAN PROPOSAL (READ-ONLY) */}
        {activeMenu === 'pengajuan-proposal' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Proposal Kegiatan (Sinkron Sekretaris)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-3 sm:px-4">Tanggal</th>
                    <th className="py-3.5 px-3 sm:px-4">Judul Proposal</th>
                    <th className="py-3.5 px-3 sm:px-4">Berkas PDF</th>
                    <th className="py-3.5 px-3 sm:px-4">Anggaran</th>
                    <th className="py-3.5 px-3 sm:px-4 text-center">Status</th>
                    <th className="py-3.5 px-3 sm:px-4">Catatan Pembina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-400">Belum ada proposal diajukan.</td></tr>
                  ) : (
                    proposalList.map((item) => {
                      const fileContent = item.fileData || item.fileUrl || item.file;
                      let fileName = item.fileProposal || item.fileNama;
                      if (!fileName || typeof fileName !== 'string' || fileName.startsWith('data:')) {
                        fileName = typeof item.file === 'string' && !item.file.startsWith('data:') ? item.file : `${item.judul || 'Proposal'}.pdf`;
                      }
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-3 sm:px-4 text-slate-500 font-medium">{item.tanggal || item.tanggal_pengajuan || '-'}</td>
                          <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800">{item.judul || item.judul_proposal}</td>
                          <td className="py-3.5 px-3 sm:px-4">
                            {fileContent ? (
                              <a href={fileContent} target="_blank" rel="noreferrer" download={fileName} className="inline-flex items-center space-x-1.5 bg-[#86C5FF]/30 hover:bg-[#86C5FF]/50 text-[#2158B8] font-bold px-3 py-1.5 rounded-xl border border-[#86C5FF] text-xs transition">
                                <Icon type="download" />
                                <span className="truncate max-w-[120px]">{fileName}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-xs">Tanpa File</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-700">{formatRupiah(item.anggaran)}</td>
                          <td className="py-3.5 px-3 sm:px-4 text-center">
                            <span className={`px-2.5 py-1 font-bold text-[10px] sm:text-xs rounded-full inline-block ${
                              item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                              item.status === 'Ditolak' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                              item.status === 'Revisi' || item.status === 'Perlu Revisi' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                              'bg-[#FFF5BF] text-amber-800 border border-[#FFC42B]'
                            }`}>
                              {item.status || 'Menunggu Persetujuan'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 text-slate-600 font-medium italic text-xs">{item.catatanRevisi || item.catatanPembina || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PROGRAM KERJA (READ-ONLY) */}
        {activeMenu === 'program-kerja' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Program Kerja OSIS (Sinkron Ketua OSIS)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-3 sm:px-4">Nama Program Kerja</th>
                    <th className="py-3.5 px-3 sm:px-4">Divisi Pelaksana</th>
                    <th className="py-3.5 px-3 sm:px-4">Target Pelaksanaan</th>
                    <th className="py-3.5 px-3 sm:px-4">Tujuan Proker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prokerList.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada program kerja terdaftar.</td></tr>
                  ) : (
                    prokerList.map((pk) => (
                      <tr key={pk.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800">{pk.nama}</td>
                        <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-600">{pk.divisi || pk.sekbid || '-'}</td>
                        <td className="py-3.5 px-3 sm:px-4 text-slate-500">{pk.tanggal || pk.target || '-'}</td>
                        <td className="py-3.5 px-3 sm:px-4 text-slate-500 text-xs">{pk.target || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ANGGOTA OSIS (READ-ONLY) */}
        {activeMenu === 'anggota-osis' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Anggota OSIS (Sinkron Ketua OSIS)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-3 sm:px-4">NIS</th>
                    <th className="py-3.5 px-3 sm:px-4">Nama Anggota</th>
                    <th className="py-3.5 px-3 sm:px-4">Jabatan</th>
                    <th className="py-3.5 px-3 sm:px-4">Divisi / Sekbid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggotaList.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada anggota terdaftar.</td></tr>
                  ) : (
                    anggotaList.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-3 sm:px-4 text-slate-500 font-medium">{a.nis || '-'}</td>
                        <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800">{a.nama || a.namaLengkap}</td>
                        <td className="py-3.5 px-3 sm:px-4 font-semibold text-[#2158B8]">{a.jabatan || '-'}</td>
                        <td className="py-3.5 px-3 sm:px-4 text-slate-600">{a.divisi || a.sekbid || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. KELOLA KEGIATAN (READ-ONLY) */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Kegiatan Sekolah (Sinkron Sekretaris)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-3 sm:px-4">Nama Kegiatan</th>
                    <th className="py-3.5 px-3 sm:px-4">Tanggal / Waktu</th>
                    <th className="py-3.5 px-3 sm:px-4">Deskripsi</th>
                    <th className="py-3.5 px-3 sm:px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kegiatanList.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada kegiatan terdaftar.</td></tr>
                  ) : (
                    kegiatanList.map((kg) => (
                      <tr key={kg.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800">{kg.nama || kg.namaKegiatan}</td>
                        <td className="py-3.5 px-3 sm:px-4 text-slate-500">{kg.tanggal || kg.waktu || '-'}</td>
                        <td className="py-3.5 px-3 sm:px-4 text-slate-600 text-xs">{kg.deskripsi || '-'}</td>
                        <td className="py-3.5 px-3 sm:px-4 text-center">
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-[#2158B8] rounded-full border border-blue-200">
                            {kg.status || 'Mendatang'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL AVATAR PROFIL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-5 sm:p-6 rounded-3xl max-w-sm w-full space-y-4 text-center shadow-xl">
            <h3 className="text-base sm:text-lg font-black text-[#2158B8]">Kelola Foto Profil</h3>
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-2 border-slate-200 flex items-center justify-center bg-slate-100">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-2xl sm:text-3xl text-[#2158B8]">{inisialNama}</span>
              )}
            </div>
            <div className="space-y-2 pt-2">
              <label className="block py-2.5 px-4 bg-[#2158B8] text-white font-bold text-xs rounded-2xl hover:bg-blue-800 transition cursor-pointer shadow-sm">
                Pilih Foto Baru
                <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
              </label>
              {avatarUrl && (
                <button
                  onClick={handleHapusAvatar}
                  className="w-full py-2.5 px-4 bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl hover:bg-rose-200 transition cursor-pointer"
                >
                  Hapus Foto Profil
                </button>
              )}
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-2.5 px-4 bg-slate-100 text-slate-600 font-bold text-xs rounded-2xl hover:bg-slate-200 transition cursor-pointer"
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
