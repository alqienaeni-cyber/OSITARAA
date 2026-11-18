import { useState, useEffect, useCallback, useRef } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';
import PanelKeuanganReadOnly from './PanelKeuanganReadOnly';

// --- KONFIGURASI API BACKEND ---
const API_BASE = '/api';

const getAuthHeaders = () => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('access_token') ||
    '';
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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

// --- NORMALISASI ITEM KEUANGAN AGAR SINKRON 100% DENGAN BENDAHARA ---
const normalizeKeuanganItem = (item) => {
  if (!item || typeof item !== 'object') return item;

  const rawJenis = String(
    item.jenis ??
      item.tipe ??
      item.type ??
      item.jenis_transaksi ??
      item.jenisTransaksi ??
      item.alur ??
      item.kategori_transaksi ??
      item.kategori ??
      ''
  )
    .toLowerCase()
    .trim();

  const rawNominal = Number(
    item.nominal ?? item.jumlah ?? item.amount ?? item.nilai ?? 0
  );

  const isPengeluaran =
    rawJenis.includes('keluar') ||
    rawJenis === 'expense' ||
    rawJenis === 'out' ||
    rawJenis === 'debit' ||
    rawJenis === 'kredit' ||
    rawNominal < 0;

  const jenisNormalized = isPengeluaran ? 'Pengeluaran' : 'Pemasukan';
  const nominalAbs = Math.abs(rawNominal);

  return {
    ...item,
    jenis: jenisNormalized,
    tipe: jenisNormalized,
    kategori: jenisNormalized,
    jenis_transaksi: jenisNormalized,
    nominal: nominalAbs,
    jumlah: nominalAbs,
    sumber_dana:
      item.sumber_dana || item.sumberDana || item.sumber || 'Kas OSIS',
    sumberDana:
      item.sumberDana || item.sumber_dana || item.sumber || 'Kas OSIS',
    keterangan:
      item.keterangan || item.uraian || item.deskripsi || item.judul || '-',
    tanggal:
      item.tanggal || item.tanggal_transaksi || item.created_at || '-',
    bukti_nota:
      item.bukti_nota ||
      item.buktiNota ||
      item.bukti ||
      item.nota ||
      item.file_bukti ||
      null,
  };
};

const normalizeKeuanganList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeKeuanganItem);
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

