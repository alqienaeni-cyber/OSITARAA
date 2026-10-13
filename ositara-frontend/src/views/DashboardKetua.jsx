import { useState, useEffect, useCallback } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// --- HELPER COMPONENT: ICON (Dideklarasikan di LUAR komponen utama agar tidak melanggar aturan React Hooks) ---
function Icon({ type }) {
  const icons = {
    beranda: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
    proker: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    anggota: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    ),
    proposal: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    keuangan: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// --- HELPER UTILS ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

export default function DashboardKetua({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('program-kerja');

  // Helper membaca LocalStorage internal
  const readInitialData = useCallback((key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  const readProposalData = useCallback(() => {
    try {
      const primary = localStorage.getItem('ositara_proposal');
      const secondary = localStorage.getItem('ositara_proposals');
      const fallback = localStorage.getItem('proposals');
      const result = primary || secondary || fallback;
      return result ? JSON.parse(result) : [];
    } catch {
      return [];
    }
  }, []);

  // State Avatar Profil
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_ketua_avatar') || null);

  // State Data Real-time
  const [prokerList, setProkerList] = useState(() => readInitialData('ositara_proker', []));
  const [anggotaList, setAnggotaList] = useState(() => readInitialData('ositara_anggota', []));
  const [proposalList, setProposalList] = useState(() => readProposalData());
  const [keuanganList, setKeuanganList] = useState(() => readInitialData('ositara_keuangan', []));
  const [kegiatanList, setKegiatanList] = useState(() => readInitialData('ositara_kegiatan', []));

  // Form State: Proker
  const [namaProker, setNamaProker] = useState('');
  const [sekbidProker, setSekbidProker] = useState('');
  const [targetProker, setTargetProker] = useState('');

  // Form State: Anggota
  const [nisAnggota, setNisAnggota] = useState('');
  const [namaAnggota, setNamaAnggota] = useState('');
  const [jabatanAnggota, setJabatanAnggota] = useState('Anggota');
  const [sekbidAnggota, setSekbidAnggota] = useState('');

  // Sinkronisasi Real-time
  const handleSync = useCallback(() => {
    setProkerList(readInitialData('ositara_proker', []));
    setAnggotaList(readInitialData('ositara_anggota', []));
    setProposalList(readProposalData());
    setKeuanganList(readInitialData('ositara_keuangan', []));
    setKegiatanList(readInitialData('ositara_kegiatan', []));
  }, [readInitialData, readProposalData]);

  useEffect(() => {
    window.addEventListener('storage', handleSync);
    window.addEventListener('ositara_proker_updated', handleSync);
    window.addEventListener('ositara_proposal_updated', handleSync);

    const interval = setInterval(handleSync, 1000);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ositara_proker_updated', handleSync);
      window.removeEventListener('ositara_proposal_updated', handleSync);
      clearInterval(interval);
    };
  }, [handleSync]);

  // Upload Avatar
  const handleUploadAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_ketua_avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // HANDLER PROKER (Murni & Bebas Error Impure Function)
  const handleTambahProker = (e) => {
    e.preventDefault();
    if (!namaProker.trim() || !targetProker) {
      alert('Mohon isi nama proker dan target!');
      return;
    }

    const prokerBaru = {
      id: String(Date.now() + Math.random()),
      nama: namaProker.trim(),
      divisi: sekbidProker || 'Umum',
      sekbid: sekbidProker || 'Umum',
      target: targetProker,
      tanggal: targetProker
    };

    const updated = [prokerBaru, ...prokerList];
    setProkerList(updated);
    localStorage.setItem('ositara_proker', JSON.stringify(updated));
    window.dispatchEvent(new Event('ositara_proker_updated'));

    setNamaProker('');
    setSekbidProker('');
    setTargetProker('');
    alert('Program Kerja berhasil ditambahkan!');
  };

  const handleHapusProker = (id) => {
    if (window.confirm('Hapus Program Kerja ini?')) {
      const updated = prokerList.filter((p) => p.id !== id);
      setProkerList(updated);
      localStorage.setItem('ositara_proker', JSON.stringify(updated));
      window.dispatchEvent(new Event('ositara_proker_updated'));
    }
  };

  // HANDLER ANGGOTA
  const handleTambahAnggota = (e) => {
    e.preventDefault();
    if (!namaAnggota.trim()) {
      alert('Mohon isi nama anggota!');
      return;
    }

    const anggotaBaru = {
      id: String(Date.now() + Math.random()),
      nis: nisAnggota.trim() || '-',
      nama: namaAnggota.trim(),
      jabatan: jabatanAnggota,
      sekbid: sekbidAnggota || 'Umum',
      divisi: sekbidAnggota || 'Umum'
    };

    const updated = [anggotaBaru, ...anggotaList];
    setAnggotaList(updated);
    localStorage.setItem('ositara_anggota', JSON.stringify(updated));
    localStorage.setItem('anggotaList', JSON.stringify(updated));

    setNisAnggota('');
    setNamaAnggota('');
    setJabatanAnggota('Anggota');
    setSekbidAnggota('');
    alert('Anggota OSIS berhasil ditambahkan!');
  };

  const handleHapusAnggota = (id) => {
    if (window.confirm('Hapus anggota ini?')) {
      const updated = anggotaList.filter((a) => a.id !== id);
      setAnggotaList(updated);
      localStorage.setItem('ositara_anggota', JSON.stringify(updated));
      localStorage.setItem('anggotaList', JSON.stringify(updated));
    }
  };

  const namaKetua = user?.nama || user?.name || 'Ketua OSIS';
  const inisialNama = namaKetua.charAt(0).toUpperCase();

  const menuList = [
    { id: 'program-kerja', label: 'Program Kerja', icon: 'proker' },
    { id: 'anggota-osis', label: 'Anggota OSIS', icon: 'anggota' },
    { id: 'pengajuan-proposal', label: 'Pengajuan Proposal', icon: 'proposal' },
    { id: 'laporan-keuangan', label: 'Laporan Keuangan', icon: 'keuangan' },
    { id: 'kelola-kegiatan', label: 'Kelola Kegiatan', icon: 'kegiatan' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0 shadow-lg">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <img src={logoOsitara} alt="Logo OSITARA" className="w-10 h-10 object-contain shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-[#FFF5BF] font-bold tracking-wide mt-1 uppercase">KETUA OSIS</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuList.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
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

        <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer text-left">
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
                <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-[#2158B8] border-2 border-white shadow-sm font-black text-xl">
                  {inisialNama}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold">
                Ubah
              </div>
            </label>
            <div>
              <h2 className="text-2xl font-black text-[#2158B8]">Selamat Datang, {namaKetua}!</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Jabatan: <span className="font-bold text-[#2158B8]">Ketua OSIS</span></p>
            </div>
          </div>
        </div>

        {/* 1. KELOLA PROGRAM KERJA */}
        {activeMenu === 'program-kerja' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Program Kerja OSIS</h3>
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-4">Nama Program Kerja</th>
                    <th className="py-3.5 px-4">Divisi / Sekbid</th>
                    <th className="py-3.5 px-4">Target Waktu</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prokerList.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada program kerja.</td></tr>
                  ) : (
                    prokerList.map((pk) => (
                      <tr key={pk.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{pk.nama}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">{pk.divisi || pk.sekbid || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-500">{pk.target || pk.tanggal || '-'}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button onClick={() => handleHapusProker(pk.id)} className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition cursor-pointer" title="Hapus Proker">
                            <Icon type="trash" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Tambah Program Kerja</h3>
              <form onSubmit={handleTambahProker} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Program Kerja</label>
                  <input type="text" required placeholder="Contoh: Pentas Seni Budaya" value={namaProker} onChange={(e) => setNamaProker(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Divisi / Sekbid Pelaksana</label>
                  <input type="text" placeholder="Contoh: Sekbid Kesenian" value={sekbidProker} onChange={(e) => setSekbidProker(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Target Waktu / Pelaksanaan</label>
                  <input type="text" required placeholder="Contoh: November 2026" value={targetProker} onChange={(e) => setTargetProker(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-xs rounded-2xl hover:bg-[#e0a200] transition cursor-pointer shadow-sm mt-2">
                  Simpan Program Kerja
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. KELOLA ANGGOTA OSIS */}
        {activeMenu === 'anggota-osis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Anggota OSIS</h3>
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="py-3.5 px-4">NIS</th>
                    <th className="py-3.5 px-4">Nama Anggota</th>
                    <th className="py-3.5 px-4">Jabatan</th>
                    <th className="py-3.5 px-4">Divisi / Sekbid</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggotaList.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400">Belum ada data anggota.</td></tr>
                  ) : (
                    anggotaList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{item.nis || '-'}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{item.nama}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{item.jabatan || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-600">{item.sekbid || item.divisi || '-'}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button onClick={() => handleHapusAnggota(item.id)} className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition cursor-pointer" title="Hapus Anggota">
                            <Icon type="trash" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Tambah Anggota Baru</h3>
              <form onSubmit={handleTambahAnggota} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">NIS</label>
                  <input type="text" placeholder="Contoh: 20261001" value={nisAnggota} onChange={(e) => setNisAnggota(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Anggota</label>
                  <input type="text" required placeholder="Nama Lengkap" value={namaAnggota} onChange={(e) => setNamaAnggota(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Jabatan</label>
                  <input type="text" required placeholder="Contoh: Anggota Sekbid 1" value={jabatanAnggota} onChange={(e) => setJabatanAnggota(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Divisi / Sekbid</label>
                  <input type="text" placeholder="Contoh: Sekbid Keagamaan" value={sekbidAnggota} onChange={(e) => setSekbidAnggota(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-xs rounded-2xl hover:bg-[#e0a200] transition cursor-pointer shadow-sm mt-2">
                  Simpan Anggota
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. PROPOSAL (READ-ONLY) */}
        {activeMenu === 'pengajuan-proposal' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Proposal Kegiatan (Sinkron Sekretaris)</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6">Judul Proposal</th>
                  <th className="py-3.5 px-6">Berkas PDF</th>
                  <th className="py-3.5 px-6">Anggaran</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6">Catatan Pembina</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposalList.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-400">Belum ada proposal diajukan.</td></tr>
                ) : (
                  proposalList.map((item) => {
                    const fileContent = item.fileUrl || item.fileData || item.file;
                    let fileName = item.fileProposal || item.fileNama;
                    if (!fileName || typeof fileName !== 'string' || fileName.startsWith('data:')) {
                      fileName = typeof item.file === 'string' && !item.file.startsWith('data:') ? item.file : `${item.judul || 'Proposal'}.pdf`;
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-6 text-slate-500 font-medium">{item.tanggal || item.tanggal_pengajuan || '-'}</td>
                        <td className="py-3.5 px-6 font-bold text-slate-800">{item.judul || item.judul_proposal}</td>
                        <td className="py-3.5 px-6">
                          {fileContent ? (
                            <a href={fileContent} target="_blank" rel="noreferrer" download={fileName} className="inline-flex items-center space-x-1.5 bg-[#86C5FF]/30 hover:bg-[#86C5FF]/50 text-[#2158B8] font-bold px-3 py-1.5 rounded-xl border border-[#86C5FF] text-xs transition">
                              <Icon type="download" />
                              <span className="truncate max-w-[120px]">{fileName}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Tanpa File</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-700">{formatRupiah(item.anggaran)}</td>
                        <td className="py-3.5 px-6 text-center">
                          <span className={`px-3 py-1 font-bold text-xs rounded-full inline-block ${
                            item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                            item.status === 'Ditolak' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                            item.status === 'Revisi' || item.status === 'Perlu Revisi' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                            'bg-[#FFF5BF] text-amber-800 border border-[#FFC42B]'
                          }`}>
                            {item.status || 'Menunggu Persetujuan'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-600 font-medium italic text-xs">{item.catatanRevisi || item.catatanPembina || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. KEUANGAN (READ-ONLY) */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Laporan Kas Keuangan OSIS (Sinkron Bendahara)</h3>
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
                  <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada catatan transaksi dari Bendahara.</td></tr>
                ) : (
                  keuanganList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-6 text-slate-500 font-medium">{item.tanggal || '-'}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-800">{item.keterangan}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-3 py-1 font-bold text-xs rounded-full inline-block ${
                          (item.kategori || item.jenis) === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'
                        }`}>
                          {item.kategori || item.jenis}
                        </span>
                      </td>
                      <td className={`py-3.5 px-6 text-right font-black ${(item.kategori || item.jenis) === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {(item.kategori || item.jenis) === 'Pemasukan' ? '+' : '-'} {formatRupiah(item.jumlah)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. KEGIATAN (READ-ONLY) */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Agenda Kegiatan OSIS (Sinkron Sekretaris)</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="py-3.5 px-6">Nama Kegiatan</th>
                  <th className="py-3.5 px-6">Tanggal Pelaksanaan</th>
                  <th className="py-3.5 px-6">Deskripsi Singkat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kegiatanList.length === 0 ? (
                  <tr><td colSpan="3" className="py-8 text-center text-slate-400">Belum ada agenda kegiatan terdaftar.</td></tr>
                ) : (
                  kegiatanList.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-6 font-bold text-slate-800">{k.namaKegiatan || k.nama || k.nama_kegiatan}</td>
                      <td className="py-3.5 px-6 text-slate-600 font-semibold">{k.tanggal}</td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">{k.deskripsi || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
