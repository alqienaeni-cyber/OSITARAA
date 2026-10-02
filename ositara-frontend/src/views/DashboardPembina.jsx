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

  // State Profil Pembina
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_pembina_avatar') || null);

  // State Data Tersinkronisasi
  const [proposalList, setProposalList] = useState(() => getInitialData('ositara_proposal', []));
  const [prokerList, setProkerList] = useState(() => getInitialData('ositara_proker', []));
  const [keuanganList, setKeuanganList] = useState(() => getInitialData('ositara_keuangan', []));
  const [anggotaList, setAnggotaList] = useState(() => getInitialData('ositara_anggota', []));

  // State Modal Revisi
  const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [catatanRevisiInput, setCatatanRevisiInput] = useState('');

  // Sync data real-time
  const handleSync = useCallback(() => {
    setProposalList(getInitialData('ositara_proposal', []));
    setProkerList(getInitialData('ositara_proker', []));
    setKeuanganList(getInitialData('ositara_keuangan', []));
    setAnggotaList(getInitialData('ositara_anggota', []));
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleSync);
    window.addEventListener('ositara_proposal_updated', handleSync);
    window.addEventListener('ositara_proker_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ositara_proposal_updated', handleSync);
      window.removeEventListener('ositara_proker_updated', handleSync);
    };
  }, [handleSync]);

  // Upload Foto Profil
  const handleUploadAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_pembina_avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update Status Proposal
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
    localStorage.setItem('ositara_proposal', JSON.stringify(updated));
    window.dispatchEvent(new Event('ositara_proposal_updated'));
  };

  // Modal Handler
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

  // Kalkulasi Keuangan
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
    { id: 'proker', label: 'Program Kerja (Read)', icon: 'proker' },
    { id: 'keuangan', label: 'Laporan Keuangan', icon: 'keuangan' },
    { id: 'anggota', label: 'Anggota OSIS', icon: 'anggota' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0 shadow-lg">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <img
              src={logoOsitara}
              alt="Logo OSITARA"
              className="w-10 h-10 object-contain shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-[#FFF5BF] font-bold tracking-wide mt-1 uppercase">PEMBINA OSIS</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer text-left ${
                  activeMenu === menu.id
                    ? 'bg-[#FFC42B] text-slate-900 shadow-md'
                    : 'hover:bg-white/10 text-white'
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
          className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer text-left"
        >
          <Icon type="logout" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* HEADER USER */}
        <div className="flex items-center justify-between mb-8 bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <label className="relative group cursor-pointer shrink-0" title="Ubah Foto Profil">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#FFC42B] shadow-sm" />
              ) : (
                <div className="w-14 h-14 bg-[#FFC42B] rounded-full flex items-center justify-center text-slate-900 border-2 border-white shadow-sm font-black text-xl">
                  {inisialNama}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold">
                Ubah
              </div>
            </label>
            <div>
              <h2 className="text-2xl font-black text-[#2158B8]">Selamat Datang, {namaPembina}!</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Peninjauan proposal, evaluasi program kerja, dan pengawasan keuangan OSIS.</p>
            </div>
          </div>
        </div>

        {/* BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Proposal</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">{proposalList.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-amber-500 uppercase">Menunggu Persetujuan</p>
                <h3 className="text-3xl font-black text-amber-600 mt-2">
                  {proposalList.filter((p) => p.status === 'Menunggu Persetujuan' || !p.status).length}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Program Kerja</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">{prokerList.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Saldo Kas OSIS</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-2">{formatRupiah(saldoSaatIni)}</h3>
              </div>
            </div>
          </div>
        )}

        {/* PENGAJUAN PROPOSAL */}
        {activeMenu === 'proposal' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#2158B8]">Validasi & Persetujuan Proposal</h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-6">Tanggal</th>
                    <th className="py-3.5 px-6">Judul Proposal</th>
                    <th className="py-3.5 px-6">Berkas File</th>
                    <th className="py-3.5 px-6">Anggaran</th>
                    <th className="py-3.5 px-6">Status Saat Ini</th>
                    <th className="py-3.5 px-6">Catatan Revisi</th>
                    <th className="py-3.5 px-6 text-center">Aksi Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">Belum ada proposal yang diajukan oleh Pengurus.</td>
                    </tr>
                  ) : (
                    proposalList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-6 text-slate-500 font-medium">{item.tanggal || '-'}</td>
                        <td className="py-3.5 px-6 font-bold text-slate-800">{item.judul}</td>
                        <td className="py-3.5 px-6">
                          {item.fileUrl ? (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={item.fileProposal || 'proposal'}
                              className="inline-flex items-center space-x-1.5 bg-[#86C5FF]/30 hover:bg-[#86C5FF]/50 text-[#2158B8] font-bold px-3 py-1.5 rounded-xl border border-[#86C5FF] text-xs transition"
                            >
                              <Icon type="download" />
                              <span className="truncate max-w-[120px]">{item.fileProposal || 'Unduh File'}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Tidak Ada File</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-slate-700 font-semibold">{formatRupiah(item.anggaran)}</td>
                        <td className="py-3.5 px-6">
                          <span className={`px-3 py-1 font-bold text-xs rounded-full inline-block ${
                            item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                            item.status === 'Ditolak' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                            item.status === 'Revisi' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                            'bg-[#FFF5BF] text-amber-800 border border-[#FFC42B]'
                          }`}>
                            {item.status || 'Menunggu Persetujuan'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-600 font-medium italic text-xs">{item.catatanRevisi || '-'}</td>
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleUpdateStatusProposal(item.id, 'Disetujui', '-')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                              title="Setujui Proposal"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleOpenRevisiModal(item)}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                              title="Minta Revisi"
                            >
                              Revisi
                            </button>
                            <button
                              onClick={() => handleUpdateStatusProposal(item.id, 'Ditolak', 'Proposal ditolak oleh Pembina')}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                              title="Tolak Proposal"
                            >
                              Tolak
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
        )}

        {/* PROGRAM KERJA (TANPA KOLOM STATUS) */}
        {activeMenu === 'proker' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#2158B8]">Program Kerja OSIS</h3>
              <p className="text-xs text-slate-500">Tampilan Mode Pemantauan (Read-Only)</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-6">Nama Program Kerja</th>
                    <th className="py-3.5 px-6">Divisi Pelaksana</th>
                    <th className="py-3.5 px-6">Target Waktu</th>
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
                        <td className="py-3.5 px-6 font-bold text-slate-800">{pk.nama}</td>
                        <td className="py-3.5 px-6 font-semibold text-slate-600">{pk.divisi || pk.sekbid || '-'}</td>
                        <td className="py-3.5 px-6 text-slate-500">{pk.target || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIT KEUANGAN */}
        {activeMenu === 'keuangan' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#2158B8]">Laporan Kas Keuangan OSIS</h3>
              <p className="text-xs text-slate-500">Tampilan Mode Audit/Pemantauan (Read-Only)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Pemasukan</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-2">{formatRupiah(totalPemasukan)}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Pengeluaran</p>
                <h3 className="text-2xl font-black text-rose-500 mt-2">{formatRupiah(totalPengeluaran)}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Saldo Kas Saat Ini</p>
                <h3 className="text-2xl font-black text-[#2158B8] mt-2">{formatRupiah(saldoSaatIni)}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-6">Tanggal</th>
                    <th className="py-3.5 px-6">Keterangan</th>
                    <th className="py-3.5 px-6">Kategori</th>
                    <th className="py-3.5 px-6 text-right">Nominal</th>
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
                        <td className="py-3.5 px-6 text-slate-500 font-medium">{item.tanggal || '-'}</td>
                        <td className="py-3.5 px-6 font-bold text-slate-800">{item.keterangan}</td>
                        <td className="py-3.5 px-6">
                          <span className={`px-3 py-1 font-bold text-xs rounded-full inline-block ${
                            item.kategori === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'
                          }`}>
                            {item.kategori}
                          </span>
                        </td>
                        <td className={`py-3.5 px-6 text-right font-black ${item.kategori === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {item.kategori === 'Pemasukan' ? '+' : '-'} {formatRupiah(item.jumlah)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANGGOTA OSIS (DENGAN TAMPILAN SEK BID / DIVISI & JABATAN SINKRON) */}
        {activeMenu === 'anggota' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Anggota OSIS</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="py-3.5 px-6">NIS</th>
                  <th className="py-3.5 px-6">Nama Anggota</th>
                  <th className="py-3.5 px-6">Jabatan</th>
                  <th className="py-3.5 px-6">Divisi / Sekbid</th>
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
                      <td className="py-3.5 px-6 text-slate-500 font-medium">{item.nis || '-'}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-800">{item.nama}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-700">{item.jabatan || '-'}</td>
                      <td className="py-3.5 px-6 text-slate-600">{item.sekbid || item.divisi || '-'}</td>
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2158B8]">Catatan Revisi Proposal</h3>
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
    </div>
  );
}
