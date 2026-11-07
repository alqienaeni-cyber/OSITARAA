import React, { useState, useEffect, useCallback, useRef } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

//--- KONFIGURASI API BACKEND
const API_BASE = 'http://127.0.0.1:8000/api';

// DEKLARASI IKON SVG
function Icon({ type }) {
  const icons = {
    beranda: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    proker: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9z" />,
    anggota: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    proposal: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    keuangan: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    kegiatan: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  };
  return (
    <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[type] || null}
    </svg>
  );
}

//--- HELPER PENYARING DATA KONSISTEN
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number || 0);
};

const filterOnlyProkerKetua = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => String(item.is_event) !== '1' && String(item.sekbid || item.divisi || '').toLowerCase().trim() !== 'sekretaris');
};

const filterOnlyKegiatanSekre = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => String(item.is_event) === '1' || String(item.sekbid || item.divisi || '').toLowerCase().trim() === 'sekretaris');
};

export default function DashboardKetua({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const isFetchingRef = useRef(false);

  const getActiveUserMeta = useCallback(() => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('ositara_user'));
    } catch (e) {
      storedUser = null;
    }
    const activeObj = user || storedUser || {};
    return {
      userId: activeObj.id || activeObj.user_id || activeObj.uid || 1,
      sekbidDefault: activeObj.sekbid || activeObj.divisi || activeObj.seksi_bidang || 'Ketua OSIS',
    };
  }, [user]);

  const readInitialData = useCallback((key, fallback = []) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  }, []);

  const readAnggotaData = useCallback(() => {
    try {
      const primary = localStorage.getItem('ositara_anggota');
      const fallback = localStorage.getItem('anggotaList');
      let parsed = primary ? JSON.parse(primary) : (fallback ? JSON.parse(fallback) : []);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, []);

  const readProposalData = useCallback(() => {
    try {
      const primary = localStorage.getItem('ositara_proposal');
      const secondary = localStorage.getItem('ositara_proposals');
      const fallback = localStorage.getItem('proposals');
      const result = primary || secondary || fallback;
      return result ? JSON.parse(result) : [];
    } catch (e) {
      return [];
    }
  }, []);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_ketua_avatar') || null);

  // State Proker Ketua
  const [prokerList, setProkerList] = useState(() => {
    const raw = readInitialData('ositara_proker', []);
    return filterOnlyProkerKetua(raw);
  });

  const [anggotaList, setAnggotaList] = useState(() => readAnggotaData());
  const [proposalList, setProposalList] = useState(() => readProposalData());
  const [keuanganList, setKeuanganList] = useState(() => readInitialData('ositara_keuangan', []));
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const primary = readInitialData('ositara_pendaftaran', null);
    const secondary = readInitialData('pendaftaranList', []);
    return primary || secondary || [];
  });

  // State Kegiatan dari Sekretaris
  const [kegiatanList, setKegiatanList] = useState(() => {
    const raw = readInitialData('ositara_kegiatan', []);
    return filterOnlyKegiatanSekre(raw);
  });

  // State Modal Peserta
  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);

  // Form State: Proker (Tambah)
  const [namaProker, setNamaProker] = useState('');
  const [sekbidProker, setSekbidProker] = useState('');
  const [periodeProker, setPeriodeProker] = useState('Mingguan');
  const [targetProker, setTargetProker] = useState('');

  // Form State: Proker (Edit)
  const [editingProker, setEditingProker] = useState(null);
  const [editNamaProker, setEditNamaProker] = useState('');
  const [editSekbidProker, setEditSekbidProker] = useState('');
  const [editPeriodeProker, setEditPeriodeProker] = useState('Mingguan');
  const [editTargetProker, setEditTargetProker] = useState('');

  // Form State: Anggota
  const [nisAnggota, setNisAnggota] = useState('');
  const [namaAnggota, setNamaAnggota] = useState('');
  const [jabatanAnggota, setJabatanAnggota] = useState('Anggota');
  const [sekbidAnggota, setSekbidAnggota] = useState('');

  // Form State: Edit Anggota
  const [editingAnggota, setEditingAnggota] = useState(null);
  const [editNis, setEditNis] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editJabatan, setEditJabatan] = useState('');
  const [editSekbid, setEditSekbid] = useState('');

  const namaKetua = user?.namaLengkap || user?.nama || user?.name || user?.username || 'Anggi Anggraeni';
  const inisialNama = namaKetua.charAt(0).toUpperCase();

  const syncLocalData = useCallback(() => {
    const rawKegiatan = readInitialData('ositara_kegiatan', []);
    setKegiatanList(filterOnlyKegiatanSekre(rawKegiatan));
    const rawProker = readInitialData('ositara_proker', []);
    setProkerList(filterOnlyProkerKetua(rawProker));
    setProposalList(readProposalData());
  }, [readInitialData, readProposalData]);

  useEffect(() => {
    window.addEventListener('storage', syncLocalData);
    return () => window.removeEventListener('storage', syncLocalData);
  }, [syncLocalData]);

  // SINKRONISASI DATABASE MYSQL
  const handleSync = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // 1. Fetch Proker & Kegiatan
    try {
      const resProker = await fetch(`${API_BASE}/program-kerja`, {
        headers: { Accept: 'application/json' }
      });
      if (resProker.ok) {
        const data = await resProker.json();
        const arr = Array.isArray(data) ? data : (data.data || []);
        if (arr.length > 0) {
          const filteredArr = filterOnlyProkerKetua(arr);
          const formatted = filteredArr.map(item => {
            const valDivisi = item.sekbid || item.divisi || item.seksi_bidang || 'Ketua OSIS';
            return {
              id: item.id,
              nama: item.nama_proker || item.nama || 'Program Kerja',
              nama_proker: item.nama_proker || item.nama || 'Program Kerja',
              sekbid: valDivisi,
              divisi: valDivisi,
              user_id: item.user_id,
              target: item.target || '-',
              periode: item.periode || 'Mingguan',
              rawTarget: item.target,
              is_event: 0
            };
          });
          setProkerList(formatted);
          setKegiatanList(filterOnlyKegiatanSekre(arr));
        }
      }
    } catch (e) {
      console.warn("Sinkronisasi proker MySQL terputus:", e);
    } finally {
      isFetchingRef.current = false;
    }

    // 2. Fetch Anggota OSIS
    try {
      const resAnggota = await fetch(`${API_BASE}/pengurus-osis`, {
        headers: { Accept: 'application/json' }
      });
      if (resAnggota.ok) {
        const data = await resAnggota.json();
        const arr = Array.isArray(data) ? data : (data.data || []);
        if (arr.length > 0) {
          const formatted = arr.map(item => ({
            id: item.id,
            nis: item.nisn || item.nis || '-',
            nama: item.nama_lengkap || item.nama || '-',
            jabatan: item.jabatan || 'Anggota',
            sekbid: item.sekbid || item.divisi || '-',
            divisi: item.sekbid || item.divisi || '-',
            user_id: item.user_id
          }));
          setAnggotaList(formatted);
        }
      }
    } catch (e) {
      console.warn("Sinkronisasi anggota MySQL terputus:", e);
    }

    // 3. Fetch Proposal
    try {
      let resProposal = await fetch(`${API_BASE}/proposals`, {
        headers: { Accept: 'application/json' }
      });
      if (!resProposal.ok) {
        resProposal = await fetch(`${API_BASE}/proposal-kegiatan`, {
          headers: { Accept: 'application/json' }
        });
      }
      if (resProposal.ok) {
        const data = await resProposal.json();
        const arr = Array.isArray(data) ? data : (data.data || []);
        if (arr.length > 0) {
          const formatted = arr.map(p => ({
            id: p.id,
            judul_proposal: p.judul_proposal || p.judul || 'Tanpa Judul',
            pengaju: p.pengaju || p.sekbid || 'Sekretaris',
            tanggal: p.tanggal_pengajuan || p.tanggal || '-',
            status: p.status || 'Menunggu'
          }));
          setProposalList(formatted);
        }
      }
    } catch (e) {
      console.warn("Sinkronisasi proposal MySQL terputus:", e);
    }

    // 4. Fetch Pendaftaran Event
    try {
      let resPendaftaran = await fetch(`${API_BASE}/pendaftaran-event`, {
        headers: { Accept: 'application/json' }
      });
      if (!resPendaftaran.ok) {
        resPendaftaran = await fetch(`${API_BASE}/pendaftaran`, {
          headers: { Accept: 'application/json' }
        });
      }
      if (resPendaftaran.ok) {
        const data = await resPendaftaran.json();
        const arr = Array.isArray(data) ? data : (data.data || []);
        if (arr.length > 0) setPendaftaranList(arr);
      }
    } catch (e) {
      console.warn("Sinkronisasi pendaftaran MySQL terputus:", e);
    }

    setKeuanganList(readInitialData('ositara_keuangan', []));
  }, [readInitialData]);

  useEffect(() => {
    handleSync();
  }, [handleSync]);

  const totalPemasukan = keuanganList
    .filter((item) => (item.kategori || item.jenis) === 'Pemasukan')
    .reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);

  const totalPengeluaran = keuanganList
    .filter((item) => (item.kategori || item.jenis) === 'Pengeluaran')
    .reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);

  const totalkas = totalPemasukan - totalPengeluaran;

  // HANDLER PROKER (TAMBAH)
  const handleTambahProker = async (e) => {
    e.preventDefault();
    if (!namaProker.trim() || !targetProker) {
      alert("Mohon isi nama proker dan pilih tanggal pelaksanaan!");
      return;
    }
    const inputDivisi = sekbidProker.trim() || 'Ketua OSIS';
    const meta = getActiveUserMeta();
    const payload = {
      nama_proker: namaProker.trim(),
      nama: namaProker.trim(),
      sekbid: inputDivisi,
      divisi: inputDivisi,
      user_id: meta.userId,
      target: targetProker,
      periode: periodeProker,
      is_event: 0
    };

    const formattedDate = new Date(targetProker).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const prokerBaru = {
      id: String(Date.now()),
      nama: namaProker.trim(),
      nama_proker: namaProker.trim(),
      divisi: inputDivisi,
      sekbid: inputDivisi,
      user_id: meta.userId,
      periode: periodeProker,
      target: formattedDate,
      rawTarget: targetProker,
      tanggal: formattedDate,
      is_event: 0
    };

    const updated = [prokerBaru, ...prokerList];
    setProkerList(updated);

    const rawStorage = readInitialData('ositara_proker', []);
    const mergedStorage = [prokerBaru, ...rawStorage.filter(p => p.id !== prokerBaru.id)];
    localStorage.setItem('ositara_proker', JSON.stringify(mergedStorage));
    window.dispatchEvent(new Event('storage'));

    setNamaProker('');
    setSekbidProker('');
    setPeriodeProker('Mingguan');
    setTargetProker('');

    try {
      await fetch(`${API_BASE}/program-kerja`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      handleSync();
    } catch (e) {
      console.error("Gagal simpan proker ke MySQL:", e);
    }
  };

  // HANDLER PROKER (HAPUS)
  const handleHapusProker = async (id) => {
    if (window.confirm('Hapus Program Kerja ini?')) {
      const updated = prokerList.filter((p) => String(p.id) !== String(id));
      setProkerList(updated);

      const rawStorage = readInitialData('ositara_proker', []);
      const updatedStorage = rawStorage.filter((p) => String(p.id) !== String(id));
      localStorage.setItem('ositara_proker', JSON.stringify(updatedStorage));
      window.dispatchEvent(new Event('storage'));

      try {
        await fetch(`${API_BASE}/program-kerja/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' }
        });
      } catch (e) {
        console.error("Gagal hapus proker dari MySQL:", e);
      }
    }
  };

  // HANDLER PROKER (EDIT)
  const handleOpenEditProker = (item) => {
    setEditingProker(item);
    setEditNamaProker(item.nama || item.nama_proker || '');
    setEditSekbidProker(item.sekbid || item.divisi || '');
    setEditPeriodeProker(item.periode || 'Mingguan');
    setEditTargetProker(item.rawTarget || item.target || '');
  };

  const handleSaveEditProker = async (e) => {
    e.preventDefault();
    if (!editNamaProker.trim()) {
      alert('Nama Program Kerja tidak boleh kosong!');
      return;
    }
    const valSekbid = editSekbidProker.trim() || 'Ketua OSIS';
    const meta = getActiveUserMeta();
    const payload = {
      nama_proker: editNamaProker.trim(),
      nama: editNamaProker.trim(),
      sekbid: valSekbid,
      divisi: valSekbid,
      user_id: editingProker?.user_id || meta.userId,
      target: editTargetProker,
      periode: editPeriodeProker,
      is_event: 0
    };

    let formattedDate = editingProker.target;
    if (editTargetProker) {
      formattedDate = new Date(editTargetProker).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    }

    const updated = prokerList.map((item) =>
      item.id === editingProker.id
        ? {
            ...item,
            nama: editNamaProker.trim(),
            nama_proker: editNamaProker.trim(),
            sekbid: valSekbid,
            divisi: valSekbid,
            periode: editPeriodeProker,
            target: formattedDate,
            rawTarget: editTargetProker || item.rawTarget,
            tanggal: formattedDate,
            is_event: 0
          }
        : item
    );

    setProkerList(updated);
    const rawStorage = readInitialData('ositara_proker', []);
    const updatedStorage = rawStorage.map(item => String(item.id) === String(editingProker.id) ? { ...item, nama_proker: editNamaProker.trim(), nama: editNamaProker.trim(), sekbid: valSekbid, divisi: valSekbid, periode: editPeriodeProker, target: formattedDate } : item);
    localStorage.setItem('ositara_proker', JSON.stringify(updatedStorage));
    window.dispatchEvent(new Event('storage'));

    const isLocalId = String(editingProker.id).length > 10;
    const targetUrl = isLocalId ? `${API_BASE}/program-kerja` : `${API_BASE}/program-kerja/${editingProker.id}`;
    const targetMethod = isLocalId ? 'POST' : 'PUT';

    setEditingProker(null);
    try {
      await fetch(targetUrl, {
        method: targetMethod,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      handleSync();
    } catch (e) {
      console.error("Gagal update proker di MySQL:", e);
    }
  };

  // HANDLER ANGGOTA (TAMBAH)
  const handleTambahAnggota = async (e) => {
    e.preventDefault();
    if (!namaAnggota.trim()) {
      alert('Mohon isi nama anggota!');
      return;
    }
    const valSekbid = sekbidAnggota.trim() || 'Pengurus OSIS';
    const meta = getActiveUserMeta();
    const payload = {
      nisn: nisAnggota.trim() || '00000000',
      nama_lengkap: namaAnggota.trim(),
      jabatan: jabatanAnggota.trim() || 'Anggota',
      sekbid: valSekbid,
      user_id: meta.userId,
      periode: '2026/2027'
    };

    const anggotaBaru = {
      id: String(Date.now()),
      nis: nisAnggota.trim() || '-',
      nama: namaAnggota.trim(),
      jabatan: jabatanAnggota,
      sekbid: valSekbid,
      divisi: valSekbid,
      user_id: meta.userId
    };

    const updated = [anggotaBaru, ...anggotaList];
    setAnggotaList(updated);
    localStorage.setItem('ositara_anggota', JSON.stringify(updated));

    setNisAnggota('');
    setNamaAnggota('');
    setJabatanAnggota('Anggota');
    setSekbidAnggota('');

    try {
      await fetch(`${API_BASE}/pengurus-osis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      handleSync();
    } catch (e) {
      console.error("Gagal tambah anggota ke MySQL:", e);
    }
  };

  // HANDLER ANGGOTA (HAPUS)
  const handleHapusAnggota = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      const updated = anggotaList.filter((a) => String(a.id) !== String(id));
      setAnggotaList(updated);
      localStorage.setItem('ositara_anggota', JSON.stringify(updated));

      try {
        await fetch(`${API_BASE}/pengurus-osis/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' }
        });
      } catch (e) {
        console.error("Gagal hapus anggota dari MySQL:", e);
      }
    }
  };

  // HANDLER EDIT ANGGOTA
  const handleOpenEditAnggota = (item) => {
    setEditingAnggota(item);
    setEditNis(item.nis || '');
    setEditNama(item.nama || '');
    setEditJabatan(item.jabatan || 'Anggota');
    setEditSekbid(item.sekbid || item.divisi || '');
  };

  const handleSaveEditAnggota = async (e) => {
    e.preventDefault();
    if (!editNama.trim()) {
      alert('Nama anggota tidak boleh kosong!');
      return;
    }
    const valSekbid = editSekbid.trim() || 'Pengurus OSIS';
    const meta = getActiveUserMeta();
    const payload = {
      nisn: editNis.trim() || '00000000',
      nama_lengkap: editNama.trim(),
      jabatan: editJabatan.trim() || 'Anggota',
      sekbid: valSekbid,
      user_id: editingAnggota?.user_id || meta.userId,
      periode: '2026/2027'
    };

    const updated = anggotaList.map((item) =>
      item.id === editingAnggota.id
        ? { ...item, nis: editNis.trim() || '-', nama: editNama.trim(), jabatan: editJabatan.trim() || 'Anggota', sekbid: valSekbid, divisi: valSekbid }
        : item
    );

    setAnggotaList(updated);
    localStorage.setItem('ositara_anggota', JSON.stringify(updated));

    const isLocalId = String(editingAnggota.id).length > 10;
    const targetUrl = isLocalId ? `${API_BASE}/pengurus-osis` : `${API_BASE}/pengurus-osis/${editingAnggota.id}`;
    const targetMethod = isLocalId ? 'POST' : 'PUT';

    setEditingAnggota(null);
    try {
      await fetch(targetUrl, {
        method: targetMethod,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      handleSync();
    } catch (e) {
      console.error("Gagal update anggota di MySQL:", e);
    }
  };

  const getPesertaByKegiatan = (keg) => {
    if (!keg) return [];
    const targetId = String(keg.id);
    const targetName = (keg.nama_proker || keg.namaKegiatan || keg.nama || '').toLowerCase().trim();

    return pendaftaranList.filter((p) => {
      const pId = String(p.kegiatanId || p.kegiatan_id || p.event_id || '');
      const pName = (p.namaKegiatan || p.nama_kegiatan || p.nama_event || p.nama || '').toLowerCase().trim();
      return (pId && pId === targetId) || (pName && pName === targetName);
    });
  };

  const menuList = [
    { id: 'beranda', label: 'Beranda', icon: 'beranda' },
    { id: 'program-kerja', label: 'Program Kerja', icon: 'proker' },
    { id: 'anggota-osis', label: 'Anggota OSIS', icon: 'anggota' },
    { id: 'pengajuan-proposal', label: 'Pengajuan Proposal', icon: 'proposal' },
    { id: 'laporan-keuangan', label: 'Laporan Keuangan', icon: 'keuangan' },
    { id: 'kelola-kegiatan', label: 'Kelola Kegiatan', icon: 'kegiatan' }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F4F7] font-sans text-slate-800 relative overflow-x-hidden">

      {/* HEADER MOBILE */}
      <div className="md:hidden bg-[#2158B8] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <img
            src={logoOsitara}
            alt="Logo OSITARA"
            className="w-8 h-8 object-contain animate-bounce cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <div>
            <h1 className="text-base font-black tracking-wider leading-none">OSITARA</h1>
            <p className="text-[9px] text-[#FFF3BF] font-bold tracking-wide uppercase mt-0.5">KETUA/WAKIL OSIS</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all focus:outline-none cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 h-screen w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0 shadow-2xl transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          <div className="hidden md:flex items-center space-x-3 mb-10">
            <div className="relative group cursor-pointer">
              <img
                src={logoOsitara}
                alt="Logo OSITARA"
                className="w-10 h-10 object-contain shrink-0 animate-bounce hover:scale-110 transition-transform duration-300 drop-shadow-md"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-[#FFF3BF] font-bold tracking-wide mt-1 uppercase">KETUA/WAKIL OSIS</p>
            </div>
          </div>

          <nav className="space-y-1.5 mt-4 md:mt-0">
            {menuList.map((menu) => {
              const isActive = activeMenu === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    setActiveMenu(menu.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#FFF3BF] text-[#2158B8] shadow-md hover:shadow-lg'
                      : 'hover:bg-white/10 text-white hover:shadow-sm'
                  }`}
                >
                  <Icon type={menu.icon} />
                  <span className="leading-snug">{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="group flex items-center space-x-3 px-4 py-3 text-white hover:bg-rose-600/80 rounded-2xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer text-left shadow-sm hover:shadow-md mt-8 md:mt-0"
        >
          <Icon type="logout" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg border border-slate-200/80 transition-all duration-300">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div
              onClick={() => setShowAvatarModal(true)}
              className="relative group cursor-pointer shrink-0"
              title="Atur Foto Profil"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
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
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2158B8]">Selamat Datang, {namaKetua}!</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Jabatan: <span className="font-bold text-[#2158B8]">Ketua/Wakil OSIS</span>
              </p>
            </div>
          </div>
        </div>

        {/* 0. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Program Kerja</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{prokerList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-[#2158B8] rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Icon type="proker" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Anggota OSIS</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{anggotaList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Icon type="anggota" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Pengajuan Proposal</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">{proposalList.length}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Icon type="proposal" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Total Kas OSIS</p>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-600 mt-1">{formatRupiah(totalkas)}</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Icon type="keuangan" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 1. KELOLA PROGRAM KERJA */}
        {activeMenu === 'program-kerja' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.3s_ease-out]">
            <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto">
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Program Kerja OSIS</h3>
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="p-3 rounded-l-xl">Nama Proker</th>
                    <th className="p-3">Divisi/Sekbid</th>
                    <th className="p-3">Periode</th>
                    <th className="p-3">Target</th>
                    <th className="p-3 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prokerList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">Belum ada program kerja dari Ketua.</td>
                    </tr>
                  ) : (
                    prokerList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-800">{item.nama || item.nama_proker || '-'}</td>
                        <td className="p-3 text-slate-600">{item.sekbid || item.divisi || 'Ketua OSIS'}</td>
                        <td className="p-3 text-slate-600">{item.periode || 'Mingguan'}</td>
                        <td className="p-3 text-slate-600">{item.target || '-'}</td>
                        <td className="p-3 text-center space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditProker(item)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs"
                          >
                            <Icon type="edit" />
                          </button>
                          <button
                            onClick={() => handleHapusProker(item.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs"
                          >
                            <Icon type="trash" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4">Tambah Program Kerja</h3>
              <form onSubmit={handleTambahProker} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Program Kerja</label>
                  <input
                    type="text"
                    value={namaProker}
                    onChange={(e) => setNamaProker(e.target.value)}
                    placeholder="Contoh: Classmeeting"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Divisi / Sekbid</label>
                  <input
                    type="text"
                    value={sekbidProker}
                    onChange={(e) => setSekbidProker(e.target.value)}
                    placeholder="Bebas diketik (Cth: Sekbid 1/Kreatif)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Periode</label>
                  <select
                    value={periodeProker}
                    onChange={(e) => setPeriodeProker(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] bg-white hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <option value="Mingguan">Mingguan</option>
                    <option value="Bulanan">Bulanan</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Tanggal</label>
                  <input
                    type="date"
                    value={targetProker}
                    onChange={(e) => setTargetProker(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-xs sm:text-sm py-3 bg-[#FFC42B] hover:bg-[#ffb700] text-slate-900 font-black rounded-xl shadow-md hover:shadow-lg hover:shadow-amber-400/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer mt-2"
                >
                  Tambah Proker
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. ANGGOTA OSIS */}
        {activeMenu === 'anggota-osis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.3s_ease-out]">
            <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto">
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Anggota OSIS</h3>
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="p-3 rounded-l-xl">NISN/NIS</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Jabatan</th>
                    <th className="p-3">Sekbid/Divisi</th>
                    <th className="p-3 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggotaList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">Belum ada data anggota OSIS.</td>
                    </tr>
                  ) : (
                    anggotaList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-slate-600 font-mono">{item.nis || '-'}</td>
                        <td className="p-3 font-bold text-slate-800">{item.nama || '-'}</td>
                        <td className="p-3 text-slate-600">{item.jabatan || 'Anggota'}</td>
                        <td className="p-3 text-slate-600">{item.sekbid || item.divisi || '-'}</td>
                        <td className="p-3 text-center space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditAnggota(item)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs"
                          >
                            <Icon type="edit" />
                          </button>
                          <button
                            onClick={() => handleHapusAnggota(item.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs"
                          >
                            <Icon type="trash" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4">Tambah Anggota OSIS</h3>
              <form onSubmit={handleTambahAnggota} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">NISN/NIS</label>
                  <input
                    type="text"
                    value={nisAnggota}
                    onChange={(e) => setNisAnggota(e.target.value)}
                    placeholder="Contoh: 0071234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={namaAnggota}
                    onChange={(e) => setNamaAnggota(e.target.value)}
                    placeholder="Nama Pengurus"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={jabatanAnggota}
                    onChange={(e) => setJabatanAnggota(e.target.value)}
                    placeholder="Contoh: Anggota"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sekbid/Divisi</label>
                  <input
                    type="text"
                    value={sekbidAnggota}
                    onChange={(e) => setSekbidAnggota(e.target.value)}
                    placeholder="Bebas diketik (Cth: Pengurus Inti)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFC42B] hover:bg-[#ffb700] text-slate-900 font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-amber-400/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer mt-2"
                >
                  Tambah Anggota
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. PENGAJUAN PROPOSAL */}
        {activeMenu === 'pengajuan-proposal' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Pengajuan Proposal</h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="p-3 rounded-l-xl">Judul Proposal</th>
                  <th className="p-3">Pengaju/Sekbid</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposalList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-400">Belum ada pengajuan proposal.</td>
                  </tr>
                ) : (
                  proposalList.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{item.judul_proposal || item.judul || item.nama}</td>
                      <td className="p-3 text-slate-600">{item.pengaju || item.sekbid || item.divisi || 'Sekretaris'}</td>
                      <td className="p-3 text-slate-600">{item.tanggal || item.created_at || '-'}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.status === 'Disetujui' || item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status || 'Menunggu'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. LAPORAN KEUANGAN */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Laporan Kas OSIS</h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="p-3 rounded-l-xl">Keterangan</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3">Nominal</th>
                  <th className="p-3 rounded-r-xl">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keuanganList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-400">Belum ada data laporan keuangan.</td>
                  </tr>
                ) : (
                  keuanganList.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{item.keterangan || item.uraian}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${(item.kategori || item.jenis) === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {item.kategori || item.jenis}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{formatRupiah(item.jumlah)}</td>
                      <td className="p-3 text-slate-600">{item.tanggal || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. KELOLA KEGIATAN (REKAP DARI SEKRETARIS) */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">Daftar Kegiatan OSIS (Dari Sekretaris)</h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="p-3 rounded-l-xl">Nama Kegiatan</th>
                  <th className="p-3">Tanggal Pelaksanaan</th>
                  <th className="p-3">Penanggung Jawab</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kegiatanList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400">Belum ada data kegiatan dari Sekretaris.</td>
                  </tr>
                ) : (
                  kegiatanList.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{item.nama_proker || item.namaKegiatan || item.nama}</td>
                      <td className="p-3 text-slate-600">{item.target || item.tanggal || '-'}</td>
                      <td className="p-3 text-slate-600">{item.pj || item.sekbid || item.divisi || 'Sekretaris'}</td>
                      <td className="p-3 font-bold text-blue-600">{item.status || 'Terencana'}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedKegiatanPeserta(item)}
                          className="px-3 py-1 bg-blue-50 text-[#2158B8] rounded-xl hover:bg-blue-100 font-bold text-xs inline-flex items-center space-x-1 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs"
                        >
                          <Icon type="users" />
                          <span>Peserta ({getPesertaByKegiatan(item).length})</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* MODAL PESERTA KEGIATAN */}
      {selectedKegiatanPeserta && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border border-blue-100 transform transition-all duration-300 animate-[scaleIn_0.2s_ease-out]">
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
                      <p className="font-bold text-slate-800">{p.namaSiswa || p.nama_siswa || p.nama}</p>
                      <p className="text-slate-500">{p.kelas} | NIS: {p.nisn || p.nis || '-'}</p>
                    </div>
                    <span className="text-slate-400 text-[10px]">{p.tanggalDaftar || p.tanggal_daftar || ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PROKER */}
      {editingProker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 transform transition-all duration-300 animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-[#2158B8]">Edit Program Kerja</h3>
            <form onSubmit={handleSaveEditProker} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Program Kerja</label>
                <input
                  type="text"
                  value={editNamaProker}
                  onChange={(e) => setEditNamaProker(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Divisi/Sekbid</label>
                <input
                  type="text"
                  value={editSekbidProker}
                  onChange={(e) => setEditSekbidProker(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Periode</label>
                <select
                  value={editPeriodeProker}
                  onChange={(e) => setEditPeriodeProker(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] bg-white cursor-pointer shadow-xs"
                >
                  <option value="Mingguan">Mingguan</option>
                  <option value="Bulanan">Bulanan</option>
                  <option value="Tahunan">Tahunan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Target Tanggal</label>
                <input
                  type="date"
                  value={editTargetProker}
                  onChange={(e) => setEditTargetProker(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProker(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2158B8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT ANGGOTA */}
      {editingAnggota && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 transform transition-all duration-300 animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-[#2158B8]">Edit Data Anggota OSIS</h3>
            <form onSubmit={handleSaveEditAnggota} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">NISN/NIS</label>
                <input
                  type="text"
                  value={editNis}
                  onChange={(e) => setEditNis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={editJabatan}
                  onChange={(e) => setEditJabatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sekbid / Divisi</label>
                <input
                  type="text"
                  value={editSekbid}
                  onChange={(e) => setEditSekbid(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAnggota(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2158B8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA FOTO PROFIL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 text-center transform transition-all duration-300 animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-[#2158B8]">Kelola Foto Profil</h3>
            <div className="flex justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Preview Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 shadow-md" />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-[#2158B8] border-4 border-slate-50 shadow-inner font-black text-2xl">
                  {inisialNama}
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarUrl(reader.result);
                    localStorage.setItem('ositara_ketua_avatar', reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-[#2158B8] hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                Pilih Foto Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl(null);
                  localStorage.removeItem('ositara_ketua_avatar');
                  setShowAvatarModal(false);
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-xs cursor-pointer"
              >
                Hapus Foto Profil
              </button>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer"
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
