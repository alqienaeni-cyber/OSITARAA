import { useState, useRef } from 'react';
import logoOsitaraImport from '../assets/LOGO OSITARA.png';

export default function DashboardPengurus({
  user,
  onLogout,
  // Props State Terhubung dengan Pembina
  prokerList, setProkerList,
  proposalList, setProposalList,
  anggotaList, setAnggotaList,
  laporanKegList, setLaporanKegList,
  keuanganList, setKeuanganList
}) {
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [logoSrc, setLogoSrc] = useState(logoOsitaraImport);

  // STATE PROFIL
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // STATE FORM INPUT
  const [newProker, setNewProker] = useState({ nama: '', penanggungJawab: '', target: '', file: null, fileName: '' });
  const [newProposal, setNewProposal] = useState({ judul: '', file: null, fileName: '' });
  const [newAnggota, setNewAnggota] = useState({ nama: '', jabatan: '', sekbid: '' });
  const [newLaporanKeg, setNewLaporanKeg] = useState({ namaKegiatan: '', tanggal: '', penanggungJawab: '', file: null, fileName: '' });
  const [newKeuangan, setNewKeuangan] = useState({ keterangan: '', jenis: 'Pemasukan', nominal: '', tanggal: '', file: null, fileName: '' });

  // HANDLER PROFIL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) {
      setProfileImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // HANDLER UPLOAD / GANTI FILE HELPER
  const handleFileUpload = (e, setFormState) => {
    const file = e.target.files[0];
    if (file) {
      setFormState(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
    }
  };

  const handleRemoveFileFromState = (setFormState) => {
    setFormState(prev => ({ ...prev, file: null, fileName: '' }));
  };

  // HANDLER HAPUS FILE DARI LIST DATA
  const handleRemoveFileFromList = (id, listState, setListState) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lampiran berkas ini?')) {
      setListState(listState.map(item => item.id === id ? { ...item, file: null, fileName: null } : item));
    }
  };

  // HANDLER GANTI FILE DI LIST DATA
  const handleReplaceFileList = (id, event, listState, setListState) => {
    const file = event.target.files[0];
    if (file) {
      setListState(listState.map(item => item.id === id ? { ...item, file: file, fileName: file.name } : item));
    }
  };

  // HANDLER TAMBAH DATA (Otomatis Masuk ke Pembina)
  const handleAddProker = (e) => {
    e.preventDefault();
    if (!newProker.nama) return;
    setProkerList([...prokerList, { id: Date.now(), ...newProker, status: 'Draft' }]);
    setNewProker({ nama: '', penanggungJawab: '', target: '', file: null, fileName: '' });
  };

  const handleAddProposal = (e) => {
    e.preventDefault();
    if (!newProposal.judul) return;
    setProposalList([...proposalList, {
      id: Date.now(),
      judul: newProposal.judul,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Menunggu Persetujuan',
      file: newProposal.file,
      fileName: newProposal.fileName
    }]);
    setNewProposal({ judul: '', file: null, fileName: '' });
  };

  const handleAddAnggota = (e) => {
    e.preventDefault();
    if (!newAnggota.nama) return;
    setAnggotaList([...anggotaList, { id: Date.now(), ...newAnggota }]);
    setNewAnggota({ nama: '', jabatan: '', sekbid: '' });
  };

  const handleAddLaporanKeg = (e) => {
    e.preventDefault();
    if (!newLaporanKeg.namaKegiatan) return;
    setLaporanKegList([...laporanKegList, { id: Date.now(), ...newLaporanKeg, status: 'Draft' }]);
    setNewLaporanKeg({ namaKegiatan: '', tanggal: '', penanggungJawab: '', file: null, fileName: '' });
  };

  const handleAddKeuangan = (e) => {
    e.preventDefault();
    if (!newKeuangan.keterangan || !newKeuangan.nominal) return;
    setKeuanganList([...keuanganList, { id: Date.now(), ...newKeuangan, nominal: Number(newKeuangan.nominal) }]);
    setNewKeuangan({ keterangan: '', jenis: 'Pemasukan', nominal: '', tanggal: '', file: null, fileName: '' });
  };

  const menuItems = ['Beranda', 'Pengajuan Proposal', 'Program Kerja', 'Anggota OSIS', 'Laporan Keg.', 'Laporan Keuangan'];

  const renderIcon = (name) => {
    const className = "w-5 h-5";
    switch (name) {
      case 'Beranda': return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
      case 'Pengajuan Proposal': return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
      case 'Program Kerja': return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
      case 'Anggota OSIS': return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      case 'Laporan Keg.': return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
      case 'Laporan Keuangan': return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans antialiased text-slate-800">
      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

      {/* SIDEBAR PENGURUS */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-5 shrink-0 min-h-screen shadow-lg">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2 pt-2">
            <img src={logoSrc} alt="Logo OSITARA" className="w-10 h-10 object-contain rounded" onError={() => setLogoSrc('/assets/LOGO OSITARA.png')} />
            <div>
              <h1 className="text-2xl font-black tracking-wide text-white leading-none">OSITARA</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFF5BF] opacity-90">Pengurus OSIS</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((name) => {
              const isActive = activeMenu === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveMenu(name)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    isActive ? 'bg-[#FFF5BF] text-[#2158B8] shadow-sm' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span className={isActive ? 'text-[#2158B8]' : 'text-white'}>{renderIcon(name)}</span>
                  <span>{name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button onClick={onLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-white/90 hover:text-white font-bold text-sm transition hover:bg-white/10 rounded-xl cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="flex items-center space-x-5 mb-8">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-16 h-16 bg-slate-200 border-2 border-slate-300 rounded-full flex items-center justify-center text-slate-400 shrink-0 hover:ring-4 hover:ring-[#86C5FF]/50 transition cursor-pointer overflow-hidden shadow-sm relative"
          >
            {profileImage ? (
              <img src={profileImage} alt="Avatar Profil" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )}
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2158B8]">Halo, {user?.name || user?.email || 'Pengurus OSIS'}!</h2>
            <p className="text-[#2158B8]/80 font-semibold text-sm mt-0.5">Kelola proposal, program kerja, dan kegiatan siswa di sini.</p>
          </div>
        </div>

        {/* BERANDA */}
        {activeMenu === 'Beranda' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Proposal Diajukan</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">{String(proposalList.length).padStart(2, '0')}</h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Proker Disetujui</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">{String(prokerList.filter(p => p.status === 'Disetujui').length).padStart(2, '0')}</h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#86C5FF]/20 text-[#2158B8] rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2158B8]">Laporan Kegiatan</p>
                  <h3 className="text-2xl font-bold text-[#2158B8] mt-0.5">{String(laporanKegList.length).padStart(2, '0')}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Pengajuan Proposal Terbaru</h3>
              {proposalList.length === 0 ? (
                <p className="text-sm text-slate-400 font-medium">Belum ada proposal yang diajukan.</p>
              ) : (
                proposalList.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-xl mb-3 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#2158B8]">{item.judul}</h4>
                      <p className="text-xs text-slate-500">{item.tanggal} • {item.fileName ? `Berkas: ${item.fileName}` : 'Tanpa Lampiran'}</p>
                    </div>
                    <span className="px-3 py-1 bg-[#FFF5BF] text-[#2158B8] font-bold text-xs rounded-lg border border-[#2158B8]/20">{item.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PENGAJUAN PROPOSAL */}
        {activeMenu === 'Pengajuan Proposal' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Form Pengajuan Proposal</h3>
              <form onSubmit={handleAddProposal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Judul Proposal</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan judul proposal..."
                    value={newProposal.judul}
                    onChange={(e) => setNewProposal({ ...newProposal, judul: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Lampiran File (PDF/DOC)</label>
                  {newProposal.fileName ? (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <span className="text-sm font-semibold text-[#2158B8] truncate flex-1">{newProposal.fileName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFileFromState(setNewProposal)}
                        className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        Hapus File
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, setNewProposal)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2158B8] file:text-white hover:file:bg-[#2158B8]/90"
                    />
                  )}
                </div>
                <button type="submit" className="px-5 py-2.5 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-[#2158B8]/90 transition cursor-pointer">
                  Kirim Proposal ke Pembina
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Daftar Proposal Diajukan</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-[#2158B8] font-bold">
                      <th className="py-3 px-2">No</th>
                      <th className="py-3 px-2">Judul Proposal</th>
                      <th className="py-3 px-2">Tanggal</th>
                      <th className="py-3 px-2">File Lampiran</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Aksi File</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {proposalList.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-3 px-2">{idx + 1}</td>
                        <td className="py-3 px-2 font-semibold">{item.judul}</td>
                        <td className="py-3 px-2 text-slate-500">{item.tanggal}</td>
                        <td className="py-3 px-2 text-slate-600">
                          {item.fileName ? <span className="text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-md">{item.fileName}</span> : <span className="text-xs text-slate-400 font-italic">Tidak ada file</span>}
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-3 py-1 bg-[#FFF5BF] text-[#2158B8] font-bold text-xs rounded-lg border border-[#2158B8]/20">{item.status}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <label className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                              {item.fileName ? 'Ganti' : '+ Tambah'}
                              <input type="file" onChange={(e) => handleReplaceFileList(item.id, e, proposalList, setProposalList)} className="hidden" />
                            </label>
                            {item.fileName && (
                              <button onClick={() => handleRemoveFileFromList(item.id, proposalList, setProposalList)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROGRAM KERJA */}
        {activeMenu === 'Program Kerja' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Tambah Program Kerja Baru</h3>
              <form onSubmit={handleAddProker} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Program Kerja</label>
                  <input type="text" required placeholder="Nama program..." value={newProker.nama} onChange={(e) => setNewProker({ ...newProker, nama: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Penanggung Jawab</label>
                  <input type="text" required placeholder="Nama PJ..." value={newProker.penanggungJawab} onChange={(e) => setNewProker({ ...newProker, penanggungJawab: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Target Pelaksanaan</label>
                  <input type="text" required placeholder="Contoh: Juni 2026" value={newProker.target} onChange={(e) => setNewProker({ ...newProker, target: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Lampiran Berkas Proker (Opsional)</label>
                  {newProker.fileName ? (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <span className="text-sm font-semibold text-[#2158B8] truncate flex-1">{newProker.fileName}</span>
                      <button type="button" onClick={() => handleRemoveFileFromState(setNewProker)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Hapus File</button>
                    </div>
                  ) : (
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, setNewProker)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2158B8] file:text-white" />
                  )}
                </div>
                <div className="md:col-span-3">
                  <button type="submit" className="px-5 py-2.5 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-[#2158B8]/90 transition cursor-pointer">Tambah Program Kerja</button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Daftar Program Kerja</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-[#2158B8] font-bold">
                      <th className="py-3 px-2">No</th>
                      <th className="py-3 px-2">Nama Program</th>
                      <th className="py-3 px-2">PJ</th>
                      <th className="py-3 px-2">Target</th>
                      <th className="py-3 px-2">Lampiran File</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Aksi File</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {prokerList.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-3 px-2">{idx + 1}</td>
                        <td className="py-3 px-2 font-semibold">{item.nama}</td>
                        <td className="py-3 px-2">{item.penanggungJawab}</td>
                        <td className="py-3 px-2 text-slate-500">{item.target}</td>
                        <td className="py-3 px-2">{item.fileName ? <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md">{item.fileName}</span> : <span className="text-xs text-slate-400">Tanpa Berkas</span>}</td>
                        <td className="py-3 px-2">
                          <span className={`px-3 py-1 font-bold text-xs rounded-lg border ${item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>{item.status}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <label className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                              {item.fileName ? 'Ganti' : '+ Tambah'}
                              <input type="file" onChange={(e) => handleReplaceFileList(item.id, e, prokerList, setProkerList)} className="hidden" />
                            </label>
                            {item.fileName && (
                              <button onClick={() => handleRemoveFileFromList(item.id, prokerList, setProkerList)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Hapus</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANGGOTA OSIS */}
        {activeMenu === 'Anggota OSIS' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Tambah Anggota OSIS</h3>
              <form onSubmit={handleAddAnggota} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Lengkap</label>
                  <input type="text" required placeholder="Nama anggota..." value={newAnggota.nama} onChange={(e) => setNewAnggota({ ...newAnggota, nama: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Jabatan</label>
                  <input type="text" required placeholder="Jabatan..." value={newAnggota.jabatan} onChange={(e) => setNewAnggota({ ...newAnggota, jabatan: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Sekbid / Divisi</label>
                  <input type="text" required placeholder="Seksi bidang..." value={newAnggota.sekbid} onChange={(e) => setNewAnggota({ ...newAnggota, sekbid: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm" />
                </div>
                <div className="md:col-span-3">
                  <button type="submit" className="px-5 py-2.5 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-[#2158B8]/90 transition cursor-pointer">Simpan Anggota</button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Daftar Anggota OSIS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-[#2158B8] font-bold">
                      <th className="py-3 px-2">No</th>
                      <th className="py-3 px-2">Nama</th>
                      <th className="py-3 px-2">Jabatan</th>
                      <th className="py-3 px-2">Sekbid</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {anggotaList.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-3 px-2">{idx + 1}</td>
                        <td className="py-3 px-2 font-semibold">{item.nama}</td>
                        <td className="py-3 px-2 text-slate-600">{item.jabatan}</td>
                        <td className="py-3 px-2 text-slate-500">{item.sekbid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LAPORAN KEGIATAN */}
        {activeMenu === 'Laporan Keg.' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Buat Laporan Kegiatan</h3>
              <form onSubmit={handleAddLaporanKeg} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Kegiatan</label>
                  <input type="text" required placeholder="Nama kegiatan..." value={newLaporanKeg.namaKegiatan} onChange={(e) => setNewLaporanKeg({ ...newLaporanKeg, namaKegiatan: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Tanggal Pelaksanaan</label>
                  <input type="date" required value={newLaporanKeg.tanggal} onChange={(e) => setNewLaporanKeg({ ...newLaporanKeg, tanggal: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Penanggung Jawab</label>
                  <input type="text" required placeholder="Nama PJ..." value={newLaporanKeg.penanggungJawab} onChange={(e) => setNewLaporanKeg({ ...newLaporanKeg, penanggungJawab: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 text-sm" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Lampiran Dokumen LPJ</label>
                  {newLaporanKeg.fileName ? (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <span className="text-sm font-semibold text-[#2158B8] truncate flex-1">{newLaporanKeg.fileName}</span>
                      <button type="button" onClick={() => handleRemoveFileFromState(setNewLaporanKeg)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Hapus File</button>
                    </div>
                  ) : (
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, setNewLaporanKeg)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2158B8] file:text-white" />
                  )}
                </div>
                <div className="md:col-span-3">
                  <button type="submit" className="px-5 py-2.5 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-[#2158B8]/90 transition cursor-pointer">Simpan Laporan Kegiatan</button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Daftar Laporan Kegiatan</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-[#2158B8] font-bold">
                      <th className="py-3 px-2">No</th>
                      <th className="py-3 px-2">Nama Kegiatan</th>
                      <th className="py-3 px-2">Tanggal</th>
                      <th className="py-3 px-2">PJ</th>
                      <th className="py-3 px-2">Berkas LPJ</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Aksi File</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {laporanKegList.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-3 px-2">{idx + 1}</td>
                        <td className="py-3 px-2 font-semibold">{item.namaKegiatan}</td>
                        <td className="py-3 px-2 text-slate-500">{item.tanggal}</td>
                        <td className="py-3 px-2">{item.penanggungJawab}</td>
                        <td className="py-3 px-2">{item.fileName ? <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md">{item.fileName}</span> : <span className="text-xs text-slate-400">Tanpa File</span>}</td>
                        <td className="py-3 px-2">
                          <span className={`px-3 py-1 font-bold text-xs rounded-lg border ${item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>{item.status}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <label className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                              {item.fileName ? 'Ganti' : '+ Tambah'}
                              <input type="file" onChange={(e) => handleReplaceFileList(item.id, e, laporanKegList, setLaporanKegList)} className="hidden" />
                            </label>
                            {item.fileName && (
                              <button onClick={() => handleRemoveFileFromList(item.id, laporanKegList, setLaporanKegList)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Hapus</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LAPORAN KEUANGAN */}
        {activeMenu === 'Laporan Keuangan' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Catat Transaksi Keuangan</h3>
              <form onSubmit={handleAddKeuangan} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Keterangan Transaksi</label>
                  <input type="text" required placeholder="Contoh: Kas OSIS..." value={newKeuangan.keterangan} onChange={(e) => setNewKeuangan({ ...newKeuangan, keterangan: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Jenis</label>
                  <select value={newKeuangan.jenis} onChange={(e) => setNewKeuangan({ ...newKeuangan, jenis: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 text-sm bg-white">
                    <option value="Pemasukan">Pemasukan</option>
                    <option value="Pengeluaran">Pengeluaran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Nominal (Rp)</label>
                  <input type="number" required placeholder="0" value={newKeuangan.nominal} onChange={(e) => setNewKeuangan({ ...newKeuangan, nominal: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Tanggal</label>
                  <input type="date" required value={newKeuangan.tanggal} onChange={(e) => setNewKeuangan({ ...newKeuangan, tanggal: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-[#86C5FF]/60 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Bukti Nota / Struk File</label>
                  {newKeuangan.fileName ? (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <span className="text-sm font-semibold text-[#2158B8] truncate flex-1">{newKeuangan.fileName}</span>
                      <button type="button" onClick={() => handleRemoveFileFromState(setNewKeuangan)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Hapus File</button>
                    </div>
                  ) : (
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setNewKeuangan)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2158B8] file:text-white" />
                  )}
                </div>
                <div className="md:col-span-4">
                  <button type="submit" className="w-full py-2.5 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-[#2158B8]/90 transition cursor-pointer">Tambah Catatan Keuangan</button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Catatan Keuangan OSIS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-[#2158B8] font-bold">
                      <th className="py-3 px-2">No</th>
                      <th className="py-3 px-2">Keterangan</th>
                      <th className="py-3 px-2">Jenis</th>
                      <th className="py-3 px-2">Tanggal</th>
                      <th className="py-3 px-2 text-right">Nominal</th>
                      <th className="py-3 px-2 text-right">Aksi Bukti Nota</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {keuanganList.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-3 px-2">{idx + 1}</td>
                        <td className="py-3 px-2 font-semibold">{item.keterangan}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${item.jenis === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{item.jenis}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-500">{item.tanggal}</td>
                        <td className={`py-3 px-2 text-right font-bold ${item.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.jenis === 'Pemasukan' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <label className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                              {item.fileName ? 'Ganti' : '+ Tambah'}
                              <input type="file" onChange={(e) => handleReplaceFileList(item.id, e, keuanganList, setKeuanganList)} className="hidden" />
                            </label>
                            {item.fileName && (
                              <button onClick={() => handleRemoveFileFromList(item.id, keuanganList, setKeuanganList)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Hapus</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PROFIL */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative text-center">
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="relative group">
                  <div onClick={handleAvatarClick} className="w-20 h-20 bg-slate-300 rounded-full flex items-center justify-center text-slate-500 shrink-0 overflow-hidden shadow-inner cursor-pointer hover:opacity-90 transition border-2 border-[#2158B8]">
                    {profileImage ? (
                      <img src={profileImage} alt="Foto Profil" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-slate-500 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                    )}
                  </div>
                  <button type="button" onClick={handleAvatarClick} className="absolute bottom-0 right-0 bg-[#2158B8] text-white p-1.5 rounded-full shadow-md hover:bg-blue-700 transition cursor-pointer border-2 border-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>

                <div className="text-left">
                  <h3 className="text-2xl font-extrabold text-[#2158B8]">{user?.name || user?.email || 'Pengurus OSIS'}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <button onClick={handleAvatarClick} className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer">
                      {profileImage ? 'Ubah Foto' : '+ Tambah Foto'}
                    </button>
                    {profileImage && (
                      <>
                        <span className="text-slate-300 text-xs">•</span>
                        <button onClick={handleRemoveImage} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Hapus Foto</button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {['Data Pribadi', 'Informasi', 'Pengaturan'].map((item) => (
                  <div key={item} className="bg-white rounded-2xl p-4 border border-[#86C5FF]/50 shadow-sm flex items-center justify-between transition hover:border-[#2158B8]">
                    <span className="font-bold text-[#2158B8] text-sm">{item}</span>
                    <button onClick={() => alert(`Membuka ${item}`)} className="w-9 h-8 bg-[#D9E9FF]/60 hover:bg-[#2158B8] text-[#2158B8] hover:text-white rounded-lg flex items-center justify-center transition font-bold text-sm cursor-pointer">&gt;</button>
                  </div>
                ))}
              </div>

              <button onClick={() => { setIsProfileModalOpen(false); onLogout(); }} className="text-slate-400 hover:text-red-500 font-bold text-xs tracking-wider uppercase transition cursor-pointer">Logout</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
