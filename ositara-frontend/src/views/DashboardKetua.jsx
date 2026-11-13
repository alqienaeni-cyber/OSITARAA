import { useState, useEffect, useCallback, useRef } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';
import api from '../api';

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

// --- DEKLARASI IKON SVG ---
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

const SvgEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const SvgTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const SvgUsersGroup = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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

const SvgPlus = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
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

// Helper mencoba endpoint via instance `api` (axios dengan baseURL & token Sanctum)
const requestFirstAvailable = async (method, endpoints, payload = null) => {
  for (const endpoint of endpoints) {
    try {
      let res;
      if (method === 'get') res = await api.get(endpoint);
      else if (method === 'post') res = await api.post(endpoint, payload);
      else if (method === 'put') res = await api.put(endpoint, payload);
      else if (method === 'delete') res = await api.delete(endpoint);

      if (res && res.status >= 200 && res.status < 300) {
        return res;
      }
    } catch {
      // Coba endpoint cadangan berikutnya
    }
  }
  return null;
};

// Filter khusus Program Kerja Ketua/Wakil OSIS (mengecualikan agenda kegiatan Sekretaris)
const filterOnlyProkerKetua = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item) =>
      String(item.is_event) !== '1' &&
      String(item.sekbid || item.divisi || '').toLowerCase().trim() !== 'sekretaris'
  );
};

// Filter khusus Kegiatan OSIS yang diinput Sekretaris
const filterOnlyKegiatanSekre = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item) =>
      String(item.is_event) === '1' ||
      String(item.sekbid || item.divisi || '').toLowerCase().trim() === 'sekretaris'
  );
};

