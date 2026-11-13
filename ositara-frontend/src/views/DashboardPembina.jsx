import { useState, useEffect, useCallback, useRef } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// --- KONFIGURASI API BACKEND ---
const API_BASE = 'http://127.0.0.1:8000/api';

// --- HELPER UTILS & FORMATTER ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

const formatTanggal = (tgl) => {
  if (!tgl) return '-';
  const cleanDate = String(tgl).split('T')[0].split(' ')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [tahun, bulan, tanggal] = parts;
    return `${tanggal}-${bulan}-${tahun}`;
  }
  return tgl;
};

// --- DEKLARASI IKON SVG (SERAGAM DENGAN KETUA, SEKRETARIS & BENDAHARA) ---
const SvgHome = () => (
  <svg
    className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const SvgProposal = () => (
  <svg
    className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const SvgProker = () => (
  <svg
    className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

const SvgAnggota = () => (
  <svg
    className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const SvgKegiatan = () => (
  <svg
    className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const SvgKeuangan = () => (
  <svg
    className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SvgArrowUp = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const SvgArrowDown = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const SvgLogout = () => (
  <svg
    className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const SvgDownload = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const SvgCheck = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const SvgEdit = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const SvgClose = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SvgUsersGroup = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const getInitialData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const filterOnlyKegiatanSekre = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item) =>
      String(item.is_event) === '1' ||
      String(item.sekbid || item.divisi || '').toLowerCase().trim() === 'sekretaris'
  );
};

const filterOnlyProkerKetua = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item) =>
      String(item.is_event) !== '1' &&
      String(item.sekbid || item.divisi || '').toLowerCase().trim() !== 'sekretaris'
  );
};

export default function DashboardPembina({
  user,
  onLogout,
  proposalList: initialProposal = [],
  kegiatanList: initialKegiatan = [],
  prokerList: initialProker = [],
  laporanKeuanganList: initialKeuangan = [],
  anggotaList: initialAnggota = [],
}) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFetchingRef = useRef(false);

  // --- STATE NOTIFIKASI TOAST & MODAL ---
  const [toastNotif, setToastNotif] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
  });

  const showToast = useCallback((message, type = 'success') => {
    setToastNotif({ message, type });
    setTimeout(() => {
      setToastNotif((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  // --- STATES DATA UTAMA ---
  const [proposalList, setProposalList] = useState(() =>
    getInitialData('ositara_proposal', initialProposal)
  );
  const [prokerList, setProkerList] = useState(() => {
    const raw = getInitialData('ositara_proker', initialProker);
    return filterOnlyProkerKetua(raw);
  });
  const [kegiatanList, setKegiatanList] = useState(() => {
    const raw = getInitialData('ositara_kegiatan', initialKegiatan);
    return filterOnlyKegiatanSekre(raw);
  });
  const [keuanganList, setKeuanganList] = useState(() =>
    getInitialData('ositara_keuangan', initialKeuangan)
  );
  const [anggotaList, setAnggotaList] = useState(() =>
    getInitialData('ositara_anggota', initialAnggota)
  );
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const primary = getInitialData('ositara_pendaftaran', null);
    const secondary = getInitialData('pendaftaranList', []);
    return primary || secondary || [];
  });

  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem('ositara_pembina_avatar') || null
  );
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // --- STATE MODAL REVISI & PESERTA ---
  const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
  const [selectedProposalRevisi, setSelectedProposalRevisi] = useState(null);
  const [catatanRevisiInput, setCatatanRevisiInput] = useState('');
  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);

  const namaDisplay =
    user?.namaLengkap || user?.nama || user?.name || user?.username || 'Pembina OSIS';
  const inisialNama = namaDisplay.charAt(0).toUpperCase();

  // --- SINKRONISASI SEMUA DATA DARI BACKEND MYSQL & LOCAL STORAGE ---
  const syncAllDataFromBackend = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Sync Proposal
      try {
        let resProposal = await fetch(`${API_BASE}/proposals`, {
          headers: { Accept: 'application/json' },
        });
        if (!resProposal.ok) {
          resProposal = await fetch(`${API_BASE}/proposal-kegiatan`, {
            headers: { Accept: 'application/json' },
          });
        }
        if (resProposal.ok) {
          const result = await resProposal.json();
          const dataArr = Array.isArray(result) ? result : result.data || [];
          const formatted = dataArr.map((p) => {
            const fileNameFix = p.file_proposal || p.file || 'Dokumen.pdf';
            const fileUrlFix = `${API_BASE}/download-proposal/${encodeURIComponent(fileNameFix)}`;
            return {
              id: p.id,
              judul_proposal: p.judul_proposal || p.judul || 'Tanpa Judul',
              judul: p.judul_proposal || p.judul || 'Tanpa Judul',
              kategori: p.kategori || 'Kegiatan',
              anggaran: Number(p.anggaran) || 0,
              file: fileNameFix,
              fileData: fileUrlFix,
              file_url: fileUrlFix,
              tanggal: p.tanggal_pengajuan || p.tanggal || '-',
              status: p.status || 'Menunggu Persetujuan',
              catatan_revisi: p.catatan_pembina || p.catatan_revisi || p.catatan || '-',
              catatan_pembina: p.catatan_pembina || p.catatan_revisi || p.catatan || '-',
            };
          });
          setProposalList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(formatted) ? formatted : prev
          );
          localStorage.setItem('ositara_proposal', JSON.stringify(formatted));
        }
      } catch (e) {
        console.warn('Sync proposal terlewati:', e);
      }

      // 2. Sync Anggota OSIS
      try {
        let resAnggota = await fetch(`${API_BASE}/pengurus-osis`, {
          headers: { Accept: 'application/json' },
        });
        if (!resAnggota.ok) {
          resAnggota = await fetch(`${API_BASE}/anggota`, {
            headers: { Accept: 'application/json' },
          });
        }
        if (resAnggota.ok) {
          const resultA = await resAnggota.json();
          const dataA = Array.isArray(resultA) ? resultA : resultA.data || [];
          const formattedA = dataA.map((a) => ({
            id: a.id,
            nis: a.nis || a.nisn || '-',
            nama: a.nama || a.nama_lengkap || '-',
            jabatan: a.jabatan || '-',
            sekbid: a.sekbid || a.divisi || '-',
          }));
          setAnggotaList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(formattedA) ? formattedA : prev
          );
          localStorage.setItem('ositara_anggota', JSON.stringify(formattedA));
        }
      } catch (e) {
        console.warn('Sync anggota terlewati:', e);
      }

      // 3. Sync Program Kerja & Kegiatan
      try {
        const resProker = await fetch(`${API_BASE}/program-kerja`, {
          headers: { Accept: 'application/json' },
        });
        if (resProker.ok) {
          const resultPK = await resProker.json();
          const dataPK = Array.isArray(resultPK) ? resultPK : resultPK.data || [];
          const onlyProker = filterOnlyProkerKetua(dataPK);
          const onlyKegiatan = filterOnlyKegiatanSekre(dataPK);
          setProkerList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(onlyProker) ? onlyProker : prev
          );
          setKegiatanList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(onlyKegiatan) ? onlyKegiatan : prev
          );
          localStorage.setItem('ositara_proker', JSON.stringify(onlyProker));
          localStorage.setItem('ositara_kegiatan', JSON.stringify(onlyKegiatan));
        }
      } catch (e) {
        console.warn('Sync proker/kegiatan terlewati:', e);
      }

      // 4. Sync Keuangan
      try {
        let resKeuangan = await fetch(`${API_BASE}/keuangan`, {
          headers: { Accept: 'application/json' },
        });
        if (!resKeuangan.ok) {
          resKeuangan = await fetch(`${API_BASE}/laporan-keuangan`, {
            headers: { Accept: 'application/json' },
          });
        }
        if (resKeuangan.ok) {
          const resultK = await resKeuangan.json();
          const dataK = Array.isArray(resultK) ? resultK : resultK.data || [];
          setKeuanganList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(dataK) ? dataK : prev
          );
          localStorage.setItem('ositara_keuangan', JSON.stringify(dataK));
        }
      } catch (e) {
        console.warn('Sync keuangan terlewati:', e);
      }

      // 5. Sync Pendaftaran
      try {
        let resPendaftaran = await fetch(`${API_BASE}/pendaftaran-event`, {
          headers: { Accept: 'application/json' },
        });
        if (!resPendaftaran.ok) {
          resPendaftaran = await fetch(`${API_BASE}/pendaftaran`, {
            headers: { Accept: 'application/json' },
          });
        }
        if (resPendaftaran.ok) {
          const resultP = await resPendaftaran.json();
          const dataP = Array.isArray(resultP) ? resultP : resultP.data || [];
          const formattedP = dataP.map((p) => {
            const catatanFix =
              p.catatan || p.alasan || p.alasan_mengikuti || p.keterangan || '-';
            return {
              id: p.id,
              kegiatanId: p.kegiatan_id || p.kegiatanId || p.event_id,
              namaKegiatan:
                p.nama_kegiatan ||
                p.namaKegiatan ||
                p.nama_event ||
                p.nama_proker ||
                p.nama ||
                'Kegiatan OSIS',
              namaSiswa: p.nama_siswa || p.namaSiswa || p.nama,
              nama: p.nama_siswa || p.namaSiswa || p.nama,
              nis: p.nis || p.nisn || '-',
              kelas: p.kelas || '-',
              catatan: catatanFix,
              alasan: catatanFix,
              alasan_mengikuti: catatanFix,
              tanggalDaftar: p.tanggal_daftar || p.tanggalDaftar || '-',
              status: p.status || 'Terdaftar',
            };
          });
          setPendaftaranList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(formattedP) ? formattedP : prev
          );
          localStorage.setItem('ositara_pendaftaran', JSON.stringify(formattedP));
        }
      } catch (e) {
        console.warn('Sync pendaftaran terlewati:', e);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    syncAllDataFromBackend();
    const interval = setInterval(syncAllDataFromBackend, 15000);
    window.addEventListener('storage', syncAllDataFromBackend);
    window.addEventListener('ositara_proposal_updated', syncAllDataFromBackend);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncAllDataFromBackend);
      window.removeEventListener('ositara_proposal_updated', syncAllDataFromBackend);
    };
  }, [syncAllDataFromBackend]);

  // --- HANDLER FOTO PROFIL PEMBINA ---
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size >= 2 * 1024 * 1024) {
        showToast('Ukuran foto terlalu besar! Maksimal 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_pembina_avatar', reader.result);
        setShowAvatarModal(false);
        showToast('Foto profil Pembina berhasil diperbarui!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusAvatar = () => {
    setConfirmModal({
      isOpen: true,
      type: 'avatar',
      title: 'Hapus Foto Profil?',
      message: 'Foto profil Anda akan dikembalikan ke inisial nama default.',
    });
  };

  const handleExecuteConfirm = () => {
    setConfirmModal({ isOpen: false, type: null, title: '', message: '' });
    setAvatarUrl(null);
    localStorage.removeItem('ositara_pembina_avatar');
    setShowAvatarModal(false);
    showToast('Foto profil berhasil dihapus.');
  };

  // --- HANDLER PERSETUJUAN / REVISI / TOLAK PROPOSAL ---
  const handleUpdateStatusProposal = async (id, newStatus, catatan = null) => {
    const catatanFinal =
      catatan !== null && catatan !== ''
        ? catatan
        : newStatus === 'Disetujui'
        ? 'Proposal disetujui oleh Pembina.'
        : newStatus === 'Ditolak'
        ? 'Proposal ditolak oleh Pembina.'
        : '-';

    // 1. Optimistic UI Update
    const updated = proposalList.map((item) =>
      String(item.id) === String(id)
        ? {
            ...item,
            status: newStatus,
            catatan_revisi: catatanFinal,
            catatan_pembina: catatanFinal,
            catatanRevisi: catatanFinal,
          }
        : item
    );
    setProposalList(updated);
    localStorage.setItem('ositara_proposal', JSON.stringify(updated));
    window.dispatchEvent(new Event('ositara_proposal_updated'));

    showToast(
      newStatus === 'Disetujui'
        ? 'Proposal berhasil disetujui!'
        : newStatus === 'Revisi'
        ? 'Catatan revisi berhasil dikirim ke Sekretaris!'
        : 'Proposal ditolak.',
      newStatus === 'Disetujui' ? 'success' : 'warning'
    );

    // 2. Sinkronkan ke Database MySQL
    try {
      const payload = {
        status: newStatus,
        catatan_pembina: catatanFinal,
        catatan_revisi: catatanFinal,
      };

      let res = await fetch(`${API_BASE}/proposals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE}/proposal-kegiatan/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        await syncAllDataFromBackend();
      }
    } catch (err) {
      console.error('Gagal update status proposal ke server:', err);
    }
  };

  const handleOpenRevisiModal = (item) => {
    setSelectedProposalRevisi(item);
    const existingCatatan = item.catatan_revisi || item.catatan_pembina || '';
    setCatatanRevisiInput(existingCatatan !== '-' ? existingCatatan : '');
    setIsRevisiModalOpen(true);
  };

  const handleSubmitRevisi = (e) => {
    e.preventDefault();
    if (!catatanRevisiInput.trim()) {
      showToast('Silakan masukkan catatan revisi terlebih dahulu!', 'warning');
      return;
    }
    if (selectedProposalRevisi) {
      handleUpdateStatusProposal(
        selectedProposalRevisi.id,
        'Revisi',
        catatanRevisiInput.trim()
      );
    }
    setIsRevisiModalOpen(false);
    setSelectedProposalRevisi(null);
    setCatatanRevisiInput('');
  };

  const getPesertaByKegiatan = (keg) => {
    if (!keg) return [];
    const targetId = String(keg.id);
    const targetName = (keg.nama_proker || keg.namaKegiatan || keg.nama || '')
      .toLowerCase()
      .trim();

    return pendaftaranList.filter((p) => {
      const pId = String(p.kegiatanId || p.kegiatan_id || '');
      const pName = (
        p.namaKegiatan ||
        p.nama_kegiatan ||
        p.nama_event ||
        p.nama_proker ||
        p.nama ||
        ''
      )
        .toLowerCase()
        .trim();

      return (pId && pId === targetId) || (pName && pName === targetName);
    });
  };

  // --- KALKULASI KEUANGAN ---
  const totalPemasukan = keuanganList
    .filter((k) => (k.jenis || k.kategori) === 'Pemasukan')
    .reduce((acc, cur) => acc + Number(cur.jumlah || cur.nominal || 0), 0);

  const totalPengeluaran = keuanganList
    .filter((k) => (k.jenis || k.kategori) === 'Pengeluaran')
    .reduce((acc, cur) => acc + Number(cur.jumlah || cur.nominal || 0), 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const proposalMenungguCount = proposalList.filter(
    (p) =>
      p.status === 'Menunggu Persetujuan' ||
      p.status === 'Pending' ||
      p.status?.toLowerCase().includes('menunggu')
  ).length;

  const proposalDisetujuiCount = proposalList.filter(
    (p) => p.status === 'Disetujui' || p.status === 'Diterima'
  ).length;

  const menuList = [
    { id: 'beranda', label: 'Beranda Utama', IconComponent: SvgHome },
    { id: 'persetujuan-proposal', label: 'Persetujuan Proposal', IconComponent: SvgProposal },
    { id: 'program-kerja', label: 'Program Kerja', IconComponent: SvgProker },
    { id: 'anggota-osis', label: 'Anggota OSIS', IconComponent: SvgAnggota },
    { id: 'kegiatan', label: 'Kegiatan OSIS', IconComponent: SvgKegiatan },
    { id: 'laporan-keuangan', label: 'Laporan Keuangan', IconComponent: SvgKeuangan },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-100/90 font-sans text-slate-800 selection:bg-[#2158B8] selection:text-white">
      {/* NOTIFIKASI TOAST MELAYANG */}
      {toastNotif && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-[fadeIn_0.2s_ease-out] sm:max-w-sm">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm ${
              toastNotif.type === 'warning'
                ? 'bg-gradient-to-br from-[#c7852e] to-[#ffd27d]'
                : 'bg-gradient-to-br from-[#2158B8] to-[#3A86EF]'
            }`}
          >
            {toastNotif.type === 'warning' ? '!' : '✓'}
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
            {toastNotif.message}
          </p>
        </div>
      )}

      {/* HEADER NAVBAR MOBILE - WARNA ROYAL BLUE OSITARA */}
      <div className="md:hidden bg-gradient-to-r from-[#1B4694] to-[#2158B8] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md w-full shrink-0 border-b border-blue-800/30">
        <div className="flex items-center space-x-2.5">
          <img
            src={logoOsitara}
            alt="Logo OSITARA"
            className="w-7 h-7 object-contain drop-shadow"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <div>
            <h1 className="text-base font-black tracking-widest leading-none">
              OSITARA
            </h1>
            <p className="text-[9px] text-[#FFD43B] font-extrabold tracking-wider uppercase mt-0.5">
              PEMBINA OSIS
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/15 focus:outline-none cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* OVERLAY MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/50 z-40 md:hidden backdrop-blur-xs transition-all animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      {/* SIDEBAR NAVIGATION - GRADASI ROYAL BLUE & AKTIF GOLDEN CREAM OSITARA */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 h-screen w-64 bg-gradient-to-b from-[#1B4694] via-[#2158B8] to-[#3A86EF] text-white flex flex-col justify-between p-5 shrink-0 shadow-2xl border-r border-blue-600/40 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="flex items-center justify-between md:justify-start space-x-3.5 mb-8 p-1">
            <div className="flex items-center space-x-3.5">
              <div className="relative group cursor-pointer transition-transform duration-300 hover:rotate-6">
                <img
                  src={logoOsitara}
                  alt="Logo OSITARA"
                  className="w-10 h-10 object-contain shrink-0 drop-shadow-md"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-widest leading-none drop-shadow-md">
                  OSITARA
                </h1>
                <p className="text-[10px] text-[#FFD43B] font-extrabold tracking-wider mt-1 uppercase drop-shadow-xs">
                  PEMBINA OSIS
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-2">
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
                  className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-95 cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f4d875] to-[#f4d875] text-[#1B4694] shadow-lg shadow-amber-400/40 font-black translate-x-1'
                      : 'hover:bg-white/15 text-blue-50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <IconComp />
                    <span className="truncate tracking-wide">{menu.label}</span>
                  </div>
                  {menu.id === 'persetujuan-proposal' && proposalMenungguCount > 0 && (
                    <span
                      className={`ml-2 px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                        isActive
                          ? 'bg-[#1B4694] text-[#FFD43B]'
                          : 'bg-[#FFD43B] text-[#1B4694]'
                      }`}
                    >
                      {proposalMenungguCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* TOMBOL LOGOUT SOLID MERAH */}
        <button
          onClick={onLogout}
          className="group flex items-center space-x-3 px-4 py-3.5 text-white bg-[#E63946] hover:bg-[#D62828] border border-rose-500 rounded-2xl font-black text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer text-left shadow-lg shadow-rose-600/40 mt-8 md:mt-0"
        >
          <SvgLogout />
          <span className="tracking-wide">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 w-full space-y-5 sm:space-y-6">
        {/* HEADER PROFIL PEMBINA */}
        <div className="relative overflow-hidden bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200/90 transition-all duration-300 hover:shadow-md">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#2158B8]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between min-w-0 w-full relative z-10">
            <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 flex-1">
              <div
                onClick={() => setShowAvatarModal(true)}
                className="relative group cursor-pointer shrink-0"
                title="Klik untuk ubah foto profil"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profil Pembina"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/40 group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#1B4694] to-[#3A86EF] flex items-center justify-center text-white border-2 border-white shadow-md ring-2 ring-blue-500/30 rounded-2xl font-black text-lg sm:text-2xl group-hover:scale-105 transition-all duration-300">
                    {inisialNama}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-all duration-300 shadow-inner">
                  Ubah
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-2xl font-black text-slate-800 leading-snug break-words">
                  Selamat Datang, <span className="text-[#2158B8]">{namaDisplay}</span>!
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Peran Akses:</span>
                  <span className="bg-blue-100/80 text-[#2158B8] font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-blue-300">
                    PEMBINA OSIS
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. BERANDA UTAMA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-5 sm:space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {/* STATS CARDS - TETAP 4 SEBARIS DI SEMUA UKURAN LAYAR */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-5">
              {/* Kartu 1: Menunggu Persetujuan */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#c7852e] via-[#ebaa46] to-[#ffd27d] p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#c7852e]/30 hover:shadow-2xl hover:shadow-[#c7852e]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Perlu Persetujuan
                  </p>
                  <h3 className="text-sm sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {proposalMenungguCount}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgProposal />
                </div>
              </div>

              {/* Kartu 2: Proposal Disetujui */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#3b72b5] via-[#4c9ae8] to-[#82c8f7] p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#3b72b5]/30 hover:shadow-2xl hover:shadow-[#3b72b5]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Proposal Disetujui
                  </p>
                  <h3 className="text-sm sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {proposalDisetujuiCount}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgCheck />
                </div>
              </div>

              {/* Kartu 3: Total Program Kerja */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#e05263] via-[#f27482] to-[#fca5b0] p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#e05263]/30 hover:shadow-2xl hover:shadow-[#e05263]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Program Kerja
                  </p>
                  <h3 className="text-sm sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {prokerList.length}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgProker />
                </div>
              </div>

              {/* Kartu 4: Saldo Kas OSIS */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#249ea0] via-[#34c6c8] to-[#7ce8ea] p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#249ea0]/30 hover:shadow-2xl hover:shadow-[#249ea0]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Saldo Kas OSIS
                  </p>
                  <h3 className="text-[11px] sm:text-xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {formatRupiah(saldoKas)}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgKeuangan />
                </div>
              </div>
            </div>

            {/* RINGKASAN PROPOSAL & AGENDA TERBARU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Pengajuan Proposal Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveMenu('persetujuan-proposal')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors duration-200 cursor-pointer hover:underline"
                  >
                    Kelola Semua &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {proposalList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada proposal diajukan oleh pengurus.
                      </p>
                    </div>
                  ) : (
                    proposalList.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 transition-all duration-200 hover:translate-x-1"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {p.judul_proposal || p.judul}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {formatRupiah(p.anggaran)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-[10px] font-extrabold rounded-xl shrink-0 uppercase tracking-wider ${
                            p.status === 'Disetujui' || p.status === 'Diterima'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : p.status === 'Ditolak'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8]" />
                    Agenda Kegiatan OSIS
                  </h3>
                  <button
                    onClick={() => setActiveMenu('kegiatan')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors duration-200 cursor-pointer hover:underline"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {kegiatanList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada agenda kegiatan OSIS.
                      </p>
                    </div>
                  ) : (
                    kegiatanList.slice(0, 4).map((k) => (
                      <div
                        key={k.id}
                        className="p-3.5 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 transition-all duration-200 hover:translate-x-1"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {k.nama_proker || k.namaKegiatan || k.nama}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {formatTanggal(k.target || k.tanggal)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-[10px] font-extrabold rounded-xl shrink-0 uppercase tracking-wider ${
                            k.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-100 text-[#2158B8] border border-blue-200'
                          }`}
                        >
                          {k.status || 'Mendatang'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PERSETUJUAN PROPOSAL (AKSI UTAMA PEMBINA) */}
        {activeMenu === 'persetujuan-proposal' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  Persetujuan Proposal Kegiatan OSIS
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tinjau dokumen proposal, berikan persetujuan, atau kirim catatan revisi ke Sekretaris.
                </p>
              </div>
              <span className="bg-blue-50 text-[#2158B8] border border-blue-200 px-3 py-1 rounded-full text-xs font-extrabold self-start sm:self-center">
                Total: {proposalList.length} Proposal
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Judul Proposal</th>
                    <th className="py-3 px-4">Anggaran</th>
                    <th className="py-3 px-4">Berkas PDF</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Catatan Pembina</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada proposal yang diajukan oleh Sekretaris OSIS.
                      </td>
                    </tr>
                  ) : (
                    proposalList.map((p) => {
                      const fileDisplayName =
                        p.file || p.fileName || p.file_proposal || 'Dokumen.pdf';
                      const downloadUrl = `${API_BASE}/download-proposal/${encodeURIComponent(
                        fileDisplayName
                      )}`;
                      return (
                        <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {p.judul_proposal || p.judul || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-semibold whitespace-nowrap">
                            {formatRupiah(p.anggaran)}
                          </td>
                          <td className="py-3.5 px-4">
                            {fileDisplayName && fileDisplayName !== 'Tidak ada berkas' ? (
                              <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={fileDisplayName}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-[#2158B8] hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer max-w-[150px]"
                                title="Unduh / Buka Berkas PDF"
                              >
                                <SvgDownload />
                                <span className="truncate">{fileDisplayName}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs italic">
                                Tidak ada berkas
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-1 font-bold text-[10px] sm:text-xs rounded-xl inline-block uppercase tracking-wider ${
                                p.status === 'Diterima' || p.status === 'Disetujui'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : p.status === 'Ditolak'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs italic max-w-[180px]">
                            {p.catatan_revisi || p.catatan_pembina || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() =>
                                handleUpdateStatusProposal(
                                  p.id,
                                  'Disetujui',
                                  'Proposal disetujui oleh Pembina.'
                                )
                              }
                              className="px-3 py-1.5 bg-[#2158B8] hover:bg-[#1B4694] text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <SvgCheck />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => handleOpenRevisiModal(p)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <SvgEdit />
                              <span>Revisi</span>
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatusProposal(
                                  p.id,
                                  'Ditolak',
                                  'Proposal ditolak oleh Pembina.'
                                )
                              }
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <SvgClose />
                              <span>Tolak</span>
                            </button>
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

        {/* 3. PROGRAM KERJA (READ-ONLY) */}
        {activeMenu === 'program-kerja' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Program Kerja OSIS
              </h3>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold">
                Mode Pantau
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Program Kerja</th>
                    <th className="py-3 px-4">Divisi / Sekbid</th>
                    <th className="py-3 px-4 rounded-r-xl">Target Pelaksanaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prokerList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada data program kerja dari Ketua OSIS.
                      </td>
                    </tr>
                  ) : (
                    prokerList.map((pk) => (
                      <tr key={pk.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {pk.nama_proker || pk.nama}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#2158B8]">
                          {pk.divisi || pk.sekbid || 'Umum'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {formatTanggal(pk.target || pk.tanggal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ANGGOTA OSIS (READ-ONLY) */}
        {activeMenu === 'anggota-osis' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Daftar Pengurus & Anggota OSIS
              </h3>
              <span className="bg-blue-50 text-[#2158B8] border border-blue-200 px-3 py-1 rounded-full text-xs font-extrabold">
                {anggotaList.length} Anggota
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">NIS</th>
                    <th className="py-3 px-4">Nama Anggota</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4 rounded-r-xl">Divisi / Sekbid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggotaList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada data anggota terdaftar.
                      </td>
                    </tr>
                  ) : (
                    anggotaList.map((a) => (
                      <tr key={a.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {a.nis || '-'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{a.nama}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {a.jabatan || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {a.sekbid || a.divisi || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. KEGIATAN OSIS & PESERTA (READ-ONLY) */}
        {activeMenu === 'kegiatan' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8]" />
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Daftar Kegiatan OSIS & Pendaftar Siswa
              </h3>
            </div>
            {kegiatanList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Belum ada agenda kegiatan yang ditambahkan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {kegiatanList.map((k) => {
                  const pesertaKegiatan = getPesertaByKegiatan(k);
                  return (
                    <div
                      key={k.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2.5 mb-2">
                          <h4 className="font-black text-slate-800 text-base sm:text-lg leading-snug">
                            {k.nama_proker || k.namaKegiatan || k.nama}
                          </h4>
                          <span
                            className={`px-3 py-0.5 font-extrabold text-[10px] rounded-full shrink-0 uppercase tracking-wider border ${
                              k.status === 'Selesai'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-[#2158B8] border-blue-200'
                            }`}
                          >
                            {k.status || 'KEGIATAN'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
                          {k.deskripsi || 'Tidak ada deskripsi kegiatan.'}
                        </p>
                      </div>
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Jadwal: {formatTanggal(k.target || k.tanggal)}
                        </span>
                        <button
                          title="Lihat Daftar Peserta"
                          onClick={() => setSelectedKegiatanPeserta(k)}
                          className="px-4 py-2 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm shadow-blue-600/20 inline-flex items-center space-x-1.5 cursor-pointer shrink-0"
                        >
                          <SvgUsersGroup />
                          <span>Peserta ({pesertaKegiatan.length})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. LAPORAN KEUANGAN (WARNA KARTU GRADASI SEPERTI BENDAHARA) */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-3 gap-2 sm:gap-5">
              {/* Kartu 1: Total Pemasukan (Hijau Toska) */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#249ea0] via-[#34c6c8] to-[#7ce8ea] p-2.5 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#249ea0]/30 hover:shadow-2xl hover:shadow-[#249ea0]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2 min-w-0">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Total Pemasukan
                  </p>
                  <h3 className="text-xs sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {formatRupiah(totalPemasukan)}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgArrowUp />
                </div>
              </div>

              {/* Kartu 2: Total Pengeluaran (Merah Muda / Coral) */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#e05263] via-[#f27482] to-[#fca5b0] p-2.5 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#e05263]/30 hover:shadow-2xl hover:shadow-[#e05263]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2 min-w-0">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Total Pengeluaran
                  </p>
                  <h3 className="text-xs sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {formatRupiah(totalPengeluaran)}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgArrowDown />
                </div>
              </div>

              {/* Kartu 3: Sisa Saldo Kas OSIS (Biru Langit) */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#3b72b5] via-[#4c9ae8] to-[#82c8f7] p-2.5 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#3b72b5]/30 hover:shadow-2xl hover:shadow-[#3b72b5]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2 min-w-0">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Saldo Kas Saat Ini
                  </p>
                  <h3 className="text-xs sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {formatRupiah(saldoKas)}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgKeuangan />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full">
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
                Rincian Transaksi Keuangan OSIS
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                      <th className="py-3 px-4 rounded-l-xl">Keterangan</th>
                      <th className="py-3 px-4">Jenis</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keuanganList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-12 text-center text-slate-400 font-medium">
                          Belum ada data keuangan yang dicatat Bendahara.
                        </td>
                      </tr>
                    ) : (
                      keuanganList.map((kq) => (
                        <tr key={kq.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4 text-slate-700 font-bold">
                            {kq.keterangan}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-1 font-bold text-[10px] sm:text-xs rounded-xl inline-block uppercase tracking-wider ${
                                kq.jenis === 'Pemasukan' || kq.kategori === 'Pemasukan'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {kq.jenis || kq.kategori}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-black whitespace-nowrap ${
                              kq.jenis === 'Pemasukan' || kq.kategori === 'Pemasukan'
                                ? 'text-emerald-600'
                                : 'text-rose-500'
                            }`}
                          >
                            {kq.jenis === 'Pemasukan' || kq.kategori === 'Pemasukan' ? '+' : '-'}
                            {formatRupiah(kq.jumlah || kq.nominal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL REVISI PROPOSAL */}
      {isRevisiModalOpen && selectedProposalRevisi && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-blue-100 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Catatan Revisi Proposal
              </h3>
              <button
                onClick={() => setIsRevisiModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs">
              <span className="text-slate-500 font-semibold">Judul Proposal: </span>
              <span className="font-bold text-[#2158B8]">
                {selectedProposalRevisi.judul_proposal || selectedProposalRevisi.judul}
              </span>
            </div>
            <form onSubmit={handleSubmitRevisi} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Detail Catatan Perbaikan
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tuliskan bagian proposal atau rincian anggaran yang perlu diperbaiki Sekretaris..."
                  value={catatanRevisiInput}
                  onChange={(e) => setCatatanRevisiInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/70 focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRevisiModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-[#2158B8] hover:bg-[#1B4694] shadow-lg shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
                >
                  Kirim Revisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS AVATAR */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              {confirmModal.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, type: null, title: '', message: '' })
                }
                className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirm}
                className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PESERTA KEGIATAN */}
      {selectedKegiatanPeserta && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border border-blue-100 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800 truncate pr-2">
                Daftar Peserta:{' '}
                <span className="text-[#2158B8]">
                  {selectedKegiatanPeserta.nama_proker ||
                    selectedKegiatanPeserta.namaKegiatan ||
                    selectedKegiatanPeserta.nama}
                </span>
              </h3>
              <button
                onClick={() => setSelectedKegiatanPeserta(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {getPesertaByKegiatan(selectedKegiatanPeserta).length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">
                    Belum ada peserta terdaftar.
                  </p>
                </div>
              ) : (
                getPesertaByKegiatan(selectedKegiatanPeserta).map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl text-xs border border-slate-100 flex justify-between items-start transition-all gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800">{p.namaSiswa || p.nama}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {p.kelas} | NIS: {p.nis || p.nisn || '-'}
                      </p>
                      <p className="text-slate-600 text-xs mt-1.5 font-medium bg-white p-2 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-500">Catatan/Alasan: </span>
                        {p.catatan || p.alasan || p.alasan_mengikuti || '-'}
                      </p>
                    </div>
                    <span className="text-slate-400 text-[10px] bg-white px-2.5 py-1 rounded-lg font-medium border border-slate-200/60 shrink-0">
                      {formatTanggal(p.tanggalDaftar)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOTO PROFIL PEMBINA */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-blue-100 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Kelola Foto Profil
              </h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center py-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Preview Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/30"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-tr from-[#1B4694] to-[#3A86EF] rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-md font-black text-2xl">
                  {inisialNama}
                </div>
              )}
            </div>
            <div className="space-y-3 pt-2">
              <label
                htmlFor="avatar-input-pembina"
                className="w-full py-3 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                Ganti / Unggah Foto Baru
              </label>
              <input
                id="avatar-input-pembina"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleHapusAvatar}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer border border-rose-200 active:scale-95 transition-all"
                >
                  Hapus Foto Profil
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
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