const getInitialData = (keys, fallback) => {
  const keyList = Array.isArray(keys) ? keys : [keys];
  for (const key of keyList) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Lanjut cek key berikutnya
    }
  }
  return fallback;
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
  keuanganList: propKeuanganList,
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

  // --- STATE DOWNLOAD BERKAS PROPOSAL ---
  const [downloadingId, setDownloadingId] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToastNotif({ message, type });
    setTimeout(() => {
      setToastNotif((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  // --- STATES DATA UTAMA ---
  const [proposalList, setProposalList] = useState(() =>
    getInitialData(['ositara_proposal', 'proposals'], initialProposal)
  );

  const [prokerList, setProkerList] = useState(() => {
    const raw = getInitialData(['ositara_proker', 'prokerList'], initialProker);
    return filterOnlyProkerKetua(raw);
  });

  const [kegiatanList, setKegiatanList] = useState(() => {
    const raw = getInitialData(['ositara_kegiatan', 'kegiatanList'], initialKegiatan);
    return filterOnlyKegiatanSekre(raw);
  });

  const [keuanganList, setKeuanganList] = useState(() => {
    const raw =
      Array.isArray(propKeuanganList) && propKeuanganList.length > 0
        ? propKeuanganList
        : getInitialData(
            ['ositara_keuangan_list', 'ositara_keuangan', 'keuanganList'],
            initialKeuangan
          );
    return normalizeKeuanganList(raw);
  });

  useEffect(() => {
    if (Array.isArray(propKeuanganList)) {
      setKeuanganList(normalizeKeuanganList(propKeuanganList));
    }
  }, [propKeuanganList]);

  const [anggotaList, setAnggotaList] = useState(() =>
    getInitialData(['ositara_anggota', 'anggotaList'], initialAnggota)
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

  // --- KUNCI SCROLL BODY SAAT SIDEBAR MOBILE TERBUKA ---
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // --- SINKRONISASI SEMUA DATA DARI BACKEND MYSQL & LOCAL STORAGE ---
  const syncAllDataFromBackend = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      // 1. Sync Proposal
      try {
        let resProposal = await fetch(`${API_BASE}/proposals`, {
          headers: getAuthHeaders(),
        });
        if (!resProposal.ok) {
          resProposal = await fetch(`${API_BASE}/proposal-kegiatan`, {
            headers: getAuthHeaders(),
          });
        }
        if (resProposal.ok) {
          const result = await resProposal.json();
          const dataArr = Array.isArray(result) ? result : result.data || [];
          const formatted = dataArr.map((p) => {
            const rawFile =
              p.file_path ||
              p.path ||
              p.file_proposal ||
              p.fileProposal ||
              p.berkas ||
              p.file ||
              p.lampiran ||
              p.dokumen ||
              null;
            const fileNameFix =
              p.nama_file ||
              p.original_name ||
              p.file_name ||
              (rawFile ? String(rawFile).split('/').pop() : null) ||
              'Dokumen.pdf';
            return {
              ...p,
              id: p.id,
              judul_proposal: p.judul_proposal || p.judul || 'Tanpa Judul',
              judul: p.judul_proposal || p.judul || 'Tanpa Judul',
              kategori: p.kategori || 'Kegiatan',
              anggaran: Number(p.anggaran) || 0,
              file: rawFile,
              file_path: p.file_path || p.path || null,
              file_proposal: rawFile,
              nama_file: fileNameFix,
              file_url: p.file_url || p.url || p.fileUrl || null,
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
          headers: getAuthHeaders(),
        });
        if (!resAnggota.ok) {
          resAnggota = await fetch(`${API_BASE}/anggota`, {
            headers: getAuthHeaders(),
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
          headers: getAuthHeaders(),
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

      // 4. Sync Keuangan (Sinkron dengan Backend & LocalStorage Bendahara + Normalisasi)
      try {
        let resKeuangan = await fetch(`${API_BASE}/keuangan`, {
          headers: getAuthHeaders(),
        });
        if (!resKeuangan.ok) {
          resKeuangan = await fetch(`${API_BASE}/laporan-keuangan`, {
            headers: getAuthHeaders(),
          });
        }
        if (resKeuangan.ok) {
          const resultK = await resKeuangan.json();
          const dataK = Array.isArray(resultK) ? resultK : resultK.data || [];
          const normalizedK = normalizeKeuanganList(dataK);
          setKeuanganList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(normalizedK) ? normalizedK : prev
          );
          localStorage.setItem('ositara_keuangan_list', JSON.stringify(normalizedK));
          localStorage.setItem('ositara_keuangan', JSON.stringify(normalizedK));
          localStorage.setItem('keuanganList', JSON.stringify(normalizedK));
        } else {
          const localK = getInitialData(
            ['ositara_keuangan_list', 'ositara_keuangan', 'keuanganList'],
            null
          );
          if (Array.isArray(localK)) {
            const normalizedLocal = normalizeKeuanganList(localK);
            setKeuanganList((prev) =>
              JSON.stringify(prev) !== JSON.stringify(normalizedLocal)
                ? normalizedLocal
                : prev
            );
          }
        }
      } catch (e) {
        console.warn('Sync keuangan terlewati:', e);
        const localK = getInitialData(
          ['ositara_keuangan_list', 'ositara_keuangan', 'keuanganList'],
          null
        );
        if (Array.isArray(localK)) {
          setKeuanganList(normalizeKeuanganList(localK));
        }
      }

      // 5. Sync Pendaftaran
      try {
        let resPendaftaran = await fetch(`${API_BASE}/pendaftaran-event`, {
          headers: getAuthHeaders(),
        });
        if (!resPendaftaran.ok) {
          resPendaftaran = await fetch(`${API_BASE}/pendaftaran`, {
            headers: getAuthHeaders(),
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

  const syncKeuanganImmediate = useCallback((e) => {
    if (e?.detail && Array.isArray(e.detail)) {
      const normalized = normalizeKeuanganList(e.detail);
      setKeuanganList(normalized);
      localStorage.setItem('ositara_keuangan_list', JSON.stringify(normalized));
      localStorage.setItem('ositara_keuangan', JSON.stringify(normalized));
      localStorage.setItem('keuanganList', JSON.stringify(normalized));
      return;
    }
    const localK = getInitialData(
      ['ositara_keuangan_list', 'ositara_keuangan', 'keuanganList'],
      null
    );
    if (Array.isArray(localK)) {
      setKeuanganList(normalizeKeuanganList(localK));
    }
  }, []);

  useEffect(() => {
    syncAllDataFromBackend();
    const interval = setInterval(syncAllDataFromBackend, 5000);
    window.addEventListener('storage', syncAllDataFromBackend);
    window.addEventListener('ositara_proposal_updated', syncAllDataFromBackend);
    window.addEventListener('ositara_keuangan_updated', syncKeuanganImmediate);
    window.addEventListener('ositara-keuangan-updated', syncKeuanganImmediate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncAllDataFromBackend);
      window.removeEventListener('ositara_proposal_updated', syncAllDataFromBackend);
      window.removeEventListener('ositara_keuangan_updated', syncKeuanganImmediate);
      window.removeEventListener('ositara-keuangan-updated', syncKeuanganImmediate);
    };
  }, [syncAllDataFromBackend, syncKeuanganImmediate]);

  // --- HELPER BUKA & UNDUH BERKAS PROPOSAL LANGSUNG ---
  const handleBukaUnduhProposal = async (item) => {
    const serverFile =
      item.file_url ||
      item.url ||
      item.fileUrl ||
      item.file_path ||
      item.path ||
      item.file_proposal ||
      item.fileProposal ||
      item.berkas ||
      item.file ||
      item.lampiran ||
      item.dokumen;

    if (!serverFile || serverFile === 'Tidak ada berkas') {
      showToast('Berkas proposal tidak ditemukan.', 'warning');
      return;
    }

    const downloadLabelName =
      item.nama_file ||
      item.original_name ||
      String(serverFile).split('/').pop() ||
      `Proposal_${item.judul_proposal || item.judul || 'OSIS'}.pdf`;

    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const triggerDownloadAndOpenBlob = (blob) => {
      const blobUrl = URL.createObjectURL(blob);
      if (isMobileDevice) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = downloadLabelName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        reader.readAsDataURL(blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = downloadLabelName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    if (String(serverFile).startsWith('data:')) {
      try {
        const res = await fetch(serverFile);
        const blob = await res.blob();
        triggerDownloadAndOpenBlob(blob);
        showToast(`Berkas "${downloadLabelName}" berhasil dibuka & diunduh!`);
        return;
      } catch {
        window.open(serverFile, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    const rawStr = String(serverFile)
      .replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/+/, '');
    const cleanFilename = rawStr.split('/').pop();
    const altFilename = item.nama_file ? String(item.nama_file).split('/').pop() : null;

    const candidateUrls = [
      ...(String(serverFile).startsWith('http') ? [String(serverFile)] : []),
      `${API_BASE}/download-proposal/${encodeURIComponent(cleanFilename)}`,
      ...(altFilename && altFilename !== cleanFilename
        ? [`${API_BASE}/download-proposal/${encodeURIComponent(altFilename)}`]
        : []),
      `${API_BASE}/proposals/${item.id}/download`,
      `/storage/${rawStr}`,
      `/storage/proposals/${encodeURIComponent(cleanFilename)}`,
      `/uploads/proposals/${encodeURIComponent(cleanFilename)}`,
      `/${rawStr}`,
    ];

    setDownloadingId(item.id || cleanFilename);
    try {
      const headers = getAuthHeaders();
      for (const url of candidateUrls) {
        try {
          const response = await fetch(url, { headers });
          if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('text/html') && !contentType.includes('application/json')) {
              const blob = await response.blob();
              triggerDownloadAndOpenBlob(blob);
              showToast(`Berkas "${downloadLabelName}" berhasil dibuka & diunduh!`);
              return;
            }
          }
        } catch {
          // Lanjut coba URL kandidat berikutnya
        }
      }
      showToast(
        'File fisik berkas tidak ada di server (terhapus saat deploy ulang, silakan unggah ulang proposal).',
        'warning'
      );
    } finally {
      setDownloadingId(null);
    }
  };

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
        : '';

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
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/proposal-kegiatan/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
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

  // --- KALKULASI KEUANGAN (DARI DATA YANG SUDAH DINORMALISASI) ---
  const totalPemasukan = keuanganList
    .filter((k) => String(k.jenis || '').toLowerCase() === 'pemasukan')
    .reduce((acc, cur) => acc + Number(cur.nominal || cur.jumlah || 0), 0);

  const totalPengeluaran = keuanganList
    .filter((k) => String(k.jenis || '').toLowerCase() === 'pengeluaran')
    .reduce((acc, cur) => acc + Number(cur.nominal || cur.jumlah || 0), 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const ketuaOsisData = anggotaList.find(
    (a) =>
      String(a.jabatan || '').toLowerCase().includes('ketua') &&
      !String(a.jabatan || '').toLowerCase().includes('wakil')
  );
  const bendaharaData = anggotaList.find((a) =>
    String(a.jabatan || '').toLowerCase().includes('bendahara')
  );

  const namaKetuaUntukLaporan = ketuaOsisData?.nama || 'Ketua OSIS';
  const namaBendaharaUntukLaporan = bendaharaData?.nama || 'Bendahara OSIS';

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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100/90 font-sans text-slate-800 selection:bg-[#2158B8] selection:text-white">
      {/* NOTIFIKASI TOAST MELAYANG */}
      {toastNotif && (
        <div className="fixed top-4 right-3 left-3 sm:left-auto z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-[fadeIn_0.2s_ease-out] sm:max-w-sm">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm ${
              toastNotif.type === 'warning'
                ? 'bg-gradient-to-br from-[#c7852e] to-[#ffd27d]'
                : 'bg-gradient-to-br from-[#2158B8] to-[#3A86EF]'
            }`}
          >
            {toastNotif.type === 'warning' ? '!' : '✓'}
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug break-words">
            {toastNotif.message}
          </p>
        </div>
      )}

      {/* HEADER NAVBAR MOBILE */}
      <header className="md:hidden bg-gradient-to-r from-[#184694] to-[#2158B8] text-white px-3.5 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md w-full border-b border-blue-800/30">
        <div className="flex items-center space-x-2.5 min-w-0">
          <img
            src={logoOsitara}
            alt="Logo OSITARA"
            className="w-7 h-7 object-contain shrink-0 drop-shadow"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <div className="min-w-0">
            <h1 className="text-sm font-black tracking-widest leading-none drop-shadow-sm truncate">
              OSITARA
            </h1>
            <p className="text-[9px] text-[#FFD43B] font-extrabold tracking-wider uppercase mt-0.5 truncate">
              PEMBINA OSIS
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all border border-white/15 focus:outline-none cursor-pointer shrink-0"
          aria-label="Buka Menu Navigasi"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </header>

      {/* OVERLAY MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-sm transition-all animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        style={{ height: '100dvh', maxHeight: '100vh' }}
        className={`fixed top-0 left-0 z-50 w-64 max-w-[78vw] bg-gradient-to-b from-[#184694] via-[#2158B8] to-[#3A86EF] text-white flex flex-col px-3.5 pt-3.5 pb-24 md:p-5 shadow-2xl border-r border-blue-600/40 transition-transform duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-5 p-1 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <img
              src={logoOsitara}
              alt="Logo OSITARA"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0 drop-shadow-md"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black tracking-widest leading-none drop-shadow-md truncate">
                OSITARA
              </h1>
              <p className="text-[9px] sm:text-[10px] text-[#FFD43B] font-extrabold tracking-wider mt-1 uppercase truncate">
                PEMBINA OSIS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer shrink-0"
            aria-label="Tutup Menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto space-y-1 sm:space-y-1.5 pr-0.5">
          {menuList.map((menu) => {
            const IconComp = menu.IconComponent;
            const isActive = activeMenu === menu.id;
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => {
                  setActiveMenu(menu.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`group w-full flex items-center justify-between px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#f4d875] text-[#184694] shadow-md font-black'
                    : 'hover:bg-white/15 text-blue-50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <IconComp />
                  <span className="truncate tracking-wide">{menu.label}</span>
                </div>
                {menu.id === 'persetujuan-proposal' && proposalMenungguCount > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                      isActive
                        ? 'bg-[#184694] text-[#FFD43B]'
                        : 'bg-[#FFD43B] text-[#184694]'
                    }`}
                  >
                    {proposalMenungguCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-2.5 mt-2 shrink-0 border-t border-white/15">
          <button
            type="button"
            onClick={onLogout}
            className="w-full group flex items-center space-x-3 px-3.5 py-2.5 text-white bg-[#E63946] hover:bg-[#D62828] border border-rose-500 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer text-left shadow-lg shadow-rose-600/40"
          >
            <SvgLogout />
            <span className="tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="md:ml-64 w-full md:w-auto max-w-full overflow-x-hidden px-3 pt-3 pb-24 sm:p-6 lg:p-8 min-w-0 space-y-3.5 sm:space-y-6">
        {/* HEADER PROFIL PEMBINA */}
        <div className="relative overflow-hidden bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90 transition-all duration-300 hover:shadow-md">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#2158B8]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between min-w-0 w-full relative z-10">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div
                onClick={() => setShowAvatarModal(true)}
                className="relative group cursor-pointer shrink-0"
                title="Klik untuk ubah foto profil"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profil Pembina"
                    className="w-11 h-11 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/40 group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#184694] to-[#3A86EF] flex items-center justify-center text-white border-2 border-white shadow-md ring-2 ring-blue-500/30 rounded-2xl font-black text-base sm:text-2xl group-hover:scale-105 transition-all duration-300">
                    {inisialNama}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all duration-300 shadow-inner">
                  Ubah
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-2xl font-black text-slate-800 leading-snug break-words">
                  Selamat Datang, <span className="text-[#2158B8]">{namaDisplay}</span>!
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                  <span>Peran Akses:</span>
                  <span className="bg-blue-100/80 text-[#2158B8] font-black px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider border border-blue-300">
                    PEMBINA OSIS
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. BERANDA UTAMA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-3.5 sm:space-y-6 animate-[fadeIn_0.3s_ease-out] min-w-0">
            {/* STATS CARDS - 2 KOLOM DI HP, 4 KOLOM DI LAYAR LEBAR */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {/* Kartu 1: Menunggu Persetujuan */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#c7852e] via-[#ebaa46] to-[#ffd27d] p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md shadow-[#c7852e]/25 hover:-translate-y-0.5 transition-all duration-300 text-white group flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-white/95 uppercase tracking-wide leading-tight truncate">
                    Perlu Persetujuan
                  </p>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 truncate">
                    {proposalMenungguCount}
                  </h3>
                </div>
                <div className="flex w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 border border-white/30">
                  <SvgProposal />
                </div>
              </div>

              {/* Kartu 2: Proposal Disetujui */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#3b72b5] via-[#4c9ae8] to-[#82c8f7] p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md shadow-[#3b72b5]/25 hover:-translate-y-0.5 transition-all duration-300 text-white group flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-white/95 uppercase tracking-wide leading-tight truncate">
                    Proposal Disetujui
                  </p>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 truncate">
                    {proposalDisetujuiCount}
                  </h3>
                </div>
                <div className="flex w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 border border-white/30">
                  <SvgCheck />
                </div>
              </div>

              {/* Kartu 3: Total Program Kerja */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#e05263] via-[#f27482] to-[#fca5b0] p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md shadow-[#e05263]/25 hover:-translate-y-0.5 transition-all duration-300 text-white group flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-white/95 uppercase tracking-wide leading-tight truncate">
                    Program Kerja
                  </p>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 truncate">
                    {prokerList.length}
                  </h3>
                </div>
                <div className="flex w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 border border-white/30">
                  <SvgProker />
                </div>
              </div>

              {/* Kartu 4: Saldo Kas OSIS */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#249ea0] via-[#34c6c8] to-[#7ce8ea] p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md shadow-[#249ea0]/25 hover:-translate-y-0.5 transition-all duration-300 text-white group flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-white/95 uppercase tracking-wide leading-tight truncate">
                    Saldo Kas OSIS
                  </p>
                  <h3 className="text-xs sm:text-xl font-black tracking-tight drop-shadow mt-0.5 truncate">
                    {formatRupiah(saldoKas)}
                  </h3>
                </div>
                <div className="flex w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 border border-white/30">
                  <SvgKeuangan />
                </div>
              </div>
            </div>

            {/* RINGKASAN PROPOSAL & AGENDA TERBARU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-6 min-w-0">
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm min-w-0">
                <div className="flex justify-between items-center gap-2 mb-4 pb-2.5 border-b border-slate-100">
                  <h3 className="text-sm sm:text-lg font-black text-slate-800 flex items-center gap-2 min-w-0 truncate">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate">Pengajuan Proposal Terbaru</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('persetujuan-proposal')}
                    className="text-[11px] sm:text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors cursor-pointer shrink-0"
                  >
                    Kelola Semua &rarr;
                  </button>
                </div>
                <div className="space-y-2.5">
                  {proposalList.length === 0 ? (
                    <div className="text-center py-7 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada proposal diajukan oleh pengurus.
                      </p>
                    </div>
                  ) : (
                    proposalList.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 min-w-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {p.judul_proposal || p.judul}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                            {formatRupiah(p.anggaran)}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-extrabold rounded-xl shrink-0 uppercase tracking-wider ${
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

              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm min-w-0">
                <div className="flex justify-between items-center gap-2 mb-4 pb-2.5 border-b border-slate-100">
                  <h3 className="text-sm sm:text-lg font-black text-slate-800 flex items-center gap-2 min-w-0 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#2158B8] shrink-0" />
                    <span className="truncate">Agenda Kegiatan OSIS</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('kegiatan')}
                    className="text-[11px] sm:text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors cursor-pointer shrink-0"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>
                <div className="space-y-2.5">
                  {kegiatanList.length === 0 ? (
                    <div className="text-center py-7 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada agenda kegiatan OSIS.
                      </p>
                    </div>
                  ) : (
                    kegiatanList.slice(0, 4).map((k) => (
                      <div
                        key={k.id}
                        className="p-3 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 min-w-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {k.nama_proker || k.namaKegiatan || k.nama}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {formatTanggal(k.target || k.tanggal)}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-extrabold rounded-xl shrink-0 uppercase tracking-wider ${
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

        {/* 2. PERSETUJUAN PROPOSAL */}
        {activeMenu === 'persetujuan-proposal' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm min-w-0 w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-lg font-black text-slate-800">
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
            <div className="w-full overflow-x-auto pb-1">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] sm:text-[11px] bg-slate-100/70">
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
                    proposalList.map((p, idx) => {
                      const hasFile = Boolean(
                        p.file_url ||
                          p.url ||
                          p.fileUrl ||
                          p.file_path ||
                          p.path ||
                          p.file_proposal ||
                          p.fileProposal ||
                          p.berkas ||
                          p.file ||
                          p.lampiran ||
                          p.dokumen
                      );
                      const fileDisplayName =
                        p.nama_file ||
                        p.original_name ||
                        (p.file_proposal ? String(p.file_proposal).split('/').pop() : null) ||
                        (p.file ? String(p.file).split('/').pop() : null) ||
                        'Unduh Berkas';
                      const isDownloadingThis = downloadingId === (p.id || fileDisplayName);

                      return (
                        <tr key={p.id || idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {p.judul_proposal || p.judul || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-semibold whitespace-nowrap">
                            {formatRupiah(p.anggaran)}
                          </td>
                          <td className="py-3.5 px-4">
                            {hasFile && fileDisplayName !== 'Tidak ada berkas' ? (
                              <button
                                type="button"
                                onClick={() => handleBukaUnduhProposal(p)}
                                disabled={isDownloadingThis}
                                title={`Klik untuk membuka & mengunduh ${fileDisplayName}`}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-[#2158B8] hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer max-w-[155px]"
                              >
                                <SvgDownload />
                                <span className="truncate">
                                  {isDownloadingThis ? 'Membuka...' : fileDisplayName}
                                </span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs italic">
                                Tidak ada berkas
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-1 font-bold text-[10px] sm:text-xs rounded-xl inline-block uppercase tracking-wider whitespace-nowrap ${
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
                              type="button"
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
                              type="button"
                              onClick={() => handleOpenRevisiModal(p)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <SvgEdit />
                              <span>Revisi</span>
                            </button>
                            <button
                              type="button"
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
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm min-w-0 w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-lg font-black text-slate-800">
                Program Kerja OSIS
              </h3>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold">
                Mode Pantau
              </span>
            </div>
            <div className="w-full overflow-x-auto pb-1">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[460px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] sm:text-[11px] bg-slate-100/70">
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
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm min-w-0 w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-lg font-black text-slate-800">
                Daftar Pengurus & Anggota OSIS
              </h3>
              <span className="bg-blue-50 text-[#2158B8] border border-blue-200 px-3 py-1 rounded-full text-xs font-extrabold">
                {anggotaList.length} Anggota
              </span>
            </div>
            <div className="w-full overflow-x-auto pb-1">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] sm:text-[11px] bg-slate-100/70">
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
                        <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
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
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm w-full min-w-0 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8] shrink-0" />
              <h3 className="text-sm sm:text-lg font-black text-slate-800 truncate">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {kegiatanList.map((k) => {
                  const pesertaKegiatan = getPesertaByKegiatan(k);
                  return (
                    <div
                      key={k.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 min-w-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2.5 mb-2">
                          <h4 className="font-black text-slate-800 text-sm sm:text-lg leading-snug break-words min-w-0">
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
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 break-words">
                          {k.deskripsi || 'Tidak ada deskripsi kegiatan.'}
                        </p>
                      </div>
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">
                          Jadwal: {formatTanggal(k.target || k.tanggal)}
                        </span>
                        <button
                          type="button"
                          title="Lihat Daftar Peserta"
                          onClick={() => setSelectedKegiatanPeserta(k)}
                          className="px-3.5 py-2 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm shadow-blue-600/20 inline-flex items-center space-x-1.5 cursor-pointer shrink-0"
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

        {/* 6. LAPORAN KEUANGAN (READ-ONLY + CETAK PDF TERSINKRON BENDAHARA) */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="animate-[fadeIn_0.3s_ease-out] min-w-0">
            <PanelKeuanganReadOnly
              keuanganList={keuanganList}
              namaKetuaOsis={namaKetuaUntukLaporan}
              namaBendahara={namaBendaharaUntukLaporan}
            />
          </div>
        )}
      </main>

      {/* MODAL REVISI PROPOSAL */}
      {isRevisiModalOpen && selectedProposalRevisi && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border border-blue-100 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Catatan Revisi Proposal
              </h3>
              <button
                type="button"
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
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 text-center animate-[scaleIn_0.2s_ease-out]">
            <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              <svg
                className="w-7 h-7"
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
            <div className="flex items-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, type: null, title: '', message: '' })
                }
                className="flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirm}
                className="flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PESERTA KEGIATAN */}
      {selectedKegiatanPeserta && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-6 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-lg rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5 border border-blue-100 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-2">
              <h3 className="text-sm sm:text-lg font-black text-slate-800 truncate pr-2">
                Daftar Peserta:{' '}
                <span className="text-[#2158B8]">
                  {selectedKegiatanPeserta.nama_proker ||
                    selectedKegiatanPeserta.namaKegiatan ||
                    selectedKegiatanPeserta.nama}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedKegiatanPeserta(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
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
                    className="p-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl text-xs border border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 break-words">
                        {p.namaSiswa || p.nama}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {p.kelas} | NIS: {p.nis || p.nisn || '-'}
                      </p>
                      <p className="text-slate-600 text-xs mt-1.5 font-medium bg-white p-2 rounded-xl border border-slate-100 break-words">
                        <span className="font-bold text-slate-500">Catatan/Alasan: </span>
                        {p.catatan || p.alasan || p.alasan_mengikuti || '-'}
                      </p>
                    </div>
                    <span className="text-slate-400 text-[10px] bg-white px-2.5 py-1 rounded-lg font-medium border border-slate-200/60 self-start shrink-0">
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
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border border-blue-100 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-lg font-black text-slate-800">
                Kelola Foto Profil
              </h3>
              <button
                type="button"
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
                <div className="w-20 h-20 bg-gradient-to-tr from-[#184694] to-[#3A86EF] rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-md font-black text-2xl">
                  {inisialNama}
                </div>
              )}
            </div>
            <div className="space-y-2.5 pt-1">
              <label
                htmlFor="avatar-input-pembina"
                className="w-full py-2.5 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
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
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer border border-rose-200 active:scale-95 transition-all"
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