export default function DashboardKetua({
  user,
  onLogout,
  initialProker = [],
  initialAnggota = [],
  initialProposal = [],
  initialKegiatan = [],
  initialPendaftaran = [],
  initialKeuangan = [],
}) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFetchingRef = useRef(false);

  // --- STATE NOTIFIKASI TOAST & MODAL KONFIRMASI CUSTOM ---
  const [toastNotif, setToastNotif] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'avatar' | 'proker' | 'anggota'
    targetId: null,
    title: '',
    message: '',
  });

  const showToast = useCallback((message, type = 'success') => {
    setToastNotif({ message, type });
    setTimeout(() => {
      setToastNotif((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // --- STATES DATA UTAMA ---
  const [prokerList, setProkerList] = useState(() => {
    const raw = getInitialData(['ositara_proker', 'prokerList'], initialProker);
    return filterOnlyProkerKetua(raw);
  });

  const [anggotaList, setAnggotaList] = useState(() =>
    getInitialData(['ositara_anggota', 'anggotaList'], initialAnggota)
  );

  const [proposalList, setProposalList] = useState(() =>
    getInitialData(['ositara_proposal', 'proposals'], initialProposal)
  );

  const [kegiatanList, setKegiatanList] = useState(() => {
    const raw = getInitialData(['ositara_kegiatan', 'kegiatanList'], initialKegiatan);
    return filterOnlyKegiatanSekre(raw);
  });

  const [pendaftaranList, setPendaftaranList] = useState(() =>
    getInitialData(['ositara_pendaftaran', 'pendaftaranList'], initialPendaftaran)
  );

  const [keuanganList, setKeuanganList] = useState(() =>
    getInitialData(['ositara_keuangan', 'keuanganList'], initialKeuangan)
  );

  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem('ositara_user_avatar') || null
  );
  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isSubmittingProker, setIsSubmittingProker] = useState(false);
  const [isSubmittingAnggota, setIsSubmittingAnggota] = useState(false);

  const namaDisplay =
    user?.namaLengkap || user?.nama || user?.name || user?.username || 'Ketua/Wakil OSIS';
  const inisialNama = namaDisplay.charAt(0).toUpperCase();

  // --- SINKRONISASI KE SEMUA KEY LOCALSTORAGE & EVENT GLOBAL APP.JSX ---
  const syncProkerToAllDashboards = (list) => {
    localStorage.setItem('ositara_proker', JSON.stringify(list));
    localStorage.setItem('prokerList', JSON.stringify(list));
    window.dispatchEvent(new Event('ositara_proker_updated'));
    window.dispatchEvent(new Event('storage'));
  };

  const syncAnggotaToAllDashboards = (list) => {
    localStorage.setItem('ositara_anggota', JSON.stringify(list));
    localStorage.setItem('anggotaList', JSON.stringify(list));
    window.dispatchEvent(new Event('ositara_anggota_updated'));
    window.dispatchEvent(new Event('storage'));
  };

  // --- SINKRONISASI SEMUA DATA DARI BACKEND MYSQL ---
  const syncAllDataFromBackend = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Sync Program Kerja & Kegiatan (Events)
      try {
        const resProker = await requestFirstAvailable('get', [
          '/program-kerja',
          '/program_kerja',
          '/prokers',
          '/proker',
        ]);
        if (resProker) {
          const dataPK = Array.isArray(resProker.data)
            ? resProker.data
            : resProker.data?.data || [];
          const onlyProker = filterOnlyProkerKetua(dataPK);
          setProkerList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(onlyProker) ? onlyProker : prev
          );
          localStorage.setItem('ositara_proker', JSON.stringify(onlyProker));
          localStorage.setItem('prokerList', JSON.stringify(onlyProker));

          const onlyKegFromPK = filterOnlyKegiatanSekre(dataPK);
          if (onlyKegFromPK.length > 0) {
            setKegiatanList(onlyKegFromPK);
            localStorage.setItem('ositara_kegiatan', JSON.stringify(onlyKegFromPK));
            localStorage.setItem('kegiatanList', JSON.stringify(onlyKegFromPK));
          }
        }

        // Ambil juga langsung dari /events (endpoint resmi di App.jsx)
        const resEvents = await requestFirstAvailable('get', ['/events', '/kegiatan']);
        if (resEvents) {
          const dataEv = Array.isArray(resEvents.data)
            ? resEvents.data
            : resEvents.data?.data || [];
          if (dataEv.length > 0) {
            setKegiatanList((prev) =>
              JSON.stringify(prev) !== JSON.stringify(dataEv) ? dataEv : prev
            );
            localStorage.setItem('ositara_kegiatan', JSON.stringify(dataEv));
            localStorage.setItem('kegiatanList', JSON.stringify(dataEv));
          }
        }
      } catch (e) {
        console.warn('Sync proker/events terlewati:', e);
      }

      // 2. Sync Anggota OSIS
      try {
        const resAnggota = await requestFirstAvailable('get', [
          '/pengurus-osis',
          '/pengurus_osis',
          '/anggota-osis',
          '/anggotas',
          '/anggota',
        ]);
        if (resAnggota) {
          const dataA = Array.isArray(resAnggota.data)
            ? resAnggota.data
            : resAnggota.data?.data || [];
          const formattedA = dataA.map((a) => ({
            id: a.id,
            nis: a.nis || a.nisn || '-',
            nama: a.nama || a.nama_lengkap || a.name || '-',
            jabatan: a.jabatan || '-',
            sekbid: a.sekbid || a.divisi || '-',
            kelas: a.kelas || '-',
            status: a.status || 'Aktif',
          }));
          setAnggotaList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(formattedA) ? formattedA : prev
          );
          localStorage.setItem('ositara_anggota', JSON.stringify(formattedA));
          localStorage.setItem('anggotaList', JSON.stringify(formattedA));
        }
      } catch (e) {
        console.warn('Sync anggota terlewati:', e);
      }

      // 3. Sync Proposal (Read-Only untuk Ketua/Wakil OSIS)
      try {
        const resProposal = await requestFirstAvailable('get', [
          '/proposals',
          '/proposal',
          '/proposal-kegiatan',
        ]);
        if (resProposal) {
          const dataArr = Array.isArray(resProposal.data)
            ? resProposal.data
            : resProposal.data?.data || [];
          const baseApiUrl = (api.defaults?.baseURL || '/api').replace(/\/$/, '');
          const formatted = dataArr.map((p) => {
            const fileNameFix = p.file_proposal || p.fileProposal || p.file || 'Dokumen.pdf';
            const fileUrlFix =
              p.fileUrl ||
              p.file_url ||
              `${baseApiUrl}/download-proposal/${encodeURIComponent(fileNameFix)}`;
            return {
              id: p.id,
              judul_proposal: p.judul_proposal || p.judul || 'Tanpa Judul',
              judul: p.judul_proposal || p.judul || 'Tanpa Judul',
              kategori: p.kategori || 'Kegiatan',
              anggaran: Number(p.anggaran) || 0,
              file: fileNameFix,
              fileProposal: fileNameFix,
              fileData: fileUrlFix,
              file_url: fileUrlFix,
              tanggal: p.tanggal_pengajuan || p.tanggal || '-',
              status: p.status || 'Menunggu Persetujuan',
              catatan_revisi:
                p.catatan_pembina || p.catatan_revisi || p.catatanRevisi || p.catatan || '-',
              catatan_pembina:
                p.catatan_pembina || p.catatan_revisi || p.catatanRevisi || p.catatan || '-',
            };
          });
          setProposalList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(formatted) ? formatted : prev
          );
          localStorage.setItem('ositara_proposal', JSON.stringify(formatted));
          localStorage.setItem('proposals', JSON.stringify(formatted));
        }
      } catch (e) {
        console.warn('Sync proposal terlewati:', e);
      }

      // 4. Sync Keuangan (Read-Only untuk Ketua/Wakil OSIS)
      try {
        const resKeuangan = await requestFirstAvailable('get', [
          '/keuangans',
          '/keuangan',
          '/laporan-keuangan',
          '/kas',
        ]);
        if (resKeuangan) {
          const dataK = Array.isArray(resKeuangan.data)
            ? resKeuangan.data
            : resKeuangan.data?.data || [];
          setKeuanganList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(dataK) ? dataK : prev
          );
          localStorage.setItem('ositara_keuangan', JSON.stringify(dataK));
          localStorage.setItem('keuanganList', JSON.stringify(dataK));
        }
      } catch (e) {
        console.warn('Sync keuangan terlewati:', e);
      }

      // 5. Sync Pendaftaran Peserta Kegiatan (Read-Only untuk Ketua/Wakil OSIS)
      try {
        const resPendaftaran = await requestFirstAvailable('get', [
          '/pendaftarans',
          '/pendaftaran',
          '/pendaftaran-event',
          '/event-registrations',
        ]);
        if (resPendaftaran) {
          const dataP = Array.isArray(resPendaftaran.data)
            ? resPendaftaran.data
            : resPendaftaran.data?.data || [];
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
              namaSiswa: p.nama_siswa || p.namaSiswa || p.nama || '-',
              nama: p.nama_siswa || p.namaSiswa || p.nama || '-',
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
          localStorage.setItem('pendaftaranList', JSON.stringify(formattedP));
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
    const interval = setInterval(syncAllDataFromBackend, 10000);
    window.addEventListener('storage', syncAllDataFromBackend);
    window.addEventListener('ositara_proposal_updated', syncAllDataFromBackend);
    window.addEventListener('ositara_keuangan_updated', syncAllDataFromBackend);
    window.addEventListener('ositara_pendaftaran_updated', syncAllDataFromBackend);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncAllDataFromBackend);
      window.removeEventListener('ositara_proposal_updated', syncAllDataFromBackend);
      window.removeEventListener('ositara_keuangan_updated', syncAllDataFromBackend);
      window.removeEventListener('ositara_pendaftaran_updated', syncAllDataFromBackend);
    };
  }, [syncAllDataFromBackend]);

  // --- HANDLER FOTO PROFIL ---
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
        localStorage.setItem('ositara_user_avatar', reader.result);
        setShowAvatarModal(false);
        showToast('Foto profil berhasil diperbarui!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusAvatar = () => {
    setConfirmModal({
      isOpen: true,
      type: 'avatar',
      targetId: null,
      title: 'Hapus Foto Profil?',
      message: 'Foto profil Anda akan dikembalikan ke inisial nama default.',
    });
  };

  // --- HANDLER KELOLA PROGRAM KERJA (CRUD + DATABASE MYSQL + SYNC SEMUA DASHBOARD) ---
  const [editingProkerId, setEditingProkerId] = useState(null);
  const [namaProker, setNamaProker] = useState('');
  const [divisiProker, setDivisiProker] = useState('');
  const [targetProker, setTargetProker] = useState('');

  const handleSubmitProker = async (e) => {
    e.preventDefault();
    if (!namaProker.trim() || !divisiProker.trim() || !targetProker) {
      showToast('Semua field Program Kerja wajib diisi!', 'warning');
      return;
    }

    setIsSubmittingProker(true);
    const currentEditId = editingProkerId;

    const payload = {
      nama_proker: namaProker.trim(),
      nama: namaProker.trim(),
      divisi: divisiProker.trim(),
      sekbid: divisiProker.trim(),
      penanggungjawab: divisiProker.trim(),
      target: targetProker,
      tanggal: targetProker,
      status: 'Berjalan',
      is_event: 0,
    };

    try {
      const endpoints = currentEditId
        ? [
            `/program-kerja/${currentEditId}`,
            `/program_kerja/${currentEditId}`,
            `/prokers/${currentEditId}`,
            `/proker/${currentEditId}`,
          ]
        : ['/program-kerja', '/program_kerja', '/prokers', '/proker'];

      const res = await requestFirstAvailable(currentEditId ? 'put' : 'post', endpoints, payload);

      if (res) {
        const savedRecord = res.data?.data || res.data || { id: Date.now(), ...payload };
        const updated = currentEditId
          ? prokerList.map((item) =>
              String(item.id) === String(currentEditId) ? { ...item, ...savedRecord } : item
            )
          : [savedRecord, ...prokerList];

        setProkerList(updated);
        syncProkerToAllDashboards(updated);
        await syncAllDataFromBackend();

        showToast(
          currentEditId
            ? 'Program kerja berhasil diperbarui di database!'
            : 'Program kerja baru berhasil masuk ke database!'
        );
      } else {
        const tempItem = { id: currentEditId || Date.now(), ...payload };
        const updated = currentEditId
          ? prokerList.map((item) =>
              String(item.id) === String(currentEditId) ? tempItem : item
            )
          : [tempItem, ...prokerList];

        setProkerList(updated);
        syncProkerToAllDashboards(updated);
        showToast(
          'Tersimpan lokal & tersinkron ke browser, tapi route POST program-kerja di backend belum ditemukan (404).',
          'warning'
        );
      }

      setEditingProkerId(null);
      setNamaProker('');
      setDivisiProker('');
      setTargetProker('');
    } catch (err) {
      console.error('Gagal menyimpan program kerja:', err);
      showToast('Terjadi kesalahan koneksi server saat menyimpan.', 'warning');
    } finally {
      setIsSubmittingProker(false);
    }
  };

  const handleHapusProker = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'proker',
      targetId: id,
      title: 'Hapus Program Kerja?',
      message: 'Data program kerja ini akan dihapus dari database OSIS.',
    });
  };

  // --- HANDLER KELOLA ANGGOTA OSIS (CRUD + DATABASE MYSQL + SYNC SEMUA DASHBOARD) ---
  const [editingAnggotaId, setEditingAnggotaId] = useState(null);
  const [nisAnggota, setNisAnggota] = useState('');
  const [namaAnggota, setNamaAnggota] = useState('');
  const [jabatanAnggota, setJabatanAnggota] = useState('');
  const [sekbidAnggota, setSekbidAnggota] = useState('');

  const handleSubmitAnggota = async (e) => {
    e.preventDefault();
    if (
      !nisAnggota.trim() ||
      !namaAnggota.trim() ||
      !jabatanAnggota.trim() ||
      !sekbidAnggota.trim()
    ) {
      showToast('Semua data anggota wajib diisi!', 'warning');
      return;
    }

    setIsSubmittingAnggota(true);
    const currentEditId = editingAnggotaId;

    const payload = {
      nis: nisAnggota.trim(),
      nisn: nisAnggota.trim(),
      nama: namaAnggota.trim(),
      nama_lengkap: namaAnggota.trim(),
      jabatan: jabatanAnggota.trim(),
      sekbid: sekbidAnggota.trim(),
      divisi: sekbidAnggota.trim(),
      kelas: sekbidAnggota.trim(),
      status: 'Aktif',
    };

    try {
      const endpoints = currentEditId
        ? [
            `/pengurus-osis/${currentEditId}`,
            `/pengurus_osis/${currentEditId}`,
            `/anggota-osis/${currentEditId}`,
            `/anggotas/${currentEditId}`,
            `/anggota/${currentEditId}`,
          ]
        : ['/pengurus-osis', '/pengurus_osis', '/anggota-osis', '/anggotas', '/anggota'];

      const res = await requestFirstAvailable(currentEditId ? 'put' : 'post', endpoints, payload);

      if (res) {
        const savedRecord = res.data?.data || res.data || { id: Date.now(), ...payload };
        const updated = currentEditId
          ? anggotaList.map((item) =>
              String(item.id) === String(currentEditId) ? { ...item, ...savedRecord } : item
            )
          : [savedRecord, ...anggotaList];

        setAnggotaList(updated);
        syncAnggotaToAllDashboards(updated);
        await syncAllDataFromBackend();

        showToast(
          currentEditId
            ? 'Data anggota OSIS berhasil diperbarui di database!'
            : 'Anggota OSIS baru berhasil masuk ke database!'
        );
      } else {
        const tempItem = { id: currentEditId || Date.now(), ...payload };
        const updated = currentEditId
          ? anggotaList.map((item) =>
              String(item.id) === String(currentEditId) ? tempItem : item
            )
          : [tempItem, ...anggotaList];

        setAnggotaList(updated);
        syncAnggotaToAllDashboards(updated);
        showToast(
          'Tersimpan lokal & tersinkron ke browser, tapi route POST anggota di backend belum ditemukan (404).',
          'warning'
        );
      }

      setEditingAnggotaId(null);
      setNisAnggota('');
      setNamaAnggota('');
      setJabatanAnggota('');
      setSekbidAnggota('');
    } catch (err) {
      console.error('Gagal menyimpan anggota:', err);
      showToast('Terjadi kesalahan koneksi server saat menyimpan.', 'warning');
    } finally {
      setIsSubmittingAnggota(false);
    }
  };

  const handleHapusAnggota = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'anggota',
      targetId: id,
      title: 'Hapus Anggota OSIS?',
      message: 'Data pengurus OSIS ini akan dihapus dari database sistem.',
    });
  };

  // --- EKSEKUSI KONFIRMASI HAPUS (MODAL CUSTOM) ---
  const handleExecuteConfirm = async () => {
    const { type, targetId } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, targetId: null, title: '', message: '' });

    if (type === 'avatar') {
      setAvatarUrl(null);
      localStorage.removeItem('ositara_user_avatar');
      setShowAvatarModal(false);
      showToast('Foto profil berhasil dihapus.');
      return;
    }

    if (type === 'proker' && targetId) {
      const updated = prokerList.filter((p) => String(p.id) !== String(targetId));
      setProkerList(updated);
      syncProkerToAllDashboards(updated);

      const res = await requestFirstAvailable('delete', [
        `/program-kerja/${targetId}`,
        `/program_kerja/${targetId}`,
        `/prokers/${targetId}`,
        `/proker/${targetId}`,
      ]);

      if (res) {
        await syncAllDataFromBackend();
        showToast('Program kerja berhasil dihapus dari database.');
      } else {
        showToast('Program kerja dihapus dari tampilan lokal.', 'warning');
      }
      return;
    }

    if (type === 'anggota' && targetId) {
      const updated = anggotaList.filter((a) => String(a.id) !== String(targetId));
      setAnggotaList(updated);
      syncAnggotaToAllDashboards(updated);

      const res = await requestFirstAvailable('delete', [
        `/pengurus-osis/${targetId}`,
        `/pengurus_osis/${targetId}`,
        `/anggota-osis/${targetId}`,
        `/anggotas/${targetId}`,
        `/anggota/${targetId}`,
      ]);

      if (res) {
        await syncAllDataFromBackend();
        showToast('Anggota OSIS berhasil dihapus dari database.');
      } else {
        showToast('Anggota OSIS dihapus dari tampilan lokal.', 'warning');
      }
    }
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

  // --- MENU SIDEBAR KETUA/WAKIL OSIS ---
  const menuList = [
    { id: 'beranda', label: 'Beranda Utama', IconComponent: SvgHome },
    { id: 'program-kerja', label: 'Program Kerja', IconComponent: SvgProker },
    { id: 'anggota-osis', label: 'Anggota OSIS', IconComponent: SvgAnggota },
    { id: 'pengajuan-proposal', label: 'Data Proposal', IconComponent: SvgProposal },
    { id: 'kegiatan', label: 'Kegiatan OSIS', IconComponent: SvgKegiatan },
    { id: 'laporan-keuangan', label: 'Laporan Keuangan', IconComponent: SvgKeuangan },
  ];

  const baseApiUrl = (api.defaults?.baseURL || '/api').replace(/\/$/, '');

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-100/90 font-sans text-slate-800 overflow-hidden selection:bg-[#2158B8] selection:text-white">
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

      {/* HEADER NAVBAR MOBILE */}
      <div className="md:hidden bg-gradient-to-b from-[#184694] to-[#2158B8] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md w-full shrink-0 border-b border-blue-800/30">
        <div className="flex items-center space-x-3">
          <div className="p-1">
            <img
              src={logoOsitara}
              alt="Logo OSITARA"
              className="w-7 h-7 object-contain cursor-pointer hover:scale-110 transition-transform duration-300 drop-shadow"
              onError={(e) => (e.target.style.display = 'none')}
            />
          </div>
          <div>
            <h1 className="text-base font-black tracking-widest leading-none drop-shadow-sm">
              OSITARA
            </h1>
            <p className="text-[9px] text-[#FFD43B] font-extrabold tracking-wider uppercase mt-0.5">
              KETUA/WAKIL OSIS
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all border border-white/15 focus:outline-none cursor-pointer"
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
      </div>

      {/* OVERLAY MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-sm transition-all animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 h-screen w-64 bg-gradient-to-b from-[#184694] via-[#2158B8] to-[#3A86EF] text-white flex flex-col justify-between p-5 shrink-0 shadow-2xl border-r border-blue-600/40 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="hidden md:flex items-center space-x-3.5 mb-8 p-1">
            <div className="relative group cursor-pointer transition-transform duration-300 hover:rotate-6">
              <img
                src={logoOsitara}
                alt="Logo OSITARA"
                className="w-10 h-10 object-contain shrink-0 animate-bounce transition-transform duration-300 drop-shadow-md"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest leading-none drop-shadow-md">
                OSITARA
              </h1>
              <p className="text-[10px] text-[#FFD43B] font-extrabold tracking-wider mt-1 uppercase drop-shadow-xs">
                KETUA/WAKIL OSIS
              </p>
            </div>
          </div>

          <nav className="space-y-2 mt-4 md:mt-0">
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
                  className={`group w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-95 cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f4d875] to-[#f4d875] text-[#184694] shadow-lg shadow-amber-400/40 font-black translate-x-1'
                      : 'hover:bg-white/15 text-blue-50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <IconComp />
                  <span className="truncate tracking-wide">{menu.label}</span>
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
      <main className="flex-1 h-screen overflow-y-auto p-3.5 sm:p-6 lg:p-8 min-w-0 w-full space-y-4 sm:space-y-6">
        {/* HEADER PROFIL KETUA/WAKIL OSIS */}
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
                    alt="Profil"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/40 group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#184694] to-[#3A86EF] flex items-center justify-center text-white border-2 border-white shadow-md ring-2 ring-blue-500/30 rounded-2xl font-black text-lg sm:text-2xl group-hover:scale-105 transition-all duration-300">
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
                  <span>Jabatan:</span>
                  <span className="bg-blue-100/80 text-[#2158B8] font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-blue-300">
                    KETUA/WAKIL OSIS
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. BERANDA UTAMA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-4 sm:space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {/* STATS CARDS - SEJAJAR 4 KOLOM DI MOBILE & DESKTOP */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-5">
              {/* Kartu 1: Program Kerja */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#3b72b5] via-[#4c9ae8] to-[#82c8f7] p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#3b72b5]/30 hover:shadow-2xl hover:shadow-[#3b72b5]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2 min-w-0">
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

              {/* Kartu 2: Anggota OSIS */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#e05263] via-[#f27482] to-[#fca5b0] p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#e05263]/30 hover:shadow-2xl hover:shadow-[#e05263]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2 min-w-0">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Anggota OSIS
                  </p>
                  <h3 className="text-sm sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {anggotaList.length}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgAnggota />
                </div>
              </div>

              {/* Kartu 3: Total Proposal */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#c7852e] via-[#ebaa46] to-[#ffd27d] p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#c7852e]/30 hover:shadow-2xl hover:shadow-[#c7852e]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2 min-w-0">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Total Proposal
                  </p>
                  <h3 className="text-sm sm:text-2xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {proposalList.length}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgProposal />
                </div>
              </div>

              {/* Kartu 4: Saldo Kas */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#249ea0] via-[#34c6c8] to-[#7ce8ea] p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-lg shadow-[#249ea0]/30 hover:shadow-2xl hover:shadow-[#249ea0]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1 sm:gap-2 min-w-0">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight truncate">
                    Saldo Kas
                  </p>
                  <h3 className="text-xs sm:text-xl font-black tracking-tight drop-shadow mt-0.5 sm:mt-1 truncate">
                    {formatRupiah(saldoKas)}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <SvgKeuangan />
                </div>
              </div>
            </div>

            {/* RINGKASAN PROGRAM KERJA & ANGGOTA TERBARU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8]" />
                    Program Kerja Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveMenu('program-kerja')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors duration-200 cursor-pointer hover:underline"
                  >
                    Kelola &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {prokerList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada data program kerja.
                      </p>
                    </div>
                  ) : (
                    prokerList.slice(0, 4).map((pk) => (
                      <div
                        key={pk.id}
                        className="p-3.5 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 transition-all duration-200 hover:translate-x-1"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {pk.nama_proker || pk.nama}
                          </p>
                          <p className="text-[11px] text-[#2158B8] font-semibold mt-0.5">
                            {pk.divisi || pk.sekbid || 'Umum'}
                          </p>
                        </div>
                        <span className="px-3 py-1 text-[10px] font-extrabold rounded-xl shrink-0 bg-blue-100 text-[#2158B8] border border-blue-200">
                          {formatTanggal(pk.target || pk.tanggal)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Pengurus / Anggota OSIS
                  </h3>
                  <button
                    onClick={() => setActiveMenu('anggota-osis')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors duration-200 cursor-pointer hover:underline"
                  >
                    Kelola &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {anggotaList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada data anggota OSIS.
                      </p>
                    </div>
                  ) : (
                    anggotaList.slice(0, 4).map((a) => (
                      <div
                        key={a.id}
                        className="p-3.5 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 transition-all duration-200 hover:translate-x-1"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {a.nama}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            NIS: {a.nis || '-'} • {a.sekbid || a.divisi || a.kelas || '-'}
                          </p>
                        </div>
                        <span className="px-3 py-1 text-[10px] font-extrabold rounded-xl shrink-0 uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                          {a.jabatan || 'Anggota'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. KELOLA PROGRAM KERJA (CRUD KHUSUS KETUA/WAKIL OSIS) */}
        {activeMenu === 'program-kerja' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.3s_ease-out]">
            <div className="order-2 lg:order-1 lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full">
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
                Daftar Program Kerja OSIS
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[520px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                      <th className="py-3 px-4 rounded-l-xl">Program Kerja</th>
                      <th className="py-3 px-4">Divisi / Sekbid</th>
                      <th className="py-3 px-4 text-center">Target Pelaksanaan</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prokerList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                          Belum ada data program kerja yang ditambahkan.
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
                          <td className="py-3.5 px-4 text-center text-slate-600 font-medium whitespace-nowrap">
                            {formatTanggal(pk.target || pk.tanggal)}
                          </td>
                          <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                            <button
                              title="Edit Program Kerja"
                              onClick={() => {
                                const rawDate = String(pk.target || pk.tanggal || '').split('T')[0];
                                setEditingProkerId(pk.id);
                                setNamaProker(pk.nama_proker || pk.nama);
                                setDivisiProker(pk.divisi || pk.sekbid || '');
                                setTargetProker(rawDate);
                              }}
                              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-200 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
                            >
                              <SvgEdit />
                            </button>
                            <button
                              title="Hapus Program Kerja"
                              onClick={() => handleHapusProker(pk.id)}
                              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all duration-200 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
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

            <div className="order-1 lg:order-2 lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  {editingProkerId ? 'Edit Program Kerja' : 'Tambah Program Kerja'}
                </h3>
                {editingProkerId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProkerId(null);
                      setNamaProker('');
                      setDivisiProker('');
                      setTargetProker('');
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitProker} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Nama Program Kerja
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Classmeeting Akhir Semester"
                    value={namaProker}
                    onChange={(e) => setNamaProker(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/70 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Divisi / Sekbid Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sekbid Olahraga & Seni"
                    value={divisiProker}
                    onChange={(e) => setDivisiProker(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/70 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Target Pelaksanaan
                  </label>
                  <input
                    type="date"
                    required
                    value={targetProker}
                    onChange={(e) => setTargetProker(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/70 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingProker}
                  className="w-full py-3 bg-[#2158B8] hover:bg-[#1B4694] disabled:opacity-60 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  <SvgPlus />
                  <span>
                    {editingProkerId ? 'Simpan Perubahan' : 'Simpan Program Kerja'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. KELOLA ANGGOTA OSIS (CRUD KHUSUS KETUA/WAKIL OSIS) */}
        {activeMenu === 'anggota-osis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.3s_ease-out]">
            <div className="order-2 lg:order-1 lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full">
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
                Daftar Pengurus & Anggota OSIS
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[560px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                      <th className="py-3 px-4 rounded-l-xl">NIS</th>
                      <th className="py-3 px-4">Nama Anggota</th>
                      <th className="py-3 px-4">Jabatan</th>
                      <th className="py-3 px-4">Divisi / Sekbid</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {anggotaList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                          Belum ada data anggota OSIS terdaftar.
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
                          <td className="py-3.5 px-4 text-[#2158B8] font-medium">
                            {a.sekbid || a.divisi || a.kelas || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                            <button
                              title="Edit Anggota"
                              onClick={() => {
                                setEditingAnggotaId(a.id);
                                setNisAnggota(a.nis || '');
                                setNamaAnggota(a.nama || '');
                                setJabatanAnggota(a.jabatan || '');
                                setSekbidAnggota(a.sekbid || a.divisi || a.kelas || '');
                              }}
                              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-200 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
                            >
                              <SvgEdit />
                            </button>
                            <button
                              title="Hapus Anggota"
                              onClick={() => handleHapusAnggota(a.id)}
                              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all duration-200 active:scale-95 shadow-sm inline-flex items-center cursor-pointer"
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

            <div className="order-1 lg:order-2 lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  {editingAnggotaId ? 'Edit Anggota OSIS' : 'Tambah Anggota OSIS'}
                </h3>
                {editingAnggotaId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAnggotaId(null);
                      setNisAnggota('');
                      setNamaAnggota('');
                      setJabatanAnggota('');
                      setSekbidAnggota('');
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitAnggota} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    NIS Siswa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 232410085"
                    value={nisAnggota}
                    onChange={(e) => setNisAnggota(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/70 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rafi Pratama"
                    value={namaAnggota}
                    onChange={(e) => setNamaAnggota(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/70 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Koordinator / Anggota"
                    value={jabatanAnggota}
                    onChange={(e) => setJabatanAnggota(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/70 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Divisi / Sekbid
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sekbid Humas & Publikasi"
                    value={sekbidAnggota}
                    onChange={(e) => setSekbidAnggota(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/70 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingAnggota}
                  className="w-full py-3 bg-[#2158B8] hover:bg-[#1B4694] disabled:opacity-60 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  <SvgPlus />
                  <span>
                    {editingAnggotaId ? 'Simpan Perubahan' : 'Simpan Anggota'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. DATA PROPOSAL (READ-ONLY UNTUK KETUA/WAKIL OSIS) */}
        {activeMenu === 'pengajuan-proposal' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Daftar Proposal Kegiatan OSIS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Judul Proposal</th>
                    <th className="py-3 px-4">Anggaran</th>
                    <th className="py-3 px-4">Berkas</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-xl">Catatan Pembina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada proposal yang diajukan Sekretaris.
                      </td>
                    </tr>
                  ) : (
                    proposalList.map((p) => {
                      const fileDisplayName =
                        p.file || p.fileName || p.fileProposal || p.file_proposal || 'Dokumen.pdf';
                      const downloadUrl =
                        p.fileUrl ||
                        p.file_url ||
                        `${baseApiUrl}/download-proposal/${encodeURIComponent(fileDisplayName)}`;
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
                          <td className="py-3.5 px-4 text-slate-600 text-xs italic">
                            {p.catatan_revisi || p.catatan_pembina || p.catatanRevisi || '-'}
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

        {/* 5. KEGIATAN OSIS (READ-ONLY + LIHAT PESERTA UNTUK KETUA/WAKIL OSIS) */}
        {activeMenu === 'kegiatan' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8]" />
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Daftar Kegiatan Sekolah Tersedia
              </h3>
            </div>
            {kegiatanList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Belum ada agenda kegiatan yang ditambahkan Sekretaris.
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
                          className="px-4 py-2 bg-[#2158B8] hover:bg-[#184694] text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm shadow-blue-600/20 inline-flex items-center space-x-1.5 cursor-pointer shrink-0"
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

        {/* 6. LAPORAN KEUANGAN (READ-ONLY + 3 KARTU RINGKASAN GRADASI) */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-3 gap-2 sm:gap-5">
              {/* Kartu 1: Total Pemasukan */}
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

              {/* Kartu 2: Total Pengeluaran */}
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

              {/* Kartu 3: Saldo Kas Saat Ini */}
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
                Laporan Keuangan OSIS
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
                          Belum ada data keuangan.
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

      {/* MODAL KONFIRMASI CUSTOM */}
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
                  setConfirmModal({
                    isOpen: false,
                    type: null,
                    targetId: null,
                    title: '',
                    message: '',
                  })
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

      {/* MODAL FOTO PROFIL */}
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
                <div className="w-20 h-20 bg-gradient-to-tr from-[#184694] to-[#3A86EF] rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-md font-black text-2xl">
                  {inisialNama}
                </div>
              )}
            </div>
            <div className="space-y-3 pt-2">
              <label
                htmlFor="avatar-input-ketua"
                className="w-full py-3 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                Ganti / Unggah Foto Baru
              </label>
              <input
                id="avatar-input-ketua"
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
