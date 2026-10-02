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

  // Helper membaca localStorage
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

  // State Utama
  const [kegiatanList, setKegiatanList] = useState(() => getInitialData('ositara_kegiatan', initialKegiatan));
  const [anggotaList, setAnggotaList] = useState(() => getInitialData('ositara_anggota', initialAnggota));
  const [proposalList, setProposalList] = useState(() => getInitialData('ositara_proposal', initialProposal));
  const [prokerList, setProkerList] = useState(() => getInitialData('ositara_proker', initialProker));
  const [keuanganList, setKeuanganList] = useState(() => getInitialData('ositara_keuangan', initialKeuangan));
  const [pendaftaranList] = useState(() => getInitialData('ositara_pendaftaran', initialPendaftaran));

  // Simpan ke LocalStorage saat state berubah
  useEffect(() => {
    localStorage.setItem('ositara_kegiatan', JSON.stringify(kegiatanList));
  }, [kegiatanList]);

  useEffect(() => {
    localStorage.setItem('ositara_anggota', JSON.stringify(anggotaList));
  }, [anggotaList]);

  useEffect(() => {
    localStorage.setItem('ositara_proposal', JSON.stringify(proposalList));
  }, [proposalList]);

  useEffect(() => {
    localStorage.setItem('ositara_proker', JSON.stringify(prokerList));
  }, [prokerList]);

  useEffect(() => {
    localStorage.setItem('ositara_keuangan', JSON.stringify(keuanganList));
  }, [keuanganList]);

  // State Form Tambah Kegiatan
  const [showTambahForm, setShowTambahForm] = useState(false);
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  // State Form Data Anggota OSIS
  const [showTambahAnggotaForm, setShowTambahAnggotaForm] = useState(false);
  const [nisAnggota, setNisAnggota] = useState('');
  const [namaAnggota, setNamaAnggota] = useState('');
  const [jabatanAnggota, setJabatanAnggota] = useState('');
  const [kelasAnggota, setKelasAnggota] = useState('');

  // State Form Pengajuan Proposal
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

  // Reset Forms
  const resetFormKegiatan = () => {
    setNamaKegiatan('');
    setTanggal('');
    setDeskripsi('');
    setShowTambahForm(false);
  };

  const resetFormAnggota = () => {
    setNisAnggota('');
    setNamaAnggota('');
    setJabatanAnggota('');
    setKelasAnggota('');
    setShowTambahAnggotaForm(false);
  };

  // Submit Handlers
  const handleSubmitKegiatan = (e) => {
    e.preventDefault();
    if (!namaKegiatan.trim() || !tanggal) {
      alert('Nama kegiatan dan tanggal wajib diisi!');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const kegiatanBaru = {
      id: Date.now(),
      namaKegiatan: namaKegiatan.trim(),
      tanggal,
      deskripsi: deskripsi.trim(),
      status: tanggal >= today ? 'Mendatang' : 'Selesai',
    };

    setKegiatanList((prev) => [kegiatanBaru, ...prev]);
    if (typeof onTambahKegiatan === 'function') onTambahKegiatan(kegiatanBaru);
    resetFormKegiatan();
  };

  const handleSubmitAnggota = (e) => {
    e.preventDefault();
    if (!nisAnggota.trim() || !namaAnggota.trim() || !jabatanAnggota.trim() || !kelasAnggota.trim()) {
      alert('Semua data anggota wajib diisi!');
      return;
    }
    const anggotaBaru = {
      id: Date.now(),
      nis: nisAnggota.trim(),
      nama: namaAnggota.trim(),
      jabatan: jabatanAnggota.trim(),
      kelas: kelasAnggota.trim(),
      status: 'Aktif',
    };

    setAnggotaList((prev) => [anggotaBaru, ...prev]);
    if (typeof onTambahAnggota === 'function') onTambahAnggota(anggotaBaru);
    resetFormAnggota();
    alert('Anggota berhasil ditambahkan!');
  };

  const handleHapusAnggotaLocal = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      setAnggotaList((prev) => prev.filter((item) => item.id !== id));
      if (typeof onHapusAnggota === 'function') onHapusAnggota(id);
    }
  };

  const handleSubmitProposal = (e) => {
    e.preventDefault();
    if (!judulProposal.trim() || !anggaranProposal) {
      alert('Judul proposal dan anggaran wajib diisi!');
      return;
    }
    const proposalBaru = {
      id: Date.now(),
      judul: judulProposal.trim(),
      kategori: kategoriProposal,
      anggaran: Number(anggaranProposal),
      file: fileProposal ? fileProposal.name : 'proposal.pdf',
      tanggal: new Date().toLocaleDateString('id-ID'),
      status: 'Menunggu Persetujuan'
    };

    setProposalList((prev) => [proposalBaru, ...prev]);
    if (typeof onTambahProposal === 'function') onTambahProposal(proposalBaru);
    setJudulProposal('');
    setAnggaranProposal('');
    setFileProposal(null);
    alert('Proposal berhasil diajukan ke Pembina!');
  };

  const handleSubmitProker = (e) => {
    e.preventDefault();
    if (!namaProker.trim() || !divisiProker.trim()) {
      alert('Nama proker dan divisi wajib diisi!');
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

  const handleSubmitKeuangan = (e) => {
    e.preventDefault();
    if (!keteranganKeuangan.trim() || !jumlahKeuangan) {
      alert('Keterangan dan jumlah nominal wajib diisi!');
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
    alert(`Catatan keuangan (${sumberDana === 'kas' ? 'Uang Kas' : 'Dana Anggaran'}) berhasil disimpan!`);
  };

  const filteredKegiatan = kegiatanList.filter((item) => {
    if (activeTab === 'Semua') return true;
    return item.status === activeTab;
  });

  // Kalkulasi Kas Internal
  const kasPemasukan = keuanganList
    .filter((k) => k.jenis === 'Pemasukan' && (k.sumberDana === 'kas' || !k.sumberDana))
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

  const kasPengeluaran = keuanganList
    .filter((k) => k.jenis === 'Pengeluaran' && (k.sumberDana === 'kas' || !k.sumberDana))
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

  const saldoKas = kasPemasukan - kasPengeluaran;

  // Kalkulasi Dana Anggaran
  const anggaranPemasukan = keuanganList
    .filter((k) => k.jenis === 'Pemasukan' && k.sumberDana === 'anggaran')
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

  const anggaranPengeluaran = keuanganList
    .filter((k) => k.jenis === 'Pengeluaran' && k.sumberDana === 'anggaran')
    .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

  const saldoAnggaran = anggaranPemasukan - anggaranPengeluaran;

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans">
      {/* SIDEBAR LEFT */}
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border-2 border-white shadow-sm">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#2158B8]">
              Halo, {user?.nama || user?.name || user?.user?.nama || 'Naura Lutfiah'}!
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Kelola proposal, program kerja, dan kegiatan siswa di sini.
            </p>
          </div>
        </div>

        {/* 1. MENU: BERANDA */}
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
                {kegiatanList.filter(k => k.status === 'Mendatang').length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Belum ada agenda kegiatan mendatang.</p>
                ) : (
                  kegiatanList.filter(k => k.status === 'Mendatang').map(k => (
                    <div key={k.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-800">{k.namaKegiatan}</h4>
                        <p className="text-xs text-slate-500 mt-1">{k.deskripsi || 'Tidak ada deskripsi'}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-[#2158B8] font-bold text-xs rounded-full">{k.tanggal}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. MENU: PENGAJUAN PROPOSAL */}
        {activeMenu === 'pengajuan-proposal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Daftar Pengajuan Proposal</h3>
              <div className="border border-blue-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                      <th className="py-3.5 px-6">Judul</th>
                      <th className="py-3.5 px-6">Anggaran</th>
                      <th className="py-3.5 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {proposalList.length === 0 ? (
                      <tr><td colSpan="3" className="py-8 text-center text-slate-400">Belum ada proposal diajukan.</td></tr>
                    ) : (
                      proposalList.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3.5 px-6 font-bold text-slate-700">{p.judul}</td>
                          <td className="py-3.5 px-6 text-slate-600">Rp {p.anggaran?.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-6">
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Form Ajukan Proposal</h3>
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Judul Proposal</label>
                  <input type="text" required value={judulProposal} onChange={(e) => setJudulProposal(e.target.value)} placeholder="Contoh: Proposal Pensi 2026" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Kategori</label>
                  <select value={kategoriProposal} onChange={(e) => setKategoriProposal(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium">
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Pengadaan Barang">Pengadaan Barang</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Estimasi Anggaran (Rp)</label>
                  <input type="number" required value={anggaranProposal} onChange={(e) => setAnggaranProposal(e.target.value)} placeholder="1500000" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">File Proposal (PDF/Doc)</label>
                  <input type="file" onChange={(e) => setFileProposal(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2158B8] hover:file:bg-blue-100" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full shadow-sm cursor-pointer mt-2">Kirim ke Pembina</button>
              </form>
            </div>
          </div>
        )}

        {/* 3. MENU: PROGRAM KERJA */}
        {activeMenu === 'program-kerja' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-6">Program Kerja OSIS</h3>
              <div className="border border-blue-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                      <th className="py-3.5 px-6">Program Kerja</th>
                      <th className="py-3.5 px-6">Divisi</th>
                      <th className="py-3.5 px-6">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prokerList.length === 0 ? (
                      <tr><td colSpan="3" className="py-8 text-center text-slate-400">Belum ada program kerja tercatat.</td></tr>
                    ) : (
                      prokerList.map((pk) => (
                        <tr key={pk.id}>
                          <td className="py-3.5 px-6 font-bold text-slate-700">{pk.nama}</td>
                          <td className="py-3.5 px-6 text-[#2158B8] font-medium">{pk.divisi}</td>
                          <td className="py-3.5 px-6 text-slate-500">{pk.target}</td>
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
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Nama Proker</label>
                  <input type="text" required value={namaProker} onChange={(e) => setNamaProker(e.target.value)} placeholder="Contoh: Classmeeting Semester 1" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Divisi Penanggung Jawab</label>
                  <input type="text" required value={divisiProker} onChange={(e) => setDivisiProker(e.target.value)} placeholder="Contoh: Sekbid Olahraga" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Target Pelaksanaan</label>
                  <input type="text" value={targetProker} onChange={(e) => setTargetProker(e.target.value)} placeholder="Contoh: Desember 2026" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full shadow-sm cursor-pointer mt-2">Simpan Proker</button>
              </form>
            </div>
          </div>
        )}

        {/* 4. MENU: ANGGOTA OSIS */}
        {activeMenu === 'anggota-osis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`bg-white p-6 rounded-3xl border border-blue-100 shadow-sm transition-all ${showTambahAnggotaForm ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2158B8]">Daftar Anggota OSIS</h3>
                <button
                  onClick={() => setShowTambahAnggotaForm(!showTambahAnggotaForm)}
                  className="px-5 py-2.5 bg-[#FFB800] hover:bg-[#e0a200] text-slate-900 font-bold text-sm rounded-xl shadow-sm transition cursor-pointer"
                >
                  {showTambahAnggotaForm ? 'Tutup Form' : '+ Tambah Anggota'}
                </button>
              </div>

              <div className="border border-blue-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-blue-100 text-[#2158B8] font-bold text-sm bg-slate-50">
                      <th className="py-3.5 px-6">NIS</th>
                      <th className="py-3.5 px-6">Nama Anggota</th>
                      <th className="py-3.5 px-6">Jabatan</th>
                      <th className="py-3.5 px-6">Kelas</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {anggotaList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">Belum ada data anggota OSIS.</td>
                      </tr>
                    ) : (
                      anggotaList.map((anggota) => (
                        <tr key={anggota.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-6 text-slate-600 font-medium">{anggota.nis}</td>
                          <td className="py-3.5 px-6 font-bold text-slate-700">{anggota.nama}</td>
                          <td className="py-3.5 px-6 text-[#2158B8] font-semibold">{anggota.jabatan}</td>
                          <td className="py-3.5 px-6 text-slate-600">{anggota.kelas}</td>
                          <td className="py-3.5 px-6">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full inline-block">
                              {anggota.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <button
                              onClick={() => handleHapusAnggotaLocal(anggota.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                              title="Hapus Anggota"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {showTambahAnggotaForm && (
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <span onClick={resetFormAnggota} className="text-[#2158B8] text-xl font-bold cursor-pointer">←</span>
                  <h3 className="text-xl font-bold text-[#2158B8]">Tambah Anggota OSIS</h3>
                </div>

                <form onSubmit={handleSubmitAnggota} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">NIS</label>
                    <input type="text" required value={nisAnggota} onChange={(e) => setNisAnggota(e.target.value)} placeholder="Masukkan NIS" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Nama Anggota</label>
                    <input type="text" required value={namaAnggota} onChange={(e) => setNamaAnggota(e.target.value)} placeholder="Masukkan Nama Lengkap" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Jabatan</label>
                    <input type="text" required value={jabatanAnggota} onChange={(e) => setJabatanAnggota(e.target.value)} placeholder="Contoh: Sie Kerohanian" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Kelas</label>
                    <input type="text" required value={kelasAnggota} onChange={(e) => setKelasAnggota(e.target.value)} placeholder="Contoh: XI PPLG 1" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                  </div>

                  <div className="flex items-center space-x-4 pt-4">
                    <button type="button" onClick={resetFormAnggota} className="flex-1 py-3 bg-[#F2F4F7] text-[#2158B8] font-bold text-sm rounded-full transition cursor-pointer">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full transition shadow-sm cursor-pointer">Simpan</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 5. MENU: KELOLA KEGIATAN */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`bg-white p-6 rounded-3xl border border-blue-100 shadow-sm transition-all ${showTambahForm ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2158B8]">Daftar Kegiatan</h3>
                <button
                  onClick={() => setShowTambahForm(!showTambahForm)}
                  className="px-5 py-2.5 bg-[#FFB800] hover:bg-[#e0a200] text-slate-900 font-bold text-sm rounded-xl shadow-sm transition cursor-pointer"
                >
                  {showTambahForm ? 'Tutup Form' : '+ Tambah Kegiatan'}
                </button>
              </div>

              {/* Tab Filter */}
              <div className="flex space-x-2 mb-4">
                {['Semua', 'Mendatang', 'Selesai'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                      activeTab === tab ? 'bg-[#2158B8] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="border border-blue-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                      <th className="py-3.5 px-6">Nama Kegiatan</th>
                      <th className="py-3.5 px-6">Tanggal</th>
                      <th className="py-3.5 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredKegiatan.length === 0 ? (
                      <tr><td colSpan="3" className="py-8 text-center text-slate-400">Belum ada kegiatan.</td></tr>
                    ) : (
                      filteredKegiatan.map((k) => (
                        <tr key={k.id}>
                          <td className="py-3.5 px-6 font-bold text-slate-700">{k.namaKegiatan}</td>
                          <td className="py-3.5 px-6 text-slate-600">{k.tanggal}</td>
                          <td className="py-3.5 px-6">
                            <span className={`px-3 py-1 font-bold text-xs rounded-full ${
                              k.status === 'Mendatang' ? 'bg-blue-100 text-[#2158B8]' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {k.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {showTambahForm && (
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#2158B8] mb-6">Tambah Kegiatan Baru</h3>
                <form onSubmit={handleSubmitKegiatan} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Nama Kegiatan</label>
                    <input type="text" required value={namaKegiatan} onChange={(e) => setNamaKegiatan(e.target.value)} placeholder="Contoh: Peringatan Hari Kartini" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Tanggal Pelaksanaan</label>
                    <input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Deskripsi Kegiatan</label>
                    <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Tuliskan deskripsi singkat..." rows="3" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium"></textarea>
                  </div>
                  <div className="flex items-center space-x-4 pt-2">
                    <button type="button" onClick={resetFormKegiatan} className="flex-1 py-3 bg-[#F2F4F7] text-[#2158B8] font-bold text-sm rounded-full transition cursor-pointer">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full transition shadow-sm cursor-pointer">Simpan</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 6. MENU: LAPORAN KEUANGAN */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Saldo Kas Internal OSIS</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">
                  Rp {saldoKas.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Saldo Dana Anggaran Sekolah</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-2">
                  Rp {saldoAnggaran.toLocaleString('id-ID')}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#2158B8] mb-6">Catatan Keuangan</h3>
                <div className="border border-blue-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                        <th className="py-3.5 px-6">Tanggal</th>
                        <th className="py-3.5 px-6">Keterangan</th>
                        <th className="py-3.5 px-6">Jenis / Sumber</th>
                        <th className="py-3.5 px-6">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {keuanganList.length === 0 ? (
                        <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada transaksi.</td></tr>
                      ) : (
                        keuanganList.map((k) => (
                          <tr key={k.id}>
                            <td className="py-3.5 px-6 text-slate-500">{k.tanggal}</td>
                            <td className="py-3.5 px-6 font-bold text-slate-700">{k.keterangan}</td>
                            <td className="py-3.5 px-6">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                k.jenis === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {k.jenis} ({k.sumberDana === 'anggaran' ? 'Anggaran' : 'Kas'})
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-bold text-slate-700">Rp {k.jumlah?.toLocaleString('id-ID')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#2158B8] mb-6">Tambah Catatan Keuangan</h3>
                <form onSubmit={handleSubmitKeuangan} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Jenis Transaksi</label>
                    <select value={jenisTrans} onChange={(e) => setJenisTrans(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium">
                      <option value="Pemasukan">Pemasukan</option>
                      <option value="Pengeluaran">Pengeluaran</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Sumber Dana</label>
                    <select value={sumberDana} onChange={(e) => setSumberDana(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium">
                      <option value="kas">Kas Internal Pengurus</option>
                      <option value="anggaran">Dana Anggaran Sekolah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Keterangan</label>
                    <input type="text" required value={keteranganKeuangan} onChange={(e) => setKeteranganKeuangan(e.target.value)} placeholder="Contoh: Iuran Kas Anggota Bulan Mei" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2158B8] mb-1.5">Jumlah Nominal (Rp)</label>
                    <input type="number" required value={jumlahKeuangan} onChange={(e) => setJumlahKeuangan(e.target.value)} placeholder="50000" className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#FFB800] text-slate-900 font-bold text-sm rounded-full shadow-sm cursor-pointer mt-2">Simpan Catatan</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
