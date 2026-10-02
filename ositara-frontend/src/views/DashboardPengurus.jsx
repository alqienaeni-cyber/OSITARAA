import { useState, useEffect } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function DashboardPengurus({
  user,
  onLogout,
  kegiatanList: initialKegiatan = [],
  pendaftaranList: initialPendaftaran = [],
  onTambahKegiatan,
  anggotaList: initialAnggota = [],
  onTambahAnggota,
  onHapusAnggota,
  proposalList: initialProposal = [],
  onTambahProposal,
  prokerList: initialProker = [],
  onTambahProker,
  laporanKeuanganList: initialKeuangan = [],
  onTambahKeuangan
}) {
  const [activeMenu, setActiveMenu] = useState('beranda');

  // Helper membaca localStorage dengan error handling
  const getInitialData = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      return fallback;
    } catch (e) {
      console.error(`Error loading ${key} from localStorage`, e);
      return fallback;
    }
  };

  // State Utama (CRUD State)
  const [kegiatanList, setKegiatanList] = useState(() => getInitialData('ositara_kegiatan', initialKegiatan));
  const [anggotaList, setAnggotaList] = useState(() => getInitialData('ositara_anggota', initialAnggota));
  const [proposalList, setProposalList] = useState(() => getInitialData('ositara_proposal', initialProposal));
  const [prokerList, setProkerList] = useState(() => getInitialData('ositara_proker', initialProker));
  const [keuanganList, setKeuanganList] = useState(() => getInitialData('ositara_keuangan', initialKeuangan));
  const [pendaftaranList, setPendaftaranList] = useState(() => getInitialData('ositara_pendaftaran', initialPendaftaran));

  // State Avatar Foto Profil
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_user_avatar') || null);

  // State Modal Peserta Pendaftar
  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);

  // Sync Data dengan LocalStorage secara Real-time
  useEffect(() => {
    const handleStorageChange = () => {
      setPendaftaranList(getInitialData('ositara_pendaftaran', initialPendaftaran));
      setProposalList(getInitialData('ositara_proposal', initialProposal));
      setKegiatanList(getInitialData('ositara_kegiatan', initialKegiatan));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => { localStorage.setItem('ositara_kegiatan', JSON.stringify(kegiatanList)); }, [kegiatanList]);
  useEffect(() => { localStorage.setItem('ositara_anggota', JSON.stringify(anggotaList)); }, [anggotaList]);
  useEffect(() => { localStorage.setItem('ositara_proposal', JSON.stringify(proposalList)); }, [proposalList]);
  useEffect(() => { localStorage.setItem('ositara_proker', JSON.stringify(prokerList)); }, [prokerList]);
  useEffect(() => { localStorage.setItem('ositara_keuangan', JSON.stringify(keuanganList)); }, [keuanganList]);

  // State Form & Edit Kelola Kegiatan
  const [showTambahForm, setShowTambahForm] = useState(false);
  const [editingKegiatanId, setEditingKegiatanId] = useState(null);
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  // State Form & Edit Anggota OSIS
  const [showTambahAnggotaForm, setShowTambahAnggotaForm] = useState(false);
  const [editingAnggotaId, setEditingAnggotaId] = useState(null);
  const [nisAnggota, setNisAnggota] = useState('');
  const [namaAnggota, setNamaAnggota] = useState('');
  const [jabatanAnggota, setJabatanAnggota] = useState('');
  const [sekbidAnggota, setSekbidAnggota] = useState('Pengurus Inti');
  const [kelasAnggota, setKelasAnggota] = useState('');

  // State Form Proposal
  const [judulProposal, setJudulProposal] = useState('');
  const [kategoriProposal, setKategoriProposal] = useState('Kegiatan');
  const [anggaranProposal, setAnggaranProposal] = useState('');
  const [fileProposal, setFileProposal] = useState(null);

  // State Form Program Kerja
  const [namaProker, setNamaProker] = useState('');
  const [divisiProker, setDivisiProker] = useState('');
  const [targetProker, setTargetProker] = useState('');

  // State Form Laporan Keuangan
  const [jenisTrans, setJenisTrans] = useState('Pemasukan');
  const [sumberDana, setSumberDana] = useState('kas');
  const [keteranganKeuangan, setKeteranganKeuangan] = useState('');
  const [jumlahKeuangan, setJumlahKeuangan] = useState('');

  // Handler Upload & Hapus Profil Avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran foto maksimal 3MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_user_avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusAvatar = () => {
    if (window.confirm('Hapus foto profil?')) {
      setAvatarUrl(null);
      localStorage.removeItem('ositara_user_avatar');
    }
  };

  // --- LOGIKA CRUD KEGIATAN ---
  const handleSubmitKegiatan = (e) => {
    e.preventDefault();
    if (!namaKegiatan.trim() || !tanggal) {
      alert('Nama kegiatan dan tanggal wajib diisi!');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const statusAuto = tanggal >= today ? 'Mendatang' : 'Selesai';

    if (editingKegiatanId) {
      setKegiatanList((prev) =>
        prev.map((item) =>
          item.id === editingKegiatanId
            ? { ...item, namaKegiatan: namaKegiatan.trim(), tanggal, deskripsi: deskripsi.trim(), status: statusAuto }
            : item
        )
      );
      setEditingKegiatanId(null);
      alert('Data kegiatan berhasil diperbarui!');
    } else {
      const kegiatanBaru = {
        id: Date.now(),
        namaKegiatan: namaKegiatan.trim(),
        tanggal,
        deskripsi: deskripsi.trim(),
        status: statusAuto,
      };
      setKegiatanList((prev) => [kegiatanBaru, ...prev]);
      if (typeof onTambahKegiatan === 'function') onTambahKegiatan(kegiatanBaru);
      alert('Kegiatan baru berhasil ditambahkan!');
    }

    setNamaKegiatan('');
    setTanggal('');
    setDeskripsi('');
    setShowTambahForm(false);
  };

  const handleEditKegiatan = (item) => {
    setEditingKegiatanId(item.id);
    setNamaKegiatan(item.namaKegiatan);
    setTanggal(item.tanggal);
    setDeskripsi(item.deskripsi || '');
    setShowTambahForm(true);
  };

  const handleHapusKegiatan = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      setKegiatanList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // --- LOGIKA CRUD ANGGOTA OSIS ---
  const handleSubmitAnggota = (e) => {
    e.preventDefault();
    if (!nisAnggota.trim() || !namaAnggota.trim() || !jabatanAnggota.trim() || !kelasAnggota.trim()) {
      alert('Semua bidang data anggota wajib diisi!');
      return;
    }

    if (editingAnggotaId) {
      setAnggotaList((prev) =>
        prev.map((item) =>
          item.id === editingAnggotaId
            ? { ...item, nis: nisAnggota.trim(), nama: namaAnggota.trim(), jabatan: jabatanAnggota.trim(), sekbid: sekbidAnggota, kelas: kelasAnggota.trim() }
            : item
        )
      );
      setEditingAnggotaId(null);
      alert('Data anggota berhasil diperbarui!');
    } else {
      const anggotaBaru = {
        id: Date.now(),
        nis: nisAnggota.trim(),
        nama: namaAnggota.trim(),
        jabatan: jabatanAnggota.trim(),
        sekbid: sekbidAnggota,
        kelas: kelasAnggota.trim(),
        status: 'Aktif',
      };
      setAnggotaList((prev) => [anggotaBaru, ...prev]);
      if (typeof onTambahAnggota === 'function') onTambahAnggota(anggotaBaru);
      alert('Anggota baru berhasil ditambahkan!');
    }

    setNisAnggota('');
    setNamaAnggota('');
    setJabatanAnggota('');
    setSekbidAnggota('Pengurus Inti');
    setKelasAnggota('');
    setShowTambahAnggotaForm(false);
  };

  const handleEditAnggota = (anggota) => {
    setEditingAnggotaId(anggota.id);
    setNisAnggota(anggota.nis);
    setNamaAnggota(anggota.nama);
    setJabatanAnggota(anggota.jabatan);
    setSekbidAnggota(anggota.sekbid || 'Pengurus Inti');
    setKelasAnggota(anggota.kelas);
    setShowTambahAnggotaForm(true);
  };

  const handleHapusAnggotaLocal = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      setAnggotaList((prev) => prev.filter((item) => item.id !== id));
      if (typeof onHapusAnggota === 'function') onHapusAnggota(id);
    }
  };

  // --- LOGIKA CRUD PROPOSAL ---
  const handleSubmitProposal = (e) => {
    e.preventDefault();
    if (!judulProposal.trim() || !anggaranProposal) {
      alert('Judul proposal dan estimasi anggaran wajib diisi!');
      return;
    }

    const saveProposalData = (fileUrl = null, fileName = null) => {
      const proposalBaru = {
        id: Date.now(),
        judul: judulProposal.trim(),
        kategori: kategoriProposal,
        anggaran: Number(anggaranProposal),
        file: fileName || (fileProposal ? fileProposal.name : 'proposal.pdf'),
        fileData: fileUrl,
        tanggal: new Date().toLocaleDateString('id-ID'),
        status: 'Menunggu Persetujuan',
        catatanRevisi: ''
      };

      const updatedList = [proposalBaru, ...proposalList];
      setProposalList(updatedList);
      localStorage.setItem('ositara_proposal', JSON.stringify(updatedList));

      if (typeof onTambahProposal === 'function') onTambahProposal(proposalBaru);
      setJudulProposal('');
      setAnggaranProposal('');
      setFileProposal(null);
      alert('Proposal berhasil diajukan dan tersinkronisasi ke Pembina!');
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
    if (window.confirm('Apakah Anda yakin ingin menghapus proposal ini? Hapus akan tersinkronisasi ke akun Pembina.')) {
      const updatedList = proposalList.filter((p) => p.id !== id);
      setProposalList(updatedList);
      localStorage.setItem('ositara_proposal', JSON.stringify(updatedList));
    }
  };

  // --- LOGIKA CRUD PROGRAM KERJA ---
  const handleSubmitProker = (e) => {
    e.preventDefault();
    if (!namaProker.trim() || !divisiProker.trim()) {
      alert('Nama proker dan divisi penanggung jawab wajib diisi!');
      return;
    }
    const prokerBaru = {
      id: Date.now(),
      nama: namaProker.trim(),
      divisi: divisiProker.trim(),
      target: targetProker.trim(),
      status: 'Rencana'
    };

    setProkerList((prev) => [prokerBaru, ...prev]);
    if (typeof onTambahProker === 'function') onTambahProker(prokerBaru);
    setNamaProker('');
    setDivisiProker('');
    setTargetProker('');
    alert('Program Kerja berhasil ditambahkan!');
  };

  const handleHapusProker = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus program kerja ini?')) {
      setProkerList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // --- LOGIKA CRUD LAPORAN KEUANGAN ---
  const handleSubmitKeuangan = (e) => {
    e.preventDefault();
    if (!keteranganKeuangan.trim() || !jumlahKeuangan) {
      alert('Keterangan dan nominal transaksi wajib diisi!');
      return;
    }
    const keuanganBaru = {
      id: Date.now(),
      jenis: jenisTrans,
      sumberDana: sumberDana,
      keterangan: keteranganKeuangan.trim(),
      jumlah: Number(jumlahKeuangan),
      tanggal: new Date().toLocaleDateString('id-ID')
    };

    setKeuanganList((prev) => [keuanganBaru, ...prev]);
    if (typeof onTambahKeuangan === 'function') onTambahKeuangan(keuanganBaru);
    setKeteranganKeuangan('');
    setJumlahKeuangan('');
    alert('Catatan transaksi keuangan berhasil disimpan!');
  };

  const handleHapusKeuangan = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan transaksi keuangan ini?')) {
      setKeuanganList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Helper Pencarian Peserta per Kegiatan
  const getPesertaByKegiatan = (keg) => {
    return pendaftaranList.filter((p) =>
      p.kegiatanId === keg.id ||
      p.namaKegiatan?.toLowerCase() === keg.namaKegiatan?.toLowerCase() ||
      p.kegiatanNama?.toLowerCase() === keg.namaKegiatan?.toLowerCase()
    );
  };

  // Kalkulasi Keuangan Kas vs Anggaran
  const kasPemasukan = keuanganList
    .filter((k) => k.jenis === 'Pemasukan' && (k.sumberDana === 'kas' || !k.sumberDana))
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  const kasPengeluaran = keuanganList
    .filter((k) => k.jenis === 'Pengeluaran' && (k.sumberDana === 'kas' || !k.sumberDana))
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  const saldoKas = kasPemasukan - kasPengeluaran;

  const anggaranPemasukan = keuanganList
    .filter((k) => k.jenis === 'Pemasukan' && k.sumberDana === 'anggaran')
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  const anggaranPengeluaran = keuanganList
    .filter((k) => k.jenis === 'Pengeluaran' && k.sumberDana === 'anggaran')
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  const saldoAnggaran = anggaranPemasukan - anggaranPengeluaran;

  const filteredKegiatan = kegiatanList.filter((item) => {
    if (activeTab === 'Semua') return true;
    return item.status === activeTab;
  });

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans relative">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <img
              src={logoOsitara}
              alt="Logo OSITARA"
              className="w-10 h-10 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-blue-200 font-bold tracking-wide mt-1 uppercase">PENGURUS OSIS</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'beranda', label: 'Beranda', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
              { id: 'pengajuan-proposal', label: 'Pengajuan Proposal', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>) },
              { id: 'program-kerja', label: 'Program Kerja', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>) },
              { id: 'anggota-osis', label: 'Anggota OSIS', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>) },
              { id: 'kelola-kegiatan', label: 'Kelola Kegiatan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>) },
              { id: 'kegiatan', label: 'Kegiatan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>) },
              { id: 'laporan-keuangan', label: 'Laporan Keuangan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>) },
            ].map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  activeMenu === menu.id ? 'bg-[#FFF3BF] text-[#2158B8] shadow-sm' : 'hover:bg-white/10 text-white'
                }`}
              >
                <span>{menu.icon}</span>
                <span>{menu.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto min-w-0">
        {/* HEADER USER & PROFIL AVATAR */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative group">
            <label htmlFor="avatar-upload" className="cursor-pointer block" title="Klik untuk ubah foto profil">
              <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border-2 border-white shadow-sm overflow-hidden group-hover:opacity-80 transition">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

            {avatarUrl && (
              <button
                onClick={handleHapusAvatar}
                className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 shadow-sm transition"
                title="Hapus foto profil"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#2158B8]">
              Halo, {user?.nama || user?.name || user?.user?.nama || 'Naura Lutfiah'}!
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Dashboard Pengurus OSIS - Kelola proposal, kegiatan, dan anggaran sekolah.
            </p>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Kegiatan</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">{kegiatanList.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Anggota</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">{anggotaList.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Proposal Diajukan</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">{proposalList.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Pendaftar Siswa</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">{pendaftaranList.length}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Kegiatan Mendatang</h3>
              <div className="space-y-3">
                {kegiatanList.filter((k) => k.status === 'Mendatang').length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Belum ada agenda kegiatan mendatang.</p>
                ) : (
                  kegiatanList.filter((k) => k.status === 'Mendatang').map((k) => (
                    <div key={k.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-800">{k.namaKegiatan}</h4>
                        <p className="text-xs text-slate-500 mt-1">{k.deskripsi || 'Tidak ada deskripsi'}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedKegiatanPeserta(k)}
                          className="px-3 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          {getPesertaByKegiatan(k).length} Peserta
                        </button>
                        <span className="px-3 py-1 bg-blue-100 text-[#2158B8] font-bold text-xs rounded-full">{k.tanggal}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. PENGAJUAN PROPOSAL */}
        {activeMenu === 'pengajuan-proposal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Pengajuan Proposal</h3>
              <div className="border border-blue-100 rounded-2xl overflow-x-auto">
                <table className="w-full min-w-[650px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                      <th className="py-3.5 px-6">Judul</th>
                      <th className="py-3.5 px-6">Anggaran</th>
                      <th className="py-3.5 px-6">File Proposal</th>
                      <th className="py-3.5 px-6">Status & Catatan Pembina</th>
                      <th className="py-3.5 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {proposalList.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-slate-400">Belum ada proposal diajukan.</td></tr>
                    ) : (
                      proposalList.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3.5 px-6 font-bold text-slate-700">{p.judul}</td>
                          <td className="py-3.5 px-6 text-slate-600 font-medium">Rp {p.anggaran?.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-6">
                            {p.fileData ? (
                              <a
                                href={p.fileData}
                                download={p.file || 'Proposal.pdf'}
                                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-[#2158B8] border border-blue-200 hover:bg-blue-100 font-semibold text-xs rounded-lg transition"
                                title="Klik untuk membuka/mengunduh file proposal"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="max-w-[100px] truncate">{p.file || 'Unduh PDF'}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs italic">{p.file || 'File default'}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`px-3 py-1 font-bold text-xs rounded-full whitespace-nowrap ${
                                p.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' :
                                p.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
                                p.status === 'Revisi' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {p.status}
                              </span>

                              {/* CATATAN REVISI DARI PEMBINA */}
                              {p.catatanRevisi && (
                                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 max-w-xs">
                                  <span className="font-bold block text-amber-800">Catatan Pembina:</span>
                                  <p className="italic">{p.catatanRevisi}</p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <button
                              onClick={() => handleHapusProposal(p.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Proposal (Otomatis hapus di Pembina)"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Form Ajukan Proposal Baru</h3>
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Judul Proposal</label>
                  <input type="text" required value={judulProposal} onChange={(e) => setJudulProposal(e.target.value)} placeholder="Contoh: Proposal Pensi 2026" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Kategori</label>
                  <select value={kategoriProposal} onChange={(e) => setKategoriProposal(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]">
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Pengadaan Barang">Pengadaan Barang</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Estimasi Anggaran (Rp)</label>
                  <input type="number" required value={anggaranProposal} onChange={(e) => setAnggaranProposal(e.target.value)} placeholder="1500000" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Lampiran File (PDF/Doc)</label>
                  <input type="file" onChange={(e) => setFileProposal(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2158B8]" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full shadow-sm cursor-pointer mt-2 hover:bg-[#e0a200]">
                  Kirim & Sinkronkan ke Pembina
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. PROGRAM KERJA */}
        {activeMenu === 'program-kerja' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Program Kerja OSIS</h3>
              <div className="border border-blue-100 rounded-2xl overflow-x-auto">
                <table className="w-full min-w-[500px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                      <th className="py-3.5 px-6">Program Kerja</th>
                      <th className="py-3.5 px-6">Divisi</th>
                      <th className="py-3.5 px-6">Target</th>
                      <th className="py-3.5 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prokerList.length === 0 ? (
                      <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada program kerja.</td></tr>
                    ) : (
                      prokerList.map((pk) => (
                        <tr key={pk.id}>
                          <td className="py-3.5 px-6 font-bold text-slate-700">{pk.nama}</td>
                          <td className="py-3.5 px-6 text-[#2158B8] font-medium">{pk.divisi}</td>
                          <td className="py-3.5 px-6 text-slate-500">{pk.target}</td>
                          <td className="py-3.5 px-6 text-center">
                            <button onClick={() => handleHapusProker(pk.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Hapus Proker">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Tambah Program Kerja</h3>
              <form onSubmit={handleSubmitProker} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Nama Program Kerja</label>
                  <input type="text" required value={namaProker} onChange={(e) => setNamaProker(e.target.value)} placeholder="Contoh: Classmeeting Semester" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Divisi / Sekbid Penanggung Jawab</label>
                  <input type="text" required value={divisiProker} onChange={(e) => setDivisiProker(e.target.value)} placeholder="Contoh: Sekbid Olahraga" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Target Pelaksanaan</label>
                  <input type="text" value={targetProker} onChange={(e) => setTargetProker(e.target.value)} placeholder="Contoh: Desember 2026" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full shadow-sm cursor-pointer mt-2 hover:bg-[#e0a200]">
                  Simpan Program Kerja
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. ANGGOTA OSIS */}
        {activeMenu === 'anggota-osis' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#2158B8]">Daftar Anggota OSIS</h3>
              <button
                onClick={() => {
                  setEditingAnggotaId(null);
                  setNisAnggota('');
                  setNamaAnggota('');
                  setJabatanAnggota('');
                  setSekbidAnggota('Pengurus Inti');
                  setKelasAnggota('');
                  setShowTambahAnggotaForm(true);
                }}
                className="px-4 py-2 bg-[#2158B8] text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition cursor-pointer"
              >
                + Tambah Anggota
              </button>
            </div>

            {showTambahAnggotaForm && (
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <h4 className="text-lg font-bold text-[#2158B8] mb-4">{editingAnggotaId ? 'Edit Anggota' : 'Form Tambah Anggota'}</h4>
                <form onSubmit={handleSubmitAnggota} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">NIS</label>
                    <input type="text" required value={nisAnggota} onChange={(e) => setNisAnggota(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-blue-200 text-sm" placeholder="12345" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Lengkap</label>
                    <input type="text" required value={namaAnggota} onChange={(e) => setNamaAnggota(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-blue-200 text-sm" placeholder="Nama Anggota" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Sekbid / Bidang</label>
                    <select value={sekbidAnggota} onChange={(e) => setSekbidAnggota(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-blue-200 text-sm">
                      <option value="Pengurus Inti">Pengurus Inti</option>
                      <option value="Sekbid 1 - Keagamaan">Sekbid 1 - Keagamaan</option>
                      <option value="Sekbid 2 - Budi Pekerti">Sekbid 2 - Budi Pekerti</option>
                      <option value="Sekbid 3 - Kewarganegaraan">Sekbid 3 - Kewarganegaraan</option>
                      <option value="Sekbid 4 - Olahraga & Seni">Sekbid 4 - Olahraga & Seni</option>
                      <option value="Sekbid 5 - Teknologi & Humas">Sekbid 5 - Teknologi & Humas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Jabatan</label>
                    <input type="text" required value={jabatanAnggota} onChange={(e) => setJabatanAnggota(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-blue-200 text-sm" placeholder="Ketua / Anggota" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Kelas</label>
                    <input type="text" required value={kelasAnggota} onChange={(e) => setKelasAnggota(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-blue-200 text-sm" placeholder="XI PPLG 1" />
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                    <button type="button" onClick={() => setShowTambahAnggotaForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-[#FFB800] text-slate-900 rounded-xl font-bold text-xs">Simpan</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                    <th className="py-3.5 px-6">NIS</th>
                    <th className="py-3.5 px-6">Nama</th>
                    <th className="py-3.5 px-6">Sekbid</th>
                    <th className="py-3.5 px-6">Jabatan</th>
                    <th className="py-3.5 px-6">Kelas</th>
                    <th className="py-3.5 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggotaList.length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-400">Belum ada anggota OSIS.</td></tr>
                  ) : (
                    anggotaList.map((a) => (
                      <tr key={a.id}>
                        <td className="py-3.5 px-6 font-medium text-slate-600">{a.nis}</td>
                        <td className="py-3.5 px-6 font-bold text-slate-800">{a.nama}</td>
                        <td className="py-3.5 px-6 text-[#2158B8] font-semibold">{a.sekbid || 'Pengurus Inti'}</td>
                        <td className="py-3.5 px-6 text-slate-600">{a.jabatan}</td>
                        <td className="py-3.5 px-6 text-slate-500">{a.kelas}</td>
                        <td className="py-3.5 px-6 text-center space-x-2">
                          <button onClick={() => handleEditAnggota(a)} className="text-amber-600 hover:text-amber-700 font-bold text-xs">Edit</button>
                          <button onClick={() => handleHapusAnggotaLocal(a.id)} className="text-rose-500 hover:text-rose-600 font-bold text-xs">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. KELOLA KEGIATAN */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#2158B8]">Kelola Kegiatan</h3>
              <button
                onClick={() => {
                  setEditingKegiatanId(null);
                  setNamaKegiatan('');
                  setTanggal('');
                  setDeskripsi('');
                  setShowTambahForm(true);
                }}
                className="px-4 py-2 bg-[#2158B8] text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition cursor-pointer"
              >
                + Tambah Kegiatan
              </button>
            </div>

            {showTambahForm && (
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <h4 className="text-lg font-bold text-[#2158B8] mb-4">{editingKegiatanId ? 'Edit Kegiatan' : 'Form Tambah Kegiatan'}</h4>
                <form onSubmit={handleSubmitKegiatan} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Kegiatan</label>
                    <input type="text" required value={namaKegiatan} onChange={(e) => setNamaKegiatan(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-blue-200 text-sm" placeholder="Nama kegiatan" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Tanggal Pelaksanaan</label>
                    <input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-blue-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2158B8] mb-1">Deskripsi Kegiatan</label>
                    <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-blue-200 text-sm" rows="3" placeholder="Deskripsi singkat..."></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowTambahForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-[#FFB800] text-slate-900 rounded-xl font-bold text-xs">Simpan</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                    <th className="py-3.5 px-6">Nama Kegiatan</th>
                    <th className="py-3.5 px-6">Tanggal</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kegiatanList.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada kegiatan.</td></tr>
                  ) : (
                    kegiatanList.map((k) => (
                      <tr key={k.id}>
                        <td className="py-3.5 px-6 font-bold text-slate-800">{k.namaKegiatan}</td>
                        <td className="py-3.5 px-6 text-slate-600">{k.tanggal}</td>
                        <td className="py-3.5 px-6">
                          <span className={`px-3 py-1 font-bold text-xs rounded-full ${k.status === 'Mendatang' ? 'bg-blue-100 text-[#2158B8]' : 'bg-slate-100 text-slate-600'}`}>
                            {k.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center space-x-2">
                          <button onClick={() => handleEditKegiatan(k)} className="text-amber-600 hover:text-amber-700 font-bold text-xs">Edit</button>
                          <button onClick={() => handleHapusKegiatan(k.id)} className="text-rose-500 hover:text-rose-600 font-bold text-xs">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. KEGIATAN (VIEW FILTER) */}
        {activeMenu === 'kegiatan' && (
          <div className="space-y-6">
            <div className="flex space-x-2 border-b border-slate-200 pb-2">
              {['Semua', 'Mendatang', 'Selesai'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-bold text-sm rounded-xl transition ${activeTab === tab ? 'bg-[#2158B8] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredKegiatan.length === 0 ? (
                <p className="text-slate-400 italic text-sm col-span-2">Tidak ada kegiatan dalam kategori ini.</p>
              ) : (
                filteredKegiatan.map((k) => (
                  <div key={k.id} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-800">{k.namaKegiatan}</h4>
                        <span className={`px-3 py-1 font-bold text-xs rounded-full ${k.status === 'Mendatang' ? 'bg-blue-100 text-[#2158B8]' : 'bg-slate-100 text-slate-600'}`}>
                          {k.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">{k.deskripsi || 'Tidak ada deskripsi detail'}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400">Tanggal: {k.tanggal}</span>
                      <button
                        onClick={() => setSelectedKegiatanPeserta(k)}
                        className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-xl hover:bg-amber-200 transition"
                      >
                        {getPesertaByKegiatan(k).length} Pendaftar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 7. LAPORAN KEUANGAN */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Saldo Kas OSIS</p>
                <h3 className="text-2xl font-black text-[#2158B8] mt-2">Rp {saldoKas.toLocaleString('id-ID')}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Saldo Anggaran Sekolah</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-2">Rp {saldoAnggaran.toLocaleString('id-ID')}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#2158B8] mb-6">Catatan Keuangan</h3>
                <div className="border border-blue-100 rounded-2xl overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                        <th className="py-3.5 px-6">Keterangan</th>
                        <th className="py-3.5 px-6">Sumber</th>
                        <th className="py-3.5 px-6">Jenis</th>
                        <th className="py-3.5 px-6">Jumlah</th>
                        <th className="py-3.5 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {keuanganList.length === 0 ? (
                        <tr><td colSpan="5" className="py-8 text-center text-slate-400">Belum ada transaksi.</td></tr>
                      ) : (
                        keuanganList.map((kq) => (
                          <tr key={kq.id}>
                            <td className="py-3.5 px-6 font-medium text-slate-700">{kq.keterangan}</td>
                            <td className="py-3.5 px-6 uppercase text-xs font-bold text-slate-500">{kq.sumberDana || 'kas'}</td>
                            <td className="py-3.5 px-6">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${kq.jenis === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {kq.jenis}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-bold text-slate-800">Rp {Number(kq.jumlah).toLocaleString('id-ID')}</td>
                            <td className="py-3.5 px-6 text-center">
                              <button onClick={() => handleHapusKeuangan(kq.id)} className="text-rose-500 hover:text-rose-600 font-bold text-xs">Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#2158B8] mb-6">Tambah Catatan Transaksi</h3>
                <form onSubmit={handleSubmitKeuangan} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Jenis Transaksi</label>
                    <select value={jenisTrans} onChange={(e) => setJenisTrans(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm">
                      <option value="Pemasukan">Pemasukan</option>
                      <option value="Pengeluaran">Pengeluaran</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Sumber Dana</label>
                    <select value={sumberDana} onChange={(e) => setSumberDana(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm">
                      <option value="kas">Kas OSIS</option>
                      <option value="anggaran">Anggaran Sekolah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Keterangan Transaksi</label>
                    <input type="text" required value={keteranganKeuangan} onChange={(e) => setKeteranganKeuangan(e.target.value)} placeholder="Contoh: Pembelian Perlengkapan" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Jumlah Nominal (Rp)</label>
                    <input type="number" required value={jumlahKeuangan} onChange={(e) => setJumlahKeuangan(e.target.value)} placeholder="50000" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 text-sm" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full shadow-sm hover:bg-[#e0a200] transition">
                    Simpan Transaksi
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DETAIL PESERTA PENDAFTAR KEGIATAN */}
      {selectedKegiatanPeserta && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-blue-100 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#2158B8]">Daftar Peserta Pendaftar</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedKegiatanPeserta.namaKegiatan}</p>
              </div>
              <button
                onClick={() => setSelectedKegiatanPeserta(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="my-4 overflow-y-auto flex-1">
              {getPesertaByKegiatan(selectedKegiatanPeserta).length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm italic">Belum ada peserta yang mendaftar kegiatan ini.</p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
                      <th className="py-2 px-4">Nama Siswa</th>
                      <th className="py-2 px-4">Kelas</th>
                      <th className="py-2 px-4">Kontak / Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getPesertaByKegiatan(selectedKegiatanPeserta).map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td className="py-3 px-4 font-bold text-slate-800">{p.nama || p.namaSiswa || 'Siswa OSITARA'}</td>
                        <td className="py-3 px-4 text-slate-600">{p.kelas || '-'}</td>
                        <td className="py-3 px-4 text-slate-500">{p.kontak || p.alasan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedKegiatanPeserta(null)}
                className="px-5 py-2 bg-[#2158B8] text-white rounded-xl font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
