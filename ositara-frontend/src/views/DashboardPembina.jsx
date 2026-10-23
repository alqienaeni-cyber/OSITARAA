import { useState, useEffect, useCallback } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// --- HELPER COMPONENT: ICON ---
function Icon({ type }) {
  const icons = {
    beranda: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
    proposal: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    proker: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 022 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    keuangan: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    anggota: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    ),
    logout: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    ),
    download: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    )
  };
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[type] || null}
    </svg>
  );
}

// --- HELPER UTILS ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

const getProposalData = () => {
  try {
    const dataPrimary = localStorage.getItem('ositara_proposal');
    const dataSecondary = localStorage.getItem('ositara_proposals');
    const result = dataPrimary || dataSecondary;
    return result ? JSON.parse(result) : [];
  } catch (e) {
    console.error('Error reading proposals from localStorage', e);
    return [];
  }
};

const getInitialData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return fallback;
  }
};

export default function DashboardPembina({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_pembina_avatar') || null);

  const [proposalList, setProposalList] = useState(() => getProposalData());
  const [prokerList, setProkerList] = useState(() => getInitialData('ositara_proker', []));
  const [keuanganList, setKeuanganList] = useState(() => getInitialData('ositara_keuangan', []));
  const [anggotaList, setAnggotaList] = useState(() => getInitialData('ositara_anggota', []));

  const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [catatanRevisiInput, setCatatanRevisiInput] = useState('');

  const handleSync = useCallback(() => {
    setProposalList(getProposalData());
    setProkerList(getInitialData('ositara_proker', []));
    setKeuanganList(getInitialData('ositara_keuangan', []));
    setAnggotaList(getInitialData('ositara_anggota', []));
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleSync);
    window.addEventListener('ositara_proposal_updated', handleSync);
    window.addEventListener('ositara_proker_updated', handleSync);
    const interval = setInterval(handleSync, 1000);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ositara_proposal_updated', handleSync);
      window.removeEventListener('ositara_proker_updated', handleSync);
      clearInterval(interval);
    };
  }, [handleSync]);

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
        localStorage.setItem('ositara_pembina_avatar', reader.result);
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusAvatar = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) {
      setAvatarUrl(null);
      localStorage.removeItem('ositara_pembina_avatar');
      setShowAvatarModal(false);
    }
  };

  const handleUpdateStatusProposal = (id, newStatus, catatan = '-') => {
    const updated = proposalList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          catatanRevisi: catatan,
        };
      }
      return item;
    });
    setProposalList(updated);
    const serialized = JSON.stringify(updated);
    localStorage.setItem('ositara_proposal', serialized);
    localStorage.setItem('ositara_proposals', serialized);
    window.dispatchEvent(new Event('ositara_proposal_updated'));
  };

  const handleOpenRevisiModal = (item) => {
    setSelectedProposalId(item.id);
    setCatatanRevisiInput(item.catatanRevisi !== '-' ? item.catatanRevisi : '');
    setIsRevisiModalOpen(true);
  };

  const handleSubmitRevisi = (e) => {
    e.preventDefault();
    if (!catatanRevisiInput.trim()) {
      alert('Silakan masukkan catatan revisi terlebih dahulu!');
      return;
    }
    handleUpdateStatusProposal(selectedProposalId, 'Revisi', catatanRevisiInput);
    setIsRevisiModalOpen(false);
    setSelectedProposalId(null);
    setCatatanRevisiInput('');
    alert('Catatan revisi berhasil dikirimkan ke Pengurus!');
  };

  const totalPemasukan = keuanganList
    .filter((k) => k.kategori === 'Pemasukan' || k.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
  const totalPengeluaran = keuanganList
    .filter((k) => k.kategori === 'Pengeluaran' || k.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
  const saldoSaatIni = totalPemasukan - totalPengeluaran;

  const namaPembina = user?.nama || user?.name || 'Pembina OSIS';
  const inisialNama = namaPembina.charAt(0).toUpperCase();

  const menuItems = [
    { id: 'beranda', label: 'Beranda Utama', icon: 'beranda' },
    { id: 'proposal', label: 'Persetujuan Proposal', icon: 'proposal' },
    { id: 'proker', label: 'Program Kerja', icon: 'proker' },
    { id: 'keuangan', label: 'Laporan Keuangan', icon: 'keuangan' },
    { id: 'anggota', label: 'Anggota OSIS', icon: 'anggota' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F4F7] font-sans text-slate-800 w-full overflow-x-hidden">

      {/* HEADER NAVBAR MOBILE */}
      <div className="md:hidden bg-[#2158B8] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md w-full">
        <div className="flex items-center space-x-2.5">
          <img src={logoOsitara} alt="Logo" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <h1 className="text-base font-black tracking-wider leading-none">OSITARA</h1>
            <p className="text-[9px] text-[#FFF5BF] font-bold tracking-wide uppercase mt-0.5">PEMBINA OSIS</p>
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
              <p className="text-[10px] text-[#FFF5BF] font-bold tracking-wide mt-1 uppercase">PEMBINA OSIS</p>
            </div>
          </div>
          <nav className="space-y-1.5 mt-4 md:mt-0">
            {menuItems.map((menu) => (
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
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer text-left mt-8 md:mt-0"
        >
          <Icon type="logout" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-x-hidden min-w-0 w-full">
        {/* HEADER USER */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 w-full">
            <div
              onClick={() => setShowAvatarModal(true)}
              className="relative group cursor-pointer shrink-0"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 rounded-full flex items-center justify-center text-[#2158B8] border-2 border-white shadow-sm font-black text-lg sm:text-xl">
                  {inisialNama}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-2xl font-black text-[#2158B8] leading-tight break-words">
                Selamat Datang, {namaPembina}!
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-snug break-words">
                Peninjauan proposal, evaluasi program kerja, dan pengawasan keuangan OSIS.
              </p>
            </div>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Total Proposal</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{proposalList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-[#2158B8] rounded-2xl flex items-center justify-center shrink-0 ml-2">
                  <Icon type="proposal" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-amber-500 uppercase tracking-wide">Menunggu Persetujuan</p>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                    {proposalList.filter((p) => p.status === 'Menunggu Persetujuan' || !p.status).length}
                  </h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 ml-2">
                  <Icon type="proposal" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Program Kerja</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{prokerList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 ml-2">
                  <Icon type="proker" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Saldo Kas OSIS</p>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-600 mt-1 truncate">{formatRupiah(saldoSaatIni)}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 ml-2">
                  <Icon type="keuangan" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#2158B8]">Proposal Perlu Validasi</h3>
                  <button onClick={() => setActiveMenu('proposal')} className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                    Lihat Semua →
                  </button>
                </div>
                <div className="space-y-3">
                  {proposalList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Belum ada proposal diajukan.</p>
                  ) : (
                    proposalList.slice(0, 4).map((p) => (
                      <div key={p.id} className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug break-words">{p.judul || p.judul_proposal}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{formatRupiah(p.anggaran)}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full self-start sm:self-center shrink-0 ${
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

              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#2158B8]">Program Kerja Pengurus</h3>
                  <button onClick={() => setActiveMenu('proker')} className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                    Lihat Semua →
                  </button>
                </div>
                <div className="space-y-3">
                  {prokerList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Belum ada program kerja terdaftar.</p>
                  ) : (
                    prokerList.slice(0, 4).map((pk) => (
                      <div key={pk.id} className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{pk.nama}</p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{pk.divisi || pk.sekbid || 'Umum'} • {pk.target || pk.tanggal || '-'}</p>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                          {pk.periode || 'Mingguan'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PENGAJUAN PROPOSAL */}
        {activeMenu === 'proposal' && (
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8]">Validasi & Persetujuan Proposal</h3>
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3 px-3 sm:px-4">Tanggal</th>
                    <th className="py-3 px-3 sm:px-4">Judul Proposal</th>
                    <th className="py-3 px-3 sm:px-4">Berkas File</th>
                    <th className="py-3 px-3 sm:px-4">Anggaran</th>
                    <th className="py-3 px-3 sm:px-4">Status Saat Ini</th>
                    <th className="py-3 px-3 sm:px-4">Catatan Revisi</th>
                    <th className="py-3 px-3 sm:px-4 text-center">Aksi Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">Belum ada proposal yang diajukan oleh Pengurus.</td>
                    </tr>
                  ) : (
                    proposalList.map((item) => {
                      const fileContent = item.fileData || item.fileUrl || item.file;
                      let displayName = item.fileProposal || item.fileNama;
                      if (!displayName || displayName.startsWith('data:')) {
                        displayName = typeof item.file === 'string' && !item.file.startsWith('data:') ? item.file : `${item.judul}.pdf`;
                      }
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 sm:px-4 text-slate-500 font-medium">{item.tanggal || '-'}</td>
                          <td className="py-3 px-3 sm:px-4 font-bold text-slate-800">{item.judul}</td>
                          <td className="py-3 px-3 sm:px-4">
                            {fileContent ? (
                              <a
                                href={fileContent}
                                target="_blank"
                                rel="noreferrer"
                                download={displayName}
                                className="inline-flex items-center space-x-1.5 bg-[#86C5FF]/30 hover:bg-[#86C5FF]/50 text-[#2158B8] font-bold px-2.5 py-1.5 rounded-xl border border-[#86C5FF] text-xs transition"
                              >
                                <Icon type="download" />
                                <span className="truncate max-w-[100px] sm:max-w-[140px]">{displayName}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-xs">Tidak Ada File</span>
                            )}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-700 font-semibold">{formatRupiah(item.anggaran)}</td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className={`px-2.5 py-1 font-bold text-[10px] sm:text-xs rounded-full inline-block ${
                              item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                              item.status === 'Ditolak' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                              item.status === 'Revisi' || item.status === 'Perlu Revisi' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                              'bg-[#FFF5BF] text-amber-800 border border-[#FFC42B]'
                            }`}>
                              {item.status || 'Menunggu Persetujuan'}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-600 font-medium italic text-xs">{item.catatanRevisi || '-'}</td>
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleUpdateStatusProposal(item.id, 'Disetujui', '-')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleOpenRevisiModal(item)}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition"
                              >
                                Revisi
                              </button>
                              <button
                                onClick={() => handleUpdateStatusProposal(item.id, 'Ditolak', 'Proposal ditolak oleh Pembina')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition"
                              >
                                Tolak
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PROGRAM KERJA */}
        {activeMenu === 'proker' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8]">Program Kerja OSIS</h3>
              <p className="text-xs text-slate-500">Tampilan Mode Pemantauan (Read-Only)</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-3 sm:px-4">Nama Program Kerja</th>
                    <th className="py-3.5 px-3 sm:px-4">Divisi Pelaksana</th>
                    <th className="py-3.5 px-3 sm:px-4">Target Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prokerList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-slate-400">Belum ada program kerja terdaftar dari Pengurus.</td>
                    </tr>
                  ) : (
                    prokerList.map((pk) => (
                      <tr key={pk.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800">{pk.nama}</td>
                        <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-600">{pk.divisi || pk.sekbid || '-'}</td>
                        <td className="py-3.5 px-3 sm:px-4 text-slate-500">{pk.target || pk.tanggal || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. AUDIT KEUANGAN */}
        {activeMenu === 'keuangan' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8]">Laporan Kas Keuangan OSIS</h3>
              <p className="text-xs text-slate-500">Tampilan Mode Audit/Pemantauan (Read-Only)</p>
            </div>
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
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase">Saldo Kas Saat Ini</p>
                <h3 className="text-lg sm:text-2xl font-black text-[#2158B8] mt-1 sm:mt-2 truncate">{formatRupiah(saldoSaatIni)}</h3>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-3 sm:px-4">Tanggal</th>
                    <th className="py-3.5 px-3 sm:px-4">Keterangan</th>
                    <th className="py-3.5 px-3 sm:px-4">Kategori</th>
                    <th className="py-3.5 px-3 sm:px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keuanganList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">Belum ada catatan transaksi.</td>
                    </tr>
                  ) : (
                    keuanganList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-3 sm:px-4 text-slate-500 font-medium">{item.tanggal || '-'}</td>
                        <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800">{item.keterangan}</td>
                        <td className="py-3.5 px-3 sm:px-4">
                          <span className={`px-2.5 py-1 font-bold text-[10px] sm:text-xs rounded-full inline-block ${
                            item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'
                          }`}>
                            {item.kategori || item.jenis}
                          </span>
                        </td>
                        <td className={`py-3.5 px-3 sm:px-4 text-right font-black ${item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(item.jumlah)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ANGGOTA OSIS */}
        {activeMenu === 'anggota' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-x-auto w-full">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Anggota OSIS</h3>
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
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">Belum ada data anggota.</td>
                  </tr>
                ) : (
                  anggotaList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-3 sm:px-4 text-slate-500 font-medium">{item.nis || '-'}</td>
                      <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800">{item.nama}</td>
                      <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-700">{item.jabatan || '-'}</td>
                      <td className="py-3.5 px-3 sm:px-4 text-slate-600">{item.sekbid || item.divisi || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL REVISI PROPOSAL */}
      {isRevisiModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-xl font-bold text-[#2158B8]">Catatan Revisi Proposal</h3>
              <button
                onClick={() => setIsRevisiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitRevisi} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Masukkan Catatan Revisi untuk Pengurus
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Contoh: Tolong sesuaikan lagi rincian anggaran pada seksi konsumsi..."
                  value={catatanRevisiInput}
                  onChange={(e) => setCatatanRevisiInput(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 bg-[#F2F4F7] text-xs focus:outline-none focus:ring-2 focus:ring-[#2158B8]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevisiModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                >
                  Kirim Revisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOTO PROFIL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 border border-blue-100">
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
                htmlFor="avatar-file-input-pembina"
                className="w-full py-3 bg-[#2158B8] text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer hover:bg-blue-700 transition"
              >
                <span>Ganti / Unggah Foto Baru</span>
              </label>
              <input
                id="avatar-file-input-pembina"
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
