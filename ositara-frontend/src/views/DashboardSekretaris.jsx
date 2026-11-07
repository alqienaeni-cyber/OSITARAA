import React, { useState, useEffect, useCallback } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

//--- KONFIGURASI API BACKEND
const API_BASE = 'http://127.0.0.1:8000/api';

//--- DEKLARASI IKON SVG---
const SvgHome = () => <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const SvgProposal = () => <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const SvgKegiatan = () => <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const SvgProker = () => <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9z"/></svg>;
const SvgAnggota = () => <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
const SvgKeuangan = () => <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>;
const SvgLogout = () => <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const SvgEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
const SvgTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const SvgSend = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>;
const SvgUsersGroup = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>;
const SvgDownload = () => <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>;
const SvgCalendarSmall = () => <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;

const getInitialData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
};

const filterOnlyKegiatanSekre = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => String(item.is_event) === '1' || String(item.sekbid || item.divisi || '').toLowerCase().trim() === 'sekretaris');
};

const filterOnlyProkerKetua = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => String(item.is_event) !== '1' && String(item.sekbid || item.divisi || '').toLowerCase().trim() !== 'sekretaris');
};

export default function DashboardSekretaris({
  user,
  onLogout,
  initialKegiatan = [],
  initialPendaftaran = [],
  onTambahKegiatan,
  initialProposal = [],
  onTambahProposal,
  initialProker = [],
  initialAnggota = [],
  initialKeuangan = []
}) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [kegiatanList, setKegiatanList] = useState(() => {
    const raw = getInitialData('ositara_kegiatan', initialKegiatan);
    return filterOnlyKegiatanSekre(raw);
  });

  const [proposalList, setProposalList] = useState(() => getInitialData('ositara_proposal', initialProposal));
  const [keuanganList] = useState(() => getInitialData('ositara_keuangan', initialKeuangan));

  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const primary = getInitialData('ositara_pendaftaran', null);
    const secondary = getInitialData('pendaftaranList', initialPendaftaran);
    return primary || secondary || [];
  });

  const [prokerList, setProkerList] = useState(() => {
    const raw = getInitialData('ositara_proker', initialProker);
    return filterOnlyProkerKetua(raw);
  });

  const [anggotaList] = useState(() => getInitialData('ositara_anggota', initialAnggota));
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_user_avatar') || null);
  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const namaDisplay = user?.namaLengkap || user?.nama || user?.name || user?.username || 'Salfa Alena Eka Putri';
  const inisialNama = namaDisplay.charAt(0).toUpperCase();

  //--- SINKRONISASI PROPOSAL DARI MYSQL BACKEND
  const fetchProposalsFromBackend = useCallback(async () => {
    try {
      let res = await fetch(`${API_BASE}/proposals`, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/proposal-kegiatan`, { headers: { Accept: 'application/json' } });
      }
      if (res.ok) {
        const result = await res.json();
        const dataArr = Array.isArray(result) ? result : (result.data || []);
        if (dataArr.length > 0) {
          const formatted = dataArr.map((p) => ({
            id: p.id,
            judul_proposal: p.judul_proposal || p.judul || 'Tanpa Judul',
            judul: p.judul_proposal || p.judul || 'Tanpa Judul',
            kategori: p.kategori || 'Kegiatan',
            anggaran: Number(p.anggaran) || 0,
            file: p.file_proposal || p.file || 'Dokumen.pdf',
            fileData: p.file_url || p.fileData || p.file_proposal || null,
            tanggal: p.tanggal_pengajuan || p.tanggal || new Date().toLocaleDateString("id-ID"),
            status: p.status || 'Menunggu Persetujuan',
            catatan_revisi: p.catatan_pembina || p.catatan_revisi || '-'
          }));
          setProposalList(formatted);
          localStorage.setItem('ositara_proposal', JSON.stringify(formatted));
        }
      }
    } catch (err) {
      console.error("Gagal fetch proposal dari MySQL:", err);
    }
  }, []);

  useEffect(() => {
    fetchProposalsFromBackend();
    window.addEventListener('storage', fetchProposalsFromBackend);
    return () => window.removeEventListener('storage', fetchProposalsFromBackend);
  }, [fetchProposalsFromBackend]);

  const syncProkerFromKetua = useCallback(() => {
    const rawProker = getInitialData('ositara_proker', initialProker);
    setProkerList(filterOnlyProkerKetua(rawProker));
  }, [initialProker]);

  useEffect(() => {
    syncProkerFromKetua();
    window.addEventListener('storage', syncProkerFromKetua);
    return () => window.removeEventListener('storage', syncProkerFromKetua);
  }, [syncProkerFromKetua]);

  //--- SINKRONISASI PENDAFTARAN
  const syncPendaftaran = useCallback(async () => {
    try {
      let res = await fetch(`${API_BASE}/pendaftaran-event`, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/pendaftaran`, { headers: { Accept: 'application/json' } });
      }
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.data || []);
        if (arr.length > 0) {
          const formatted = arr.map(p => ({
            id: p.id,
            kegiatanId: p.kegiatan_id || p.kegiatanId || p.event_id,
            namaKegiatan: p.nama_kegiatan || p.namaKegiatan || p.nama_event || p.nama_proker || p.nama || 'Kegiatan OSIS',
            namaSiswa: p.nama_siswa || p.namaSiswa || p.nama,
            nama: p.nama_siswa || p.namaSiswa || p.nama,
            nis: p.nis || p.nisn || '',
            kelas: p.kelas || '',
            catatan: p.catatan || '',
            tanggalDaftar: p.tanggal_daftar || p.tanggalDaftar || '',
            status: p.status || 'Terdaftar'
          }));
          setPendaftaranList(formatted);
          localStorage.setItem('ositara_pendaftaran', JSON.stringify(formatted));
          localStorage.setItem('pendaftaranList', JSON.stringify(formatted));
        }
      }
    } catch (e) {
      console.error("Gagal sync pendaftaran dari API MySQL:", e);
    }
  }, []);

  useEffect(() => {
    syncPendaftaran();
    window.addEventListener('storage', syncPendaftaran);
    return () => window.removeEventListener('storage', syncPendaftaran);
  }, [syncPendaftaran]);

  useEffect(() => {
    const filteredKegiatan = filterOnlyKegiatanSekre(kegiatanList);
    localStorage.setItem('ositara_kegiatan', JSON.stringify(filteredKegiatan));
  }, [kegiatanList]);

  useEffect(() => {
    localStorage.setItem('ositara_proposal', JSON.stringify(proposalList));
  }, [proposalList]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size >= 2 * 1024 * 1024) {
        alert("Ukuran foto terlalu besar! Maksimal 2MB.");
        return;
      }
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
    if (window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) {
      setAvatarUrl(null);
      localStorage.removeItem('ositara_user_avatar');
      setShowAvatarModal(false);
    }
  };

  //--- HANDLER PROPOSAL
  const [editingProposalId, setEditingProposalId] = useState(null);
  const [judulProposal, setJudulProposal] = useState('');
  const [kategoriProposal, setKategoriProposal] = useState('Kegiatan');
  const [anggaranProposal, setAnggaranProposal] = useState('');
  const [fileProposal, setFileProposal] = useState(null);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!judulProposal.trim() || !anggaranProposal) {
      return alert("Judul dan Anggaran wajib diisi!");
    }

    const formData = new FormData();
    formData.append('judul_proposal', judulProposal.trim());
    formData.append('judul', judulProposal.trim());
    formData.append('kategori', kategoriProposal || 'Kegiatan');
    formData.append('anggaran', Number(anggaranProposal));
    formData.append('pengaju', 'Sekretaris OSIS');
    formData.append('status', 'Menunggu Persetujuan');
    formData.append('deskripsi', 'Proposal diajukan oleh Sekretaris OSIS');

    if (fileProposal) {
      formData.append('file_proposal', fileProposal);
      formData.append('file', fileProposal.name);
    }

    try {
      let url = editingProposalId ? `${API_BASE}/proposals/${editingProposalId}` : `${API_BASE}/proposals`;
      if (editingProposalId) {
        formData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });

      if (response.ok) {
        alert(editingProposalId ? 'Proposal berhasil diperbarui!' : 'Proposal baru berhasil diajukan!');
        fetchProposalsFromBackend();
      } else {
        const fallbackRes = await fetch(`${API_BASE}/proposal-kegiatan`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });
        if (fallbackRes.ok) {
          alert('Proposal baru berhasil diajukan!');
          fetchProposalsFromBackend();
        } else {
          alert('Gagal menyimpan data ke database.');
        }
      }
    } catch (err) {
      console.error("Gagal mengirim proposal:", err);
      alert("Terjadi kesalahan saat mengirim proposal.");
    }

    setEditingProposalId(null);
    setJudulProposal('');
    setAnggaranProposal('');
    setFileProposal(null);
  };

  const handleHapusProposal = async (id) => {
    if (window.confirm('Hapus proposal ini?')) {
      const updated = proposalList.filter((p) => p.id !== id);
      setProposalList(updated);
      localStorage.setItem('ositara_proposal', JSON.stringify(updated));
      try {
        await fetch(`${API_BASE}/proposals/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' }
        });
      } catch (err) {
        console.error("Gagal menghapus proposal dari MySQL", err);
      }
    }
  };

  //--- HANDLER KELOLA KEGIATAN
  const [showTambahKegiatanForm, setShowTambahKegiatanForm] = useState(false);
  const [editingKegiatanId, setEditingKegiatanId] = useState(null);
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [tanggalKegiatan, setTanggalKegiatan] = useState('');
  const [statusKegiatan, setStatusKegiatan] = useState('Mendatang');
  const [deskripsiKegiatan, setDeskripsiKegiatan] = useState('');

  const handleSubmitKegiatan = async (e) => {
    e.preventDefault();
    if (!namaKegiatan.trim() || !tanggalKegiatan) {
      alert("Nama dan Tanggal kegiatan wajib diisi!");
      return;
    }

    const payload = {
      nama_proker: namaKegiatan.trim(),
      nama_kegiatan: namaKegiatan.trim(),
      sekbid: 'Sekretaris',
      target: tanggalKegiatan,
      deskripsi: deskripsiKegiatan || 'Tidak ada deskripsi',
      status: statusKegiatan,
      is_event: 1
    };

    if (editingKegiatanId) {
      setKegiatanList((prev) =>
        prev.map((k) =>
          k.id === editingKegiatanId
            ? {
                ...k,
                nama_proker: namaKegiatan.trim(),
                namaKegiatan: namaKegiatan.trim(),
                nama: namaKegiatan.trim(),
                target: tanggalKegiatan,
                tanggal: tanggalKegiatan,
                deskripsi: deskripsiKegiatan,
                status: statusKegiatan,
                sekbid: 'Sekretaris',
                is_event: 1
              }
            : k
        )
      );

      try {
        await fetch(`${API_BASE}/program-kerja/${editingKegiatanId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Gagal memperbarui kegiatan ke MySQL", err);
      }
      setEditingKegiatanId(null);
      alert('Kegiatan berhasil diperbarui!');
    } else {
      try {
        const response = await fetch(`${API_BASE}/program-kerja`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        const savedData = result.data || result;
        const kBaru = {
          id: savedData.id || Date.now(),
          nama_proker: namaKegiatan.trim(),
          namaKegiatan: namaKegiatan.trim(),
          nama: namaKegiatan.trim(),
          target: tanggalKegiatan,
          tanggal: tanggalKegiatan,
          deskripsi: deskripsiKegiatan,
          status: statusKegiatan,
          sekbid: 'Sekretaris',
          is_event: 1
        };
        setKegiatanList((prev) => [kBaru, ...prev]);
        if (typeof onTambahKegiatan === 'function') onTambahKegiatan(kBaru);
        alert("Kegiatan baru berhasil ditambahkan!");
      } catch (err) {
        console.error("Gagal menyimpan kegiatan ke MySQL", err);
        alert('Gagal menyimpan kegiatan ke database.');
      }
    }

    setNamaKegiatan('');
    setTanggalKegiatan('');
    setStatusKegiatan('Mendatang');
    setDeskripsiKegiatan('');
    setShowTambahKegiatanForm(false);
  };

  const handleHapusKegiatan = async (id) => {
    if (window.confirm("Hapus kegiatan ini?")) {
      setKegiatanList((prev) => prev.filter((k) => k.id !== id));
      try {
        await fetch(`${API_BASE}/program-kerja/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' }
        });
      } catch (err) {
        console.error("Gagal menghapus kegiatan dari MySQL", err);
      }
    }
  };

  const getPesertaByKegiatan = (keg) => {
    if (!keg) return [];
    const targetId = String(keg.id);
    const targetName = (keg.nama_proker || keg.namaKegiatan || keg.nama || '').toLowerCase().trim();
    return pendaftaranList.filter((p) => {
      const pId = String(p.kegiatanId || p.kegiatan_id || '');
      const pName = (p.namaKegiatan || p.nama_kegiatan || p.nama_event || p.nama || '').toLowerCase().trim();
      return (pId && pId === targetId) || (pName && pName === targetName);
    });
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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F4F7] font-sans text-slate-800 w-full overflow-x-hidden">

      {/* HEADER NAVBAR MOBILE */}
      <div className="md:hidden bg-[#2158B8] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md w-full">
        <div className="flex items-center space-x-2.5">
          <img
            src={logoOsitara}
            alt="Logo"
            className="w-8 h-8 object-contain animate-bounce cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <div>
            <h1 className="text-base font-black tracking-wider leading-none">OSITARA</h1>
            <p className="text-[9px] text-blue-200 font-bold tracking-wide uppercase mt-0.5">SEKRETARIS OSIS</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 h-screen w-64 bg-[#2158B8] text-white flex justify-between p-6 shrink-0 shadow-2xl flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="hidden md:flex items-center space-x-3 mb-8">
            <div className="relative group cursor-pointer">
              <img
                src={logoOsitara}
                alt="Logo OSITARA"
                className="w-10 h-10 object-contain animate-bounce hover:scale-110 transition-transform duration-300 drop-shadow-md"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-blue-200 font-bold tracking-wide mt-1 uppercase">SEKRETARIS OSIS</p>
            </div>
          </div>

          <nav className="space-y-1.5 mt-4 md:mt-0">
            {menuList.map((menu) => {
              const IconComp = menu.IconComponent;
              const isActive = activeMenu === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    setActiveMenu(menu.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFF3BF] text-[#2158B8] shadow-md hover:shadow-lg'
                      : 'hover:bg-white/10 text-white hover:shadow-sm'
                  }`}
                >
                  <IconComp />
                  <span className="truncate">{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="group flex items-center space-x-3 px-4 py-3 text-white hover:bg-rose-600/80 rounded-2xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm hover:shadow-md mt-6"
        >
          <SvgLogout />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-x-hidden min-w-0 w-full">

        {/* HEADER PROFIL SEKRETARIS */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg border bg-white border-slate-200/80 transition-all duration-300">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 w-full">
            <div
              onClick={() => setShowAvatarModal(true)}
              className="relative group cursor-pointer shrink-0"
              title="Atur Foto Profil"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profil"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-[#2158B8] border-2 border-white shadow-md font-black text-lg sm:text-xl group-hover:scale-105 transition-transform duration-300">
                  {inisialNama}
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                Ubah
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-2xl font-black text-[#2158B8] leading-tight break-words">
                Halo, {namaDisplay}!
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-snug">
                Jabatan: <span className="font-bold text-[#2158B8]">Sekretaris OSIS</span>
              </p>
            </div>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Total Kegiatan</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{kegiatanList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-[#2158B8] rounded-2xl flex items-center justify-center shrink-0 ml-2 shadow-inner">
                  <SvgKegiatan />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Total Anggota</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{anggotaList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 text-amber-600 ml-2 shadow-inner">
                  <SvgAnggota />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Proposal Diajukan</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{proposalList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 ml-2 shadow-inner">
                  <SvgProposal />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Pendaftar Siswa</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{pendaftaranList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 ml-2 shadow-inner">
                  <SvgUsersGroup />
                </div>
              </div>

            </div>

            {/* RINGKASAN AKTIVITAS TERBARU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#2158B8]">Agenda Kegiatan Terbaru</h3>
                  <button
                    onClick={() => setActiveMenu('kelola-kegiatan')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 hover:underline transition-colors duration-200 cursor-pointer"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {kegiatanList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Belum ada agenda kegiatan.</p>
                  ) : (
                    kegiatanList.slice(0, 4).map((k) => (
                      <div key={k.id} className="p-3 sm:p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{k.nama_proker || k.namaKegiatan || k.nama}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{k.target || k.tanggal}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full shrink-0 ${k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#2158B8]'}`}>
                          {k.status || 'Mendatang'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#2158B8]">Status Pengajuan Proposal</h3>
                  <button
                    onClick={() => setActiveMenu('pengajuan-proposal')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 hover:underline transition-colors duration-200 cursor-pointer"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {proposalList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Belum ada proposal diajukan.</p>
                  ) : (
                    proposalList.slice(0, 4).map((p) => (
                      <div key={p.id} className="p-3 sm:p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{p.judul_proposal || p.judul}</p>
                          <p className="text-[11px] text-slate-500 font-medium">Rp {p.anggaran?.toLocaleString('id-ID')}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full shrink-0 ${
                          p.status === 'Disetujui' || p.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {p.status}
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
        {activeMenu === 'pengajuan-proposal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.3s_ease-out]">

            <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto w-full">
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Pengajuan Proposal</h3>
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
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
                    const fileDisplayName = p.file || p.fileName || p.file_proposal || 'Dokumen.pdf';
                    const fileUrlTarget = p.fileData || p.file_url || p.fileUrl || '#';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-700">{p.judul_proposal || p.judul || '-'}</td>
                        <td className="p-3 text-slate-600 font-medium">Rp {p.anggaran?.toLocaleString('id-ID')}</td>
                        <td className="p-3">
                          {fileDisplayName && fileDisplayName !== 'Tidak ada berkas' ? (
                            <a
                              href={fileUrlTarget}
                              download={fileDisplayName}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-[#2158B8] hover:bg-blue-100 font-medium text-xs rounded-xl border border-blue-200 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-xs"
                              title="Unduh Berkas PDF"
                            >
                              <SvgDownload />
                              <span className="truncate max-w-[120px]">{fileDisplayName}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Tidak ada berkas</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 font-bold text-[10px] sm:text-xs rounded-full inline-block ${
                            p.status === 'Diterima' || p.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' :
                            p.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-xs">{p.catatan_revisi || p.catatan_pembina || '-'}</td>
                        <td className="p-3 text-center space-x-1 whitespace-nowrap">
                          {isRevisi && (
                            <button
                              title="Kirim Ulang Revisi"
                              onClick={() => {
                                setEditingProposalId(p.id);
                                setJudulProposal(p.judul_proposal || p.judul);
                                setKategoriProposal(p.kategori || 'Kegiatan');
                                setAnggaranProposal(p.anggaran);
                              }}
                              className="p-1.5 sm:p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
                            >
                              <SvgSend />
                            </button>
                          )}
                          <button
                            title="Edit Proposal"
                            onClick={() => {
                              setEditingProposalId(p.id);
                              setKategoriProposal(p.kategori || 'Kegiatan');
                              setJudulProposal(p.judul_proposal || p.judul);
                              setAnggaranProposal(p.anggaran);
                            }}
                            className="p-1.5 sm:p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
                          >
                            <SvgEdit />
                          </button>
                          <button
                            title="Hapus Proposal"
                            onClick={() => handleHapusProposal(p.id)}
                            className="p-1.5 sm:p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
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

            {/* FORM FORMULIR PROPOSAL */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">
                {editingProposalId ? 'Revisi/Edit Proposal' : 'Ajukan Proposal Baru'}
              </h3>
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Judul Proposal</label>
                  <input
                    type="text"
                    required
                    value={judulProposal}
                    onChange={(e) => setJudulProposal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Estimasi Anggaran (Rp)</label>
                  <input
                    type="number"
                    required
                    value={anggaranProposal}
                    onChange={(e) => setAnggaranProposal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Unggah Berkas PDF (Maks 2MB)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFileProposal(e.target.files?.[0])}
                    className="w-full text-xs text-slate-500 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#2158B8] hover:file:bg-blue-100 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFB800] hover:bg-[#e0a200] text-slate-900 font-bold text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg hover:shadow-amber-400/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer mt-4"
                >
                  <SvgSend />
                  <span>{editingProposalId ? 'Kirim Ulang Revisi' : 'Kirim Proposal'}</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* 3. PROGRAM KERJA (READ ONLY) */}
        {activeMenu === 'program-kerja' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Program Kerja OSIS (Rekap dari Ketua)</h3>
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b text-[#2158B8] font-bold bg-slate-50">
                  <th className="p-3.5">Program Kerja</th>
                  <th className="p-3.5">Divisi</th>
                  <th className="p-3.5">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prokerList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-400">Belum ada data program kerja dari Ketua.</td>
                  </tr>
                ) : (
                  prokerList.map((pk) => (
                    <tr key={pk.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-700">{pk.nama_proker || pk.nama}</td>
                      <td className="p-3.5 text-[#2158B8]">{pk.divisi || pk.sekbid}</td>
                      <td className="p-3.5 text-slate-500">{pk.target || pk.tanggal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. ANGGOTA OSIS */}
        {activeMenu === 'anggota-osis' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Anggota OSIS (Read Only)</h3>
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b text-[#2158B8] font-bold bg-slate-50">
                  <th className="p-3.5">NIS</th>
                  <th className="p-3.5">Nama Anggota</th>
                  <th className="p-3.5">Jabatan</th>
                  <th className="p-3.5">Divisi/Sekbid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anggotaList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">Belum ada data anggota.</td>
                  </tr>
                ) : (
                  anggotaList.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
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
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8]">Kelola Kegiatan</h3>
              <button
                onClick={() => {
                  setEditingKegiatanId(null);
                  setNamaKegiatan('');
                  setTanggalKegiatan('');
                  setStatusKegiatan('Mendatang');
                  setDeskripsiKegiatan('');
                  setShowTambahKegiatanForm(true);
                }}
                className="px-4 py-2 bg-[#2158B8] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                + Tambah Kegiatan
              </button>
            </div>

            {showTambahKegiatanForm && (
              <form onSubmit={handleSubmitKegiatan} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-md space-y-4 transition-all duration-300 animate-[scaleIn_0.2s_ease-out]">
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Nama Kegiatan</label>
                  <input
                    type="text"
                    required
                    value={namaKegiatan}
                    onChange={(e) => setNamaKegiatan(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggalKegiatan}
                    onChange={(e) => setTanggalKegiatan(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Status Kegiatan</label>
                  <select
                    value={statusKegiatan}
                    onChange={(e) => setStatusKegiatan(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <option value="Mendatang">Mendatang</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2158B8] mb-1">Deskripsi</label>
                  <textarea
                    value={deskripsiKegiatan}
                    onChange={(e) => setDeskripsiKegiatan(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all"
                    rows="2"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFB800] hover:bg-[#e0af00] text-slate-900 font-bold rounded-xl text-xs shadow-md hover:shadow-lg hover:shadow-amber-400/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  Simpan Kegiatan
                </button>
              </form>
            )}

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto w-full">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b text-[#2158B8] font-bold bg-slate-50">
                    <th className="p-3.5">Nama Kegiatan</th>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kegiatanList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400">Belum ada data kegiatan.</td>
                    </tr>
                  ) : (
                    kegiatanList.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{k.nama_proker || k.namaKegiatan || k.nama}</td>
                        <td className="p-3.5 text-slate-600">{k.target || k.tanggal || '-'}</td>
                        <td className="p-3.5">
                          <span className={`px-3 py-1 font-bold text-[10px] sm:text-xs rounded-full inline-block ${k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#2158B8]'}`}>
                            {k.status || 'Mendatang'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center space-x-2 whitespace-nowrap">
                          <button
                            title="Edit Kegiatan"
                            onClick={() => {
                              setEditingKegiatanId(k.id);
                              setNamaKegiatan(k.nama_proker || k.namaKegiatan || k.nama);
                              setTanggalKegiatan(k.target || k.tanggal);
                              setStatusKegiatan(k.status || 'Mendatang');
                              setDeskripsiKegiatan(k.deskripsi || '');
                              setShowTambahKegiatanForm(true);
                            }}
                            className="p-1.5 sm:p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
                          >
                            <SvgEdit />
                          </button>
                          <button
                            title="Hapus Kegiatan"
                            onClick={() => handleHapusKegiatan(k.id)}
                            className="p-1.5 sm:p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
                          >
                            <SvgTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. MENU KEGIATAN (KARTU PESERTA) */}
        {activeMenu === 'kegiatan' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Agenda Kegiatan OSIS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {kegiatanList.map((k) => {
                const pesertaKegiatan = getPesertaByKegiatan(k);
                return (
                  <div key={k.id} className="p-4 sm:p-5 border border-blue-100 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 space-y-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div>
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <h4 className="font-bold text-[#2158B8] text-base sm:text-lg truncate">{k.nama_proker || k.namaKegiatan || k.nama}</h4>
                        <span className={`px-2.5 py-0.5 font-bold text-[10px] sm:text-xs rounded-full shrink-0 ${k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#2158B8]'}`}>
                          {k.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2 flex items-center space-x-1">
                        <SvgCalendarSmall />
                        <span>Tanggal: {k.target || k.tanggal}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">{k.deskripsi || 'Tidak ada deskripsi.'}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">{pesertaKegiatan.length} Peserta Terdaftar</span>
                      <button
                        title="Lihat Peserta"
                        onClick={() => setSelectedKegiatanPeserta(k)}
                        className="p-2 bg-[#2158B8] hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm flex items-center space-x-1 cursor-pointer"
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
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Laporan Keuangan OSIS (Read Only)</h3>
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b text-[#2158B8] font-bold bg-slate-50">
                  <th className="p-3.5">Keterangan</th>
                  <th className="p-3.5">Jenis</th>
                  <th className="p-3.5">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keuanganList.map((kq) => (
                  <tr key={kq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-700 font-medium">{kq.keterangan}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${kq.jenis === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {kq.jenis}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">Rp {kq.jumlah?.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* MODAL PESERTA KEGIATAN */}
      {selectedKegiatanPeserta && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-4 border border-blue-100 transform transition-all duration-300 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base sm:text-lg font-bold text-[#2158B8] truncate pr-2">
                Peserta: {selectedKegiatanPeserta.nama_proker || selectedKegiatanPeserta.namaKegiatan || selectedKegiatanPeserta.nama}
              </h3>
              <button
                onClick={() => setSelectedKegiatanPeserta(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {getPesertaByKegiatan(selectedKegiatanPeserta).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada peserta terdaftar.</p>
              ) : (
                getPesertaByKegiatan(selectedKegiatanPeserta).map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs border border-slate-100 flex justify-between items-center transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{p.namaSiswa || p.nama}</p>
                      <p className="text-slate-500">{p.kelas} | {p.nis || p.nisn || '-'}</p>
                    </div>
                    <span className="text-slate-400 text-[10px]">{p.tanggalDaftar || ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOTO PROFIL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border border-blue-100 transform transition-all duration-300 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base sm:text-lg font-bold text-[#2158B8]">Atur Foto Profil</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 pt-2">
              <label
                htmlFor="avatar-input"
                className="w-full py-3 bg-[#2158B8] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                Ganti/Unggah Foto
              </label>
              <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleHapusAvatar}
                  className="w-full py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-xs"
                >
                  Hapus Foto Profil
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs transition-all duration-200 active:scale-95 cursor-pointer"
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
