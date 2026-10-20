import { useState, useEffect, useCallback } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// --- DEKLARASI IKON SVG DI LUAR KOMPONEN UTAMA (BEBAS ESLINT STATIC-COMPONENTS) ---
const SvgHome = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const SvgProposal = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SvgKegiatan = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SvgProker = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9z" /></svg>;
const SvgAnggota = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SvgKeuangan = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const SvgLogout = () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

const SvgEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const SvgTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SvgSend = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const SvgUsersGroup = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const SvgFilePdf = () => <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const SvgCalendarSmall = () => <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SvgCamera = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const getInitialData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
};

export default function DashboardSekretaris({
  user,
  onLogout,
  kegiatanList: initialKegiatan = [],
  pendaftaranList: initialPendaftaran = [],
  onTambahKegiatan,
  proposalList: initialProposal = [],
  onTambahProposal,
  prokerList: initialProker = [],
  anggotaList: initialAnggota = [],
  laporanKeuanganList: initialKeuangan = []
}) {
  const [activeMenu, setActiveMenu] = useState('beranda');

  const [kegiatanList, setKegiatanList] = useState(() => getInitialData('ositara_kegiatan', initialKegiatan));
  const [proposalList, setProposalList] = useState(() => getInitialData('ositara_proposal', initialProposal));
  const [keuanganList] = useState(() => getInitialData('ositara_keuangan', initialKeuangan));
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const primary = getInitialData('ositara_pendaftaran', null);
    const secondary = getInitialData('pendaftaranList', initialPendaftaran);
    return primary || secondary;
  });
  const [prokerList] = useState(() => getInitialData('ositara_proker', initialProker));
  const [anggotaList] = useState(() => getInitialData('ositara_anggota', initialAnggota));

  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_user_avatar') || null);
  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // LOGIKA SAPAAN NAMA: Utamakan namaLengkap/nama agar tidak menampilkan username login
  const namaDisplay = user?.namaLengkap || user?.nama || user?.name || user?.username || 'Sekretaris OSIS';
  const inisialNama = namaDisplay.charAt(0).toUpperCase();

  // MENGHINDARI SYNC SETSTATE LANGSUNG DI EFFECT BODY (BEBAS CASCADING RENDERS ERROR)
  const syncPendaftaran = useCallback(() => {
    const latestPendaftaran = getInitialData('ositara_pendaftaran', null) || getInitialData('pendaftaranList', initialPendaftaran);
    setPendaftaranList(latestPendaftaran);
  }, [initialPendaftaran]);

  useEffect(() => {
    window.addEventListener('storage', syncPendaftaran);
    window.addEventListener('ositara_pendaftaran_updated', syncPendaftaran);

    syncPendaftaran();

    return () => {
      window.removeEventListener('storage', syncPendaftaran);
      window.removeEventListener('ositara_pendaftaran_updated', syncPendaftaran);
    };
  }, [syncPendaftaran]);

  useEffect(() => { localStorage.setItem('ositara_kegiatan', JSON.stringify(kegiatanList)); }, [kegiatanList]);
  useEffect(() => { localStorage.setItem('ositara_proposal', JSON.stringify(proposalList)); }, [proposalList]);

  // Handler Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 3 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_user_avatar', reader.result);
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem('ositara_user_avatar');
    setShowAvatarModal(false);
  };

  // State Form Proposal
  const [editingProposalId, setEditingProposalId] = useState(null);
  const [judulProposal, setJudulProposal] = useState('');
  const [kategoriProposal, setKategoriProposal] = useState('Kegiatan');
  const [anggaranProposal, setAnggaranProposal] = useState('');
  const [fileProposal, setFileProposal] = useState(null);

  const handleSubmitProposal = (e) => {
    e.preventDefault();
    if (!judulProposal.trim() || !anggaranProposal) return alert('Judul dan Anggaran wajib diisi!');

    const saveProposalData = (fileUrl = null, fileName = null) => {
      if (editingProposalId) {
        const updated = proposalList.map((p) => p.id === editingProposalId ? {
          ...p,
          judul: judulProposal.trim(),
          kategori: kategoriProposal,
          anggaran: Number(anggaranProposal),
          file: fileName || p.file,
          fileData: fileUrl || p.fileData,
          status: 'Menunggu Persetujuan',
          catatanRevisi: '-'
        } : p);
        setProposalList(updated);
        localStorage.setItem('ositara_proposal', JSON.stringify(updated));
        alert('Proposal revisi berhasil dikirim ulang!');
      } else {
        const proposalBaru = {
          id: Date.now(),
          judul: judulProposal.trim(),
          kategori: kategoriProposal,
          anggaran: Number(anggaranProposal),
          file: fileName || (fileProposal ? fileProposal.name : 'Dokumen.pdf'),
          fileData: fileUrl || null,
          tanggal: new Date().toLocaleDateString('id-ID'),
          status: 'Menunggu Persetujuan',
          catatanRevisi: '-'
        };
        const updated = [proposalBaru, ...proposalList];
        setProposalList(updated);
        localStorage.setItem('ositara_proposal', JSON.stringify(updated));
        if (typeof onTambahProposal === 'function') onTambahProposal(proposalBaru);
        alert('Proposal baru berhasil diajukan!');
      }
      setEditingProposalId(null); setJudulProposal(''); setAnggaranProposal(''); setFileProposal(null);
    };

    if (fileProposal) {
      const reader = new FileReader();
      reader.onloadend = () => saveProposalData(reader.result, fileProposal.name);
      reader.readAsDataURL(fileProposal);
    } else {
      saveProposalData();
    }
  };

  const handleHapusProposal = (id) => {
    if (window.confirm('Hapus proposal ini?')) {
      const updated = proposalList.filter((p) => p.id !== id);
      setProposalList(updated);
      localStorage.setItem('ositara_proposal', JSON.stringify(updated));
    }
  };

  // State Form Kelola Kegiatan
  const [showTambahKegiatanForm, setShowTambahKegiatanForm] = useState(false);
  const [editingKegiatanId, setEditingKegiatanId] = useState(null);
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [tanggalKegiatan, setTanggalKegiatan] = useState('');
  const [deskripsiKegiatan, setDeskripsiKegiatan] = useState('');

  const handleSubmitKegiatan = (e) => {
    e.preventDefault();
    if (!namaKegiatan.trim() || !tanggalKegiatan) return alert('Nama dan Tanggal kegiatan wajib diisi!');
    const today = new Date().toISOString().split('T')[0];
    const statusAuto = tanggalKegiatan >= today ? 'Mendatang' : 'Selesai';

    if (editingKegiatanId) {
      setKegiatanList(prev => prev.map(k => k.id === editingKegiatanId ? { ...k, namaKegiatan, tanggal: tanggalKegiatan, deskripsi: deskripsiKegiatan, status: statusAuto } : k));
      setEditingKegiatanId(null);
      alert('Kegiatan berhasil diperbarui!');
    } else {
      const kBaru = { id: Date.now(), namaKegiatan, tanggal: tanggalKegiatan, deskripsi: deskripsiKegiatan, status: statusAuto };
      setKegiatanList(prev => [kBaru, ...prev]);
      if (typeof onTambahKegiatan === 'function') onTambahKegiatan(kBaru);
      alert('Kegiatan baru ditambahkan!');
    }
    setNamaKegiatan(''); setTanggalKegiatan(''); setDeskripsiKegiatan(''); setShowTambahKegiatanForm(false);
  };

  const handleHapusKegiatan = (id) => {
    if (window.confirm('Hapus kegiatan ini?')) setKegiatanList(prev => prev.filter(k => k.id !== id));
  };

  const getPesertaByKegiatan = (keg) => {
    if (!keg) return [];
    return pendaftaranList.filter((p) =>
      String(p.kegiatanId) === String(keg.id) ||
      p.namaKegiatan?.toLowerCase().trim() === (keg.namaKegiatan || keg.nama)?.toLowerCase().trim()
    );
  };

  const menuList = [
    { id: 'beranda', label: 'Beranda', IconComponent: SvgHome },
    { id: 'pengajuan-proposal', label: 'Pengajuan Proposal', IconComponent: SvgProposal },
    { id: 'program-kerja', label: 'Program Kerja', IconComponent: SvgProker },
    { id: 'anggota-osis', label: 'Anggota OSIS', IconComponent: SvgAnggota },
    { id: 'kelola-kegiatan', label: 'Kelola Kegiatan', IconComponent: SvgKegiatan },
    { id: 'kegiatan', label: 'Kegiatan', IconComponent: SvgKegiatan },
    { id: 'laporan-keuangan', label: 'Laporan Keuangan', IconComponent: SvgKeuangan },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans relative">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <img src={logoOsitara} alt="Logo OSITARA" className="w-10 h-10 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-blue-200 font-bold tracking-wide mt-1 uppercase">SEKRETARIS OSIS</p>
            </div>
          </div>
          <nav className="space-y-1.5">
            {menuList.map((menu) => {
              const IconComp = menu.IconComponent;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${activeMenu === menu.id ? 'bg-[#FFF3BF] text-[#2158B8] shadow-sm' : 'hover:bg-white/10 text-white'}`}
                >
                  <IconComp />
                  <span className="truncate">{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer mt-6">
          <SvgLogout />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto min-w-0">
        {/* HEADER PROFIL SEKRETARIS */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="cursor-pointer block relative group focus:outline-none"
            title="Kelola Foto Profil"
          >
            <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border-2 border-white shadow-sm overflow-hidden hover:opacity-90 transition">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-xl text-[#2158B8]">{inisialNama}</span>
              )}
            </div>
          </button>

          <div>
            <h2 className="text-2xl font-black text-[#2158B8]">Halo, {namaDisplay}!</h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Jabatan: <span className="font-bold text-[#2158B8]">Sekretaris OSIS</span>
            </p>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase">Total Kegiatan</p><h3 className="text-3xl font-black text-[#2158B8] mt-2">{kegiatanList.length}</h3></div>
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase">Total Anggota</p><h3 className="text-3xl font-black text-[#2158B8] mt-2">{anggotaList.length}</h3></div>
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase">Proposal Diajukan</p><h3 className="text-3xl font-black text-[#2158B8] mt-2">{proposalList.length}</h3></div>
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase">Pendaftar Siswa</p><h3 className="text-3xl font-black text-[#2158B8] mt-2">{pendaftaranList.length}</h3></div>
          </div>
        )}

        {/* 2. PENGAJUAN PROPOSAL */}
        {activeMenu === 'pengajuan-proposal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm overflow-x-auto">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Pengajuan Proposal</h3>
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b text-[#2158B8] font-bold bg-slate-50">
                    <th className="p-3">Judul</th>
                    <th className="p-3">Anggaran</th>
                    <th className="p-3">Berkas</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Catatan Revisi</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.map((p) => {
                    const isRevisi = p.status?.toLowerCase().includes('revisi');
                    return (
                      <tr key={p.id}>
                        <td className="p-3 font-bold text-slate-700">{p.judul}</td>
                        <td className="p-3 text-slate-600 font-medium">Rp {p.anggaran?.toLocaleString('id-ID')}</td>
                        <td className="p-3">
                          {p.fileData ? (
                            <a href={p.fileData} download={p.file || "proposal.pdf"} className="text-blue-600 underline font-semibold text-xs flex items-center space-x-1">
                              <SvgFilePdf />
                              <span>{p.file || "PDF"}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs italic">{p.file || "Tidak ada berkas"}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 font-bold text-xs rounded-full ${p.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : isRevisi ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-xs">{p.catatanRevisi || '-'}</td>
                        <td className="p-3 text-center space-x-1 whitespace-nowrap">
                          {isRevisi && (
                            <button
                              title="Kirim Ulang Revisi"
                              onClick={() => { setEditingProposalId(p.id); setJudulProposal(p.judul); setKategoriProposal(p.kategori || 'Kegiatan'); setAnggaranProposal(p.anggaran); }}
                              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition inline-flex items-center cursor-pointer"
                            >
                              <SvgSend />
                            </button>
                          )}
                          <button
                            title="Edit Proposal"
                            onClick={() => { setEditingProposalId(p.id); setJudulProposal(p.judul); setKategoriProposal(p.kategori || 'Kegiatan'); setAnggaranProposal(p.anggaran); }}
                            className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition inline-flex items-center cursor-pointer"
                          >
                            <SvgEdit />
                          </button>
                          <button
                            title="Hapus Proposal"
                            onClick={() => handleHapusProposal(p.id)}
                            className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition inline-flex items-center cursor-pointer"
                          >
                            <SvgTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">{editingProposalId ? 'Revisi / Edit Proposal' : 'Ajukan Proposal Baru'}</h3>
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div><label className="block text-xs font-bold text-[#2158B8] mb-1">Judul Proposal</label><input type="text" required value={judulProposal} onChange={(e) => setJudulProposal(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" /></div>
                <div><label className="block text-xs font-bold text-[#2158B8] mb-1">Estimasi Anggaran (Rp)</label><input type="number" required value={anggaranProposal} onChange={(e) => setAnggaranProposal(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" /></div>
                <div><label className="block text-xs font-bold text-[#2158B8] mb-1">Unggah Berkas PDF</label><input type="file" accept="application/pdf" onChange={(e) => setFileProposal(e.target.files[0])} className="w-full text-xs text-slate-500" /></div>
                <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full shadow-sm hover:bg-[#e0a200] flex items-center justify-center space-x-2 cursor-pointer">
                  <SvgSend />
                  <span>{editingProposalId ? 'Kirim Ulang Revisi' : 'Kirim Proposal'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. PROGRAM KERJA */}
        {activeMenu === 'program-kerja' && (
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Program Kerja OSIS (Read Only)</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead><tr className="border-b text-[#2158B8] font-bold bg-slate-50"><th className="p-3.5">Program Kerja</th><th className="p-3.5">Divisi</th><th className="p-3.5">Target</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {prokerList.map((pk) => (<tr key={pk.id}><td className="p-3.5 font-bold text-slate-700">{pk.nama}</td><td className="p-3.5 text-[#2158B8]">{pk.divisi || pk.sekbid}</td><td className="p-3.5 text-slate-500">{pk.target || pk.tanggal}</td></tr>))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. ANGGOTA OSIS (KOLOM SUDAH DISESUAIKAN: NIS | NAMA | JABATAN | DIVISI/SEKBID) */}
        {activeMenu === 'anggota-osis' && (
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Anggota OSIS (Read Only)</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-[#2158B8] font-bold bg-slate-50">
                  <th className="p-3.5">NIS</th>
                  <th className="p-3.5">Nama Anggota</th>
                  <th className="p-3.5">Jabatan</th>
                  <th className="p-3.5">Divisi / Sekbid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anggotaList.length === 0 ? (
                  <tr><td colSpan="4" className="py-6 text-center text-slate-400">Belum ada data anggota.</td></tr>
                ) : (
                  anggotaList.map((a) => (
                    <tr key={a.id}>
                      <td className="p-3.5 text-slate-500 font-medium">{a.nis || '-'}</td>
                      <td className="p-3.5 font-bold text-slate-800">{a.nama}</td>
                      <td className="p-3.5 text-slate-700 font-semibold">{a.jabatan || '-'}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{a.sekbid || a.divisi || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. KELOLA KEGIATAN */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#2158B8]">Kelola Kegiatan</h3>
              <button onClick={() => { setEditingKegiatanId(null); setNamaKegiatan(''); setTanggalKegiatan(''); setDeskripsiKegiatan(''); setShowTambahKegiatanForm(true); }} className="px-4 py-2 bg-[#2158B8] text-white font-bold text-sm rounded-2xl hover:bg-blue-700 cursor-pointer">+ Tambah Kegiatan</button>
            </div>
            {showTambahKegiatanForm && (
              <form onSubmit={handleSubmitKegiatan} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
                <div><label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Kegiatan</label><input type="text" required value={namaKegiatan} onChange={(e) => setNamaKegiatan(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm" /></div>
                <div><label className="block text-xs font-bold text-[#2158B8] mb-1">Tanggal</label><input type="date" required value={tanggalKegiatan} onChange={(e) => setTanggalKegiatan(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm" /></div>
                <div><label className="block text-xs font-bold text-[#2158B8] mb-1">Deskripsi</label><textarea value={deskripsiKegiatan} onChange={(e) => setDeskripsiKegiatan(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm" rows="2" /></div>
                <button type="submit" className="px-4 py-2 bg-[#FFB800] text-slate-900 font-bold rounded-xl text-xs cursor-pointer">Simpan Kegiatan</button>
              </form>
            )}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead><tr className="border-b text-[#2158B8] font-bold bg-slate-50"><th className="p-3.5">Nama Kegiatan</th><th className="p-3.5">Tanggal</th><th className="p-3.5">Status</th><th className="p-3.5 text-center">Aksi</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {kegiatanList.map((k) => (
                    <tr key={k.id}>
                      <td className="p-3.5 font-bold text-slate-800">{k.namaKegiatan || k.nama}</td>
                      <td className="p-3.5 text-slate-600">{k.tanggal}</td>
                      <td className="p-3.5"><span className="px-3 py-1 bg-blue-100 text-[#2158B8] font-bold text-xs rounded-full">{k.status}</span></td>
                      <td className="p-3.5 text-center space-x-2 whitespace-nowrap">
                        <button title="Edit Kegiatan" onClick={() => { setEditingKegiatanId(k.id); setNamaKegiatan(k.namaKegiatan || k.nama); setTanggalKegiatan(k.tanggal); setDeskripsiKegiatan(k.deskripsi || ''); setShowTambahKegiatanForm(true); }} className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition inline-flex items-center cursor-pointer"><SvgEdit /></button>
                        <button title="Hapus Kegiatan" onClick={() => handleHapusKegiatan(k.id)} className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition inline-flex items-center cursor-pointer"><SvgTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. MENU KEGIATAN */}
        {activeMenu === 'kegiatan' && (
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Agenda Kegiatan OSIS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kegiatanList.map((k) => {
                const pesertaKegiatan = getPesertaByKegiatan(k);
                return (
                  <div key={k.id} className="p-5 border border-blue-100 rounded-2xl bg-slate-50 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-[#2158B8] text-lg">{k.namaKegiatan || k.nama}</h4>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-[#2158B8] font-bold text-xs rounded-full">{k.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2 flex items-center space-x-1">
                        <SvgCalendarSmall />
                        <span>Tanggal: {k.tanggal}</span>
                      </p>
                      <p className="text-sm text-slate-600">{k.deskripsi || 'Tidak ada deskripsi.'}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">{pesertaKegiatan.length} Peserta Terdaftar</span>
                      <button
                        title="Lihat Peserta"
                        onClick={() => setSelectedKegiatanPeserta(k)}
                        className="p-2 bg-[#2158B8] text-white rounded-xl hover:bg-blue-700 transition flex items-center space-x-1 cursor-pointer"
                      >
                        <SvgUsersGroup />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. LAPORAN KEUANGAN */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Laporan Keuangan OSIS (Read Only)</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead><tr className="border-b text-[#2158B8] font-bold bg-slate-50"><th className="p-3.5">Keterangan</th><th className="p-3.5">Jenis</th><th className="p-3.5">Jumlah</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {keuanganList.map((kq) => (
                  <tr key={kq.id}>
                    <td className="p-3.5 text-slate-700 font-medium">{kq.keterangan}</td>
                    <td className="p-3.5"><span className={`px-2 py-0.5 rounded text-xs font-bold ${kq.jenis === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{kq.jenis}</span></td>
                    <td className="p-3.5 font-bold text-slate-800">Rp {Number(kq.jumlah).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL PESERTA TERDAFTAR */}
      {selectedKegiatanPeserta && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-[#2158B8] leading-tight pr-4">
                Peserta Terdaftar: {selectedKegiatanPeserta.namaKegiatan || selectedKegiatanPeserta.nama}
              </h3>
              <button
                onClick={() => setSelectedKegiatanPeserta(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {getPesertaByKegiatan(selectedKegiatanPeserta).length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-sm font-medium">Belum ada siswa yang mendaftar kegiatan ini.</p>
              ) : (
                getPesertaByKegiatan(selectedKegiatanPeserta).map((p, idx) => {
                  const valCatatan = p.catatan || p.alasan || (p.pilihanSekbid && p.pilihanSekbid !== 'Peserta Kegiatan' ? p.pilihanSekbid : null);

                  return (
                    <div key={p.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 text-sm">{p.namaSiswa || p.nama}</span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-300">
                          {p.status || 'Terdaftar'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Kelas: <span className="font-bold text-slate-700">{p.kelas || '-'}</span> | NISN/NIS: <span className="font-bold text-slate-700">{p.nis || '-'}</span>
                      </p>
                      {valCatatan && (
                        <p className="text-xs text-slate-600 font-medium pt-1">
                          Catatan: <span className="font-semibold text-slate-800">{valCatatan}</span>
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedKegiatanPeserta(null)}
                className="w-full py-3 bg-[#2158B8] text-white font-bold text-xs rounded-2xl hover:bg-[#1a4796] transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL OPSI FOTO PROFIL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl space-y-4 border border-blue-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#2158B8]">Atur Foto Profil</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3 pt-2">
              <label htmlFor="avatar-file-input-sekre" className="w-full py-3 bg-[#2158B8] text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer hover:bg-blue-700 transition">
                <SvgCamera />
                <span>Ganti / Unggah Foto Baru</span>
              </label>
              <input id="avatar-file-input-sekre" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleHapusAvatar}
                  className="w-full py-3 bg-rose-100 text-rose-700 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer hover:bg-rose-200 transition"
                >
                  <span>Hapus Foto Profil</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
