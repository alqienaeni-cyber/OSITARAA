import { useState, useEffect, useCallback, useRef } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';
import api from '../api';

// --- KONFIGURASI API BACKEND ---
const API_BASE = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('access_token') ||
    '';
  return {
    'Content-Type': 'application/json',
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

// --- HELPER COMPONENT: ICON ---
function Icon({ type }) {
  const icons = {
    beranda: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
    keuangan: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    proposal: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    proker: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    ),
    anggota: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
    kegiatan: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    logout: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    ),
    users: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
    trash: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    ),
    send: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    ),
    income: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 11l5-5m0 0l5 5m-5-5v12"
      />
    ),
    expense: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 13l-5 5m0 0l-5-5m5 5V6"
      />
    ),
  };

  return (
    <svg
      className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {icons[type] || null}
    </svg>
  );
}

export default function DashboardBendahara({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem('ositara_bendahara_avatar') || null
  );

  // --- REF PENCEGAH TABRAKAN SYNC ---
  const isFetchingRef = useRef(false);

  // --- STATE NOTIFIKASI TOAST & MODAL KONFIRMASI CUSTOM ---
  const [toastNotif, setToastNotif] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'kas' | 'avatar'
    id: null,
    title: '',
    message: '',
  });

  const showToast = useCallback((message, type = 'success') => {
    setToastNotif({ message, type });
    setTimeout(() => {
      setToastNotif((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // --- STATE DATA MANAGEMENT ---
  const [keuanganList, setKeuanganList] = useState(() =>
    getInitialData(['ositara_keuangan', 'keuanganList'], [])
  );
  const [proposalList, setProposalList] = useState(() =>
    getInitialData(['ositara_proposal', 'proposals'], [])
  );
  const [prokerList, setProkerList] = useState(() =>
    getInitialData(['ositara_proker', 'prokerList'], [])
  );
  const [anggotaList, setAnggotaList] = useState(() =>
    getInitialData(['ositara_anggota', 'anggotaList'], [])
  );
  const [kegiatanList, setKegiatanList] = useState(() => {
    const raw = getInitialData(['ositara_kegiatan', 'kegiatanList'], []);
    return filterOnlyKegiatanSekre(raw);
  });
  const [pendaftaranList, setPendaftaranList] = useState(() =>
    getInitialData(['ositara_pendaftaran', 'pendaftaranList'], [])
  );
  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);

  // --- FORM CATAT KAS ---
  const [keterangan, setKeterangan] = useState('');
  const [sumber, setSumber] = useState('Kas OSIS');
  const [jenisTransaksi, setJenisTransaksi] = useState('Pemasukan');
  const [nominal, setNominal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- BROADCAST KE SEMUA DASHBOARD ---
  const broadcastKeuanganUpdate = (list) => {
    localStorage.setItem('ositara_keuangan', JSON.stringify(list));
    localStorage.setItem('keuanganList', JSON.stringify(list));
    window.dispatchEvent(new Event('ositara_keuangan_updated'));
    window.dispatchEvent(new Event('storage'));
  };

  // --- SINKRONISASI AKURAT DARI MYSQL & LOCALSTORAGE ---
  const handleSyncData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Fetch Program Kerja & Kegiatan
      try {
        const resProker = await fetch(`${API_BASE}/program-kerja`, {
          headers: getAuthHeaders(),
        });
        if (resProker.ok) {
          const resultPK = await resProker.json();
          const dataPK = Array.isArray(resultPK) ? resultPK : resultPK.data || [];
          const mappedPK = dataPK.map((pk) => ({
            ...pk,
            id: pk.id,
            nama_proker:
              pk.nama_proker || pk.nama_kegiatan || pk.nama || 'Tanpa Nama Kegiatan',
            namaKegiatan:
              pk.nama_proker || pk.nama_kegiatan || pk.nama || 'Tanpa Nama Kegiatan',
            target: pk.target || pk.tanggal || pk.tanggal_pelaksanaan || '-',
            tanggal: pk.target || pk.tanggal || pk.tanggal_pelaksanaan || '-',
            sekbid: pk.sekbid || pk.divisi || 'Sekretaris',
            status: pk.status || 'Mendatang',
            is_event: pk.is_event ?? 1,
          }));
          setKegiatanList(filterOnlyKegiatanSekre(mappedPK));
          setProkerList(mappedPK);
          localStorage.setItem('ositara_proker', JSON.stringify(mappedPK));
          localStorage.setItem('prokerList', JSON.stringify(mappedPK));
        }
      } catch (e) {
        console.warn('Sync proker terlewati:', e);
      }

      // 2. Fetch Proposal
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
          const resultP = await resProposal.json();
          const dataP = Array.isArray(resultP) ? resultP : resultP.data || [];
          const formattedP = dataP.map((p) => ({
            id: p.id,
            judul_proposal: p.judul_proposal || p.judul || 'Tanpa Judul',
            judul: p.judul_proposal || p.judul || 'Tanpa Judul',
            pengaju: p.pengaju || p.sekbid || p.divisi || 'Sekretaris OSIS',
            tanggal: p.tanggal_pengajuan || p.tanggal || p.created_at || '-',
            status: p.status || 'Menunggu Persetujuan',
          }));
          setProposalList(formattedP);
          localStorage.setItem('ositara_proposal', JSON.stringify(formattedP));
          localStorage.setItem('proposals', JSON.stringify(formattedP));
        }
      } catch (e) {
        console.warn('Sync proposal terlewati:', e);
      }

      // 3. Fetch Keuangan
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
          setKeuanganList(dataK);
          localStorage.setItem('ositara_keuangan', JSON.stringify(dataK));
          localStorage.setItem('keuanganList', JSON.stringify(dataK));
        }
      } catch (e) {
        console.warn('Sync keuangan terlewati:', e);
      }

      // 4. Fetch Anggota OSIS
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
            nis: a.nis || a.nisn || a.id_anggota || '-',
            nama: a.nama || a.nama_lengkap || a.nama_anggota || '-',
            jabatan: a.jabatan || 'Anggota',
            sekbid: a.sekbid || a.divisi || a.seksi_bidang || '-',
          }));
          setAnggotaList(formattedA);
          localStorage.setItem('ositara_anggota', JSON.stringify(formattedA));
          localStorage.setItem('anggotaList', JSON.stringify(formattedA));
        }
      } catch (e) {
        console.warn('Sync anggota terlewati:', e);
      }

      // 5. Fetch Pendaftaran Event
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
          const resultD = await resPendaftaran.json();
          const dataD = Array.isArray(resultD) ? resultD : resultD.data || [];
          const formattedD = dataD.map((p) => ({
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
            nis: p.nis || p.nisn || '-',
            kelas: p.kelas || '-',
            tanggalDaftar: p.tanggal_daftar || p.tanggalDaftar || '-',
          }));
          setPendaftaranList(formattedD);
          localStorage.setItem('ositara_pendaftaran', JSON.stringify(formattedD));
          localStorage.setItem('pendaftaranList', JSON.stringify(formattedD));
        }
      } catch (e) {
        console.warn('Sync pendaftaran terlewati:', e);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    handleSyncData();
    const interval = setInterval(handleSyncData, 15000);
    window.addEventListener('storage', handleSyncData);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleSyncData);
    };
  }, [handleSyncData]);

  // --- HANDLER KAS (SIMPAN KE DATABASE MYSQL + BROADCAST KE SEMUA DASHBOARD) ---
  const handleTambahKas = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!keterangan.trim() || !nominal || Number(nominal) <= 0) {
      showToast('Silakan lengkapi keterangan dan nominal yang valid!', 'warning');
      return;
    }

    setIsSubmitting(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const nominalNum = Number(nominal);

    // Payload lengkap mendukung variasi nama kolom di tabel keuangans Laravel
    const payload = {
      tanggal: todayStr,
      keterangan: keterangan.trim(),
      sumber: sumber || 'Kas OSIS',
      jenis: jenisTransaksi,
      kategori: jenisTransaksi,
      jumlah: nominalNum,
      nominal: nominalNum,
    };

    try {
      // Coba via instance api dulu, lalu fallback fetch langsung ke 127.0.0.1:8000/api/keuangan
      let resData = null;
      let isSuccess = false;

      try {
        const axiosRes = await api.post('/keuangan', payload);
        if (axiosRes && axiosRes.status >= 200 && axiosRes.status < 300) {
          resData = axiosRes.data?.data || axiosRes.data;
          isSuccess = true;
        }
      } catch {
        const res = await fetch(`${API_BASE}/keuangan`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          resData = json?.data || json;
          isSuccess = true;
        } else {
          // Tampilkan pesan error asli dari Laravel (500 / 422) supaya jelas penyebabnya
          const errText = await res.text();
          let errMsg = `HTTP ${res.status}`;
          try {
            const errJson = JSON.parse(errText);
            errMsg = errJson.message || errJson.error || errMsg;
          } catch {
            // abaikan jika bukan JSON
          }
          console.error('Detail error server POST /keuangan:', errText);
          showToast(`Gagal simpan ke database (${errMsg})`, 'warning');
        }
      }

      if (isSuccess) {
        const recordBaru = {
          id: resData?.id || Date.now(),
          ...payload,
          ...(resData && typeof resData === 'object' ? resData : {}),
        };

        const updatedList = [recordBaru, ...keuanganList];
        setKeuanganList(updatedList);
        broadcastKeuanganUpdate(updatedList);

        setKeterangan('');
        setNominal('');
        setSumber('Kas OSIS');
        showToast('Transaksi berhasil disimpan ke database!');

        // Refresh data terbaru dari MySQL
        await handleSyncData();
      }
    } catch (err) {
      console.error('Gagal menyimpan kas:', err);
      showToast('Koneksi ke server Laravel terputus.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER HAPUS KAS (BUKA MODAL KONFIRMASI CUSTOM) ---
  const handleHapusKas = (item) => {
    setConfirmModal({
      isOpen: true,
      type: 'kas',
      id: item.id,
      title: 'Hapus Catatan Transaksi?',
      message: `Apakah kamu yakin ingin menghapus transaksi "${
        item.keterangan || 'ini'
      }"? Saldo kas akan otomatis disesuaikan kembali.`,
    });
  };

  // --- HANDLER FOTO PROFIL ---
  const handleUploadAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size >= 2 * 1024 * 1024) {
        showToast('Ukuran foto terlalu besar! Maksimal 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_bendahara_avatar', reader.result);
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
      id: null,
      title: 'Hapus Foto Profil?',
      message: 'Foto profil kamu akan dikembalikan ke inisial nama default.',
    });
  };

  // --- EKSEKUSI KONFIRMASI MODAL CUSTOM ---
  const handleExecuteConfirm = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' });

    if (type === 'kas' && id) {
      const updated = keuanganList.filter((item) => String(item.id) !== String(id));
      setKeuanganList(updated);
      broadcastKeuanganUpdate(updated);
      showToast('Catatan transaksi berhasil dihapus.');

      try {
        try {
          await api.delete(`/keuangan/${id}`);
        } catch {
          await fetch(`${API_BASE}/keuangan/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
        }
        await handleSyncData();
      } catch (err) {
        console.error('Gagal menghapus transaksi di server:', err);
      }
    } else if (type === 'avatar') {
      setAvatarUrl(null);
      localStorage.removeItem('ositara_bendahara_avatar');
      setShowAvatarModal(false);
      showToast('Foto profil berhasil dihapus.');
    }
  };

  // --- PESERTA TERDAFTAR ---
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

  // --- HITUNG RINGKASAN SALDO ---
  const totalPemasukan = keuanganList
    .filter((k) => k.kategori === 'Pemasukan' || k.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + (Number(curr.jumlah || curr.nominal) || 0), 0);

  const totalPengeluaran = keuanganList
    .filter((k) => k.kategori === 'Pengeluaran' || k.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + (Number(curr.jumlah || curr.nominal) || 0), 0);

  const saldoSaatIni = totalPemasukan - totalPengeluaran;

  const namaBendahara =
    user?.namaLengkap || user?.nama || user?.name || 'Shopia Widarti Noviani';
  const inisialNama = namaBendahara.charAt(0).toUpperCase();

  const menuItems = [
    { id: 'beranda', label: 'Beranda', icon: 'beranda' },
    { id: 'catat-kas', label: 'Catat Kas & Laporan', icon: 'keuangan' },
    { id: 'proposal-masuk', label: 'Proposal Masuk', icon: 'proposal' },
    { id: 'program-kerja', label: 'Program Kerja', icon: 'proker' },
    { id: 'anggota-osis', label: 'Anggota OSIS', icon: 'anggota' },
    { id: 'kelola-kegiatan', label: 'Kelola Kegiatan', icon: 'kegiatan' },
  ];

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
      <div className="md:hidden bg-gradient-to-b from-[#1B4694] to-[#2158B8] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md w-full shrink-0 border-b border-blue-800/30">
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
              BENDAHARA OSIS
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
        className={`fixed md:relative inset-y-0 left-0 z-50 h-screen w-64 bg-gradient-to-b from-[#1B4694] via-[#2158B8] to-[#3A86EF] text-white flex flex-col justify-between p-5 shrink-0 shadow-2xl border-r border-blue-600/40 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="hidden md:flex items-center space-x-3.5 mb-8 p-1">
            <div className="relative group cursor-pointer transition-transform duration-300 hover:rotate-6">
              <img
                src={logoOsitara}
                alt="Logo OSITARA"
                className="w-10 h-10 object-contain shrink-0 transition-transform duration-300 animate-bounce drop-shadow-md"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest leading-none drop-shadow-md">
                OSITARA
              </h1>
              <p className="text-[10px] text-[#FFD43B] font-extrabold tracking-wider mt-1 uppercase drop-shadow-xs">
                BENDAHARA OSIS
              </p>
            </div>
          </div>

          <nav className="space-y-2 mt-4 md:mt-0">
            {menuItems.map((menu) => {
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
                      ? 'bg-gradient-to-r from-[#f4d875] to-[#f4d875] text-[#1B4694] shadow-lg shadow-amber-400/40 font-black translate-x-1'
                      : 'hover:bg-white/15 text-blue-50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <Icon type={menu.icon} />
                  <span className="leading-snug tracking-wide">{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* TOMBOL LOGOUT WARNA SOLID MERAH */}
        <button
          onClick={onLogout}
          className="group flex items-center space-x-3 px-4 py-3.5 text-white bg-[#E63946] hover:bg-[#D62828] border border-rose-500 rounded-2xl font-black text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer text-left shadow-lg shadow-rose-600/40 mt-8 md:mt-0"
        >
          <Icon type="logout" />
          <span className="tracking-wide">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-y-auto p-3.5 sm:p-6 lg:p-8 min-w-0 w-full space-y-4 sm:space-y-6">
        {/* HEADER USER CARD */}
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
                    alt="Avatar"
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
                  Selamat Datang, <span className="text-[#2158B8]">{namaBendahara}</span>!
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Jabatan:</span>
                  <span className="bg-blue-100/80 text-[#2158B8] font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-blue-300">
                    Bendahara OSIS
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-4 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            {/* STATS CARDS */}
            <div className="grid grid-cols-3 gap-2 sm:gap-5">
              {/* Card Pemasukan */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#2b7a69] via-[#38a88e] to-[#6ee0c5] p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#2b7a69]/30 hover:shadow-2xl hover:shadow-[#2b7a69]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight">
                    Total Pemasukan
                  </p>
                  <h3 className="text-xs sm:text-2xl font-black tracking-tight drop-shadow mt-1 truncate">
                    {formatRupiah(totalPemasukan)}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <Icon type="income" />
                </div>
              </div>

              {/* Card Pengeluaran */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#c96268] via-[#eb8288] to-[#ffafb4] p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#c96268]/30 hover:shadow-2xl hover:shadow-[#c96268]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight">
                    Total Pengeluaran
                  </p>
                  <h3 className="text-xs sm:text-2xl font-black tracking-tight drop-shadow mt-1 truncate">
                    {formatRupiah(totalPengeluaran)}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <Icon type="expense" />
                </div>
              </div>

              {/* Card Saldo Kas Saat Ini */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#3b72b5] via-[#4c9ae8] to-[#82c8f7] p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#3b72b5]/30 hover:shadow-2xl hover:shadow-[#3b72b5]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight">
                    Saldo Kas Saat Ini
                  </p>
                  <h3 className="text-xs sm:text-2xl font-black tracking-tight drop-shadow mt-1 truncate">
                    {formatRupiah(saldoSaatIni)}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <Icon type="keuangan" />
                </div>
              </div>
            </div>

            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Kas */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8]" />
                    Catatan Kas Terakhir
                  </h3>
                  <button
                    onClick={() => setActiveMenu('catat-kas')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors duration-200 cursor-pointer hover:underline"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {keuanganList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada catatan transaksi kas.
                      </p>
                    </div>
                  ) : (
                    keuanganList.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-all duration-200 hover:translate-x-1"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {item.keterangan}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {formatTanggal(item.tanggal)}
                          </p>
                        </div>
                        <span
                          className={`font-black text-xs sm:text-sm shrink-0 px-3 py-1 rounded-xl border ${
                            item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan'
                              ? 'text-emerald-700 bg-emerald-100/80 border-emerald-200'
                              : 'text-rose-600 bg-rose-100/80 border-rose-200'
                          }`}
                        >
                          {item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan'
                            ? '+'
                            : '-'}
                          {formatRupiah(item.jumlah || item.nominal)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Agenda Kegiatan */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Agenda Kegiatan OSIS
                  </h3>
                  <button
                    onClick={() => setActiveMenu('kelola-kegiatan')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors duration-200 cursor-pointer hover:underline"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {kegiatanList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada agenda kegiatan.
                      </p>
                    </div>
                  ) : (
                    kegiatanList.slice(0, 4).map((k) => (
                      <div
                        key={k.id}
                        className="p-3.5 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-all duration-200 hover:translate-x-1"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {k.nama_proker || k.namaKegiatan || k.nama}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
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

        {/* 2. CATAT KAS & LAPORAN */}
        {activeMenu === 'catat-kas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.3s_ease-out]">
            {/* TABEL LAPORAN KAS */}
            <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full">
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
                Laporan Kas Keuangan OSIS
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                      <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keuanganList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                          Belum ada catatan transaksi kas.
                        </td>
                      </tr>
                    ) : (
                      keuanganList.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                            {formatTanggal(item.tanggal)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {item.keterangan}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 font-bold text-[10px] sm:text-xs rounded-xl inline-block ${
                                item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {item.kategori || item.jenis}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-black whitespace-nowrap ${
                              item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan'
                                ? 'text-emerald-600'
                                : 'text-rose-500'
                            }`}
                          >
                            {item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan'
                              ? '+'
                              : '-'}
                            {formatRupiah(item.jumlah || item.nominal)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleHapusKas(item)}
                              className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-xs border border-rose-200"
                              title="Hapus Transaksi"
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
            </div>

            {/* KARTU FORM INPUT KAS */}
            <div className="order-first lg:order-none lg:col-span-4 bg-white rounded-3xl border border-blue-200/80 shadow-md p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-lg font-black text-slate-800 mb-5 pb-3 border-b border-slate-100">
                Input Catatan Kas
              </h3>
              <form onSubmit={handleTambahKas} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Keterangan Transaksi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pembelian spanduk..."
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/80 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Sumber Dana
                  </label>
                  <select
                    value={sumber}
                    onChange={(e) => setSumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent cursor-pointer transition-all shadow-xs"
                  >
                    <option value="Kas OSIS">Kas OSIS</option>
                    <option value="Dana Sekolah">Dana Sekolah</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Jenis Transaksi
                  </label>
                  <select
                    value={jenisTransaksi}
                    onChange={(e) => setJenisTransaksi(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent cursor-pointer transition-all shadow-xs"
                  >
                    <option value="Pemasukan">Pemasukan (+)</option>
                    <option value="Pengeluaran">Pengeluaran (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Nominal Transaksi (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/80 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 mt-6 ${
                    isSubmitting
                      ? 'bg-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-[#2158B8] hover:bg-[#1B4694] shadow-blue-600/30 active:scale-95 cursor-pointer'
                  }`}
                >
                  <Icon type="send" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi Kas'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. PROPOSAL MASUK */}
        {activeMenu === 'proposal-masuk' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Daftar Pengajuan Proposal
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Judul Proposal</th>
                    <th className="py-3 px-4">Pengaju</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada pengajuan proposal.
                      </td>
                    </tr>
                  ) : (
                    proposalList.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {item.judul_proposal || item.judul || item.nama}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.pengaju || item.sekbid || item.divisi || 'Sekretaris OSIS'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {formatTanggal(item.tanggal || item.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-3 py-1 font-bold text-[10px] sm:text-xs rounded-xl inline-block ${
                              item.status === 'Disetujui' || item.status === 'Diterima'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : item.status === 'Ditolak'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.status || 'Menunggu Persetujuan'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PROGRAM KERJA */}
        {activeMenu === 'program-kerja' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Program Kerja OSIS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Nama Program Kerja</th>
                    <th className="py-3 px-4">Divisi Pelaksana</th>
                    <th className="py-3 px-4 rounded-r-xl">Target Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prokerList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada program kerja terdaftar.
                      </td>
                    </tr>
                  ) : (
                    prokerList.map((pk) => (
                      <tr key={pk.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {pk.nama_proker || pk.namaKegiatan || pk.nama}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {pk.divisi || pk.sekbid || '-'}
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

        {/* 5. ANGGOTA OSIS */}
        {activeMenu === 'anggota-osis' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Daftar Anggota OSIS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">NISN/NIS</th>
                    <th className="py-3 px-4">Nama Anggota</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4 rounded-r-xl">Divisi/Sekbid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggotaList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada data anggota.
                      </td>
                    </tr>
                  ) : (
                    anggotaList.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {item.nis || item.nisn || '-'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {item.nama || item.nama_lengkap || item.nama_anggota || '-'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {item.jabatan || 'Anggota'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.sekbid || item.divisi || item.seksi_bidang || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. KELOLA KEGIATAN */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Daftar Kegiatan OSIS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Nama Kegiatan</th>
                    <th className="py-3 px-4">Tanggal Pelaksanaan</th>
                    <th className="py-3 px-4">Penanggung Jawab</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kegiatanList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada kegiatan terdaftar dari Sekretaris.
                      </td>
                    </tr>
                  ) : (
                    kegiatanList.map((k) => {
                      const pesertaKegiatan = getPesertaByKegiatan(k);
                      return (
                        <tr key={k.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {k.nama_proker || k.namaKegiatan || k.nama}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            {formatTanggal(k.target || k.tanggal)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {k.sekbid || k.divisi || 'Sekretaris'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-1 font-bold text-[10px] sm:text-xs rounded-xl inline-block ${
                                k.status === 'Selesai'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-100 text-[#2158B8] border border-blue-200'
                              }`}
                            >
                              {k.status || 'Mendatang'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setSelectedKegiatanPeserta(k)}
                              className="px-3.5 py-1.5 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-xl text-xs font-bold inline-flex items-center space-x-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                            >
                              <Icon type="users" />
                              <span>Peserta ({pesertaKegiatan.length})</span>
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
      </main>

      {/* MODAL KONFIRMASI HAPUS CUSTOM */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#c96268] to-[#ffafb4] text-white flex items-center justify-center shadow-lg shadow-[#c96268]/30">
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
                  setConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' })
                }
                className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirm}
                className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#c96268] to-[#eb8288] hover:opacity-95 shadow-lg shadow-[#c96268]/30 transition-all active:scale-95 cursor-pointer"
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
            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
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
                    className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl text-xs border border-slate-100 flex justify-between items-center transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{p.namaSiswa || p.nama}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {p.kelas} | NIS: {p.nis || p.nisn || '-'}
                      </p>
                    </div>
                    <span className="text-slate-400 text-[10px] bg-white px-2.5 py-1 rounded-lg font-medium border border-slate-200/60">
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
                <div className="w-20 h-20 bg-gradient-to-tr from-[#1B4694] to-[#3A86EF] rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-md font-black text-2xl">
                  {inisialNama}
                </div>
              )}
            </div>
            <div className="space-y-3 pt-2">
              <label
                htmlFor="avatar-file-input-bendahara"
                className="w-full py-3 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                <span>Ganti / Unggah Foto Baru</span>
              </label>
              <input
                id="avatar-file-input-bendahara"
                type="file"
                accept="image/*"
                onChange={handleUploadAvatar}
                className="hidden"
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleHapusAvatar}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer border border-rose-200 active:scale-95 transition-all"
                >
                  <span>Hapus Foto Profil</span>
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
