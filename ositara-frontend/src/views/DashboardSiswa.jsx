import React, { useState, useEffect, useCallback, useRef } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// --- KONFIGURASI API BACKEND
const API_BASE = 'http://127.0.0.1:8000/api';

// --- HELPER UTILS & FORMATTER
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

const getInitialData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + performance.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// --- DEKLARASI IKON SVG
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
    kegiatan: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    riwayat: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
    bell: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    ),
    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
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

export default function DashboardSiswa({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- REF PENCEGAH TABRAKAN SYNC
  const isFetchingRef = useRef(false);

  // --- STATE NOTIFIKASI TOAST & MODAL KONFIRMASI CUSTOM
  const [toastNotif, setToastNotif] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'pendaftaran' | 'avatar'
    id: null,
    title: '',
    message: '',
  });

  const showToast = useCallback((message, type = 'success') => {
    setToastNotif({ message, type });
    setTimeout(() => {
      setToastNotif((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  // --- HELPER FILTER STRICT
  const filterOnlyProkerKetua = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item) =>
        String(item.is_event) !== '1' &&
        String(item.sekbid || item.divisi || '').toLowerCase().trim() !== 'sekretaris'
    );
  };

  const filterOnlyKegiatanSekre = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item) =>
        String(item.is_event) === '1' ||
        String(item.sekbid || item.divisi || '').toLowerCase().trim() === 'sekretaris'
    );
  };

  // --- STATES UTAMA
  const [prokerList, setProkerList] = useState(() => {
    const raw = getInitialData('ositara_proker', []);
    return filterOnlyProkerKetua(raw);
  });
  const [kegiatanList, setKegiatanList] = useState(() => {
    const raw = getInitialData('ositara_kegiatan', []);
    return filterOnlyKegiatanSekre(raw);
  });
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const primary = getInitialData('ositara_pendaftaran', null);
    const secondary = getInitialData('pendaftaranList', []);
    return primary || secondary || [];
  });

  // --- STATE PROFIL & AVATAR
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem('ositara_siswa_avatar') || null
  );
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // --- STATE MODAL FORM PENDAFTARAN
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [nisInput, setNisInput] = useState('');
  const [kelasInput, setKelasInput] = useState('');
  const [catatanInput, setCatatanInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const namaUser =
    user?.namaLengkap || user?.nama || user?.name || user?.username || 'Siswa OSITARA';
  const inisialNama = namaUser.charAt(0).toUpperCase();

  // Filter riwayat pendaftaran siswa aktif
  const pendaftaranSaya = pendaftaranList.filter(
    (p) =>
      p.namasiswa === namaUser ||
      p.namaSiswa === namaUser ||
      p.nama === namaUser
  );

  // --- SINKRONISASI PEMISAHAN HAK AKSES & FETCH DATA
  const handleSync = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. FETCH PROGRAM KERJA (READ ONLY DARI KETUA)
      try {
        const res = await fetch(`${API_BASE}/program-kerja`, {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : data.data || [];
          const prokerKetuaOnly = filterOnlyProkerKetua(arr);
          setProkerList((prev) =>
            JSON.stringify(prev) !== JSON.stringify(prokerKetuaOnly)
              ? prokerKetuaOnly
              : prev
          );
        }
      } catch (e) {
        console.error('Gagal fetch proker Ketua:', e);
      }

      // 2. FETCH KEGIATAN SEKOLAH (DARI SEKRETARIS OSIS)
      try {
        let res = await fetch(`${API_BASE}/kegiatan`, {
          headers: { Accept: 'application/json' },
        });
        let arrKegiatan = [];
        if (res.ok) {
          const data = await res.json();
          arrKegiatan = Array.isArray(data) ? data : data.data || [];
        }
        if (arrKegiatan.length === 0) {
          const res2 = await fetch(`${API_BASE}/program-kerja`, {
            headers: { Accept: 'application/json' },
          });
          if (res2.ok) {
            const data2 = await res2.json();
            const arr2 = Array.isArray(data2) ? data2 : data2.data || [];
            arrKegiatan = filterOnlyKegiatanSekre(arr2);
          }
        } else {
          arrKegiatan = filterOnlyKegiatanSekre(arrKegiatan);
        }

        const formatted = arrKegiatan.map((item) => {
          const realTitle =
            item.nama_kegiatan ||
            item.nama_proker ||
            item.nama_event ||
            item.nama ||
            item.title;
          return {
            id: item.id,
            namaKegiatan: realTitle,
            nama: realTitle,
            tanggal: item.tanggal || item.target || item.date || '-',
            deskripsi: item.deskripsi || item.description || '',
          };
        });

        setKegiatanList((prev) =>
          JSON.stringify(prev) !== JSON.stringify(formatted) ? formatted : prev
        );
      } catch (e) {
        console.error('Gagal fetch kegiatan Sekretaris:', e);
      }

      // 3. FETCH PENDAFTARAN SISWA FROM MYSQL
      try {
        let res = await fetch(`${API_BASE}/pendaftaran-event`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          res = await fetch(`${API_BASE}/pendaftaran`, {
            headers: { Accept: 'application/json' },
          });
        }
        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : data.data || [];
          if (arr.length > 0) {
            const formatted = arr.map((p) => {
              const titleFix =
                p.nama_kegiatan ||
                p.namaKegiatan ||
                p.nama_event ||
                p.nama_proker ||
                p.nama ||
                'Kegiatan OSIS';
              const catatanFix =
                p.catatan || p.alasan || p.alasan_mengikuti || p.keterangan || '';

              return {
                id: p.id,
                kegiatanId: p.event_id || p.kegiatan_id || p.kegiatanId,
                namaKegiatan: titleFix,
                namasiswa: p.nama_siswa || p.namaSiswa || p.nama,
                namaSiswa: p.nama_siswa || p.namaSiswa || p.nama,
                nama: p.nama_siswa || p.namaSiswa || p.nama,
                nis: p.nisn || p.nis || '',
                kelas: p.kelas || '',
                catatan: catatanFix,
                alasan: catatanFix,
                alasan_mengikuti: catatanFix,
                tanggal: p.tanggal || p.tanggal_pelaksanaan || '-',
                tanggalDaftar: p.tanggal_daftar || p.created_at || '',
                status: p.status || p.status_pendaftaran || 'Terdaftar',
              };
            });

            setPendaftaranList((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(formatted)) {
                localStorage.setItem('pendaftaranList', JSON.stringify(formatted));
                localStorage.setItem('ositara_pendaftaran', JSON.stringify(formatted));
                return formatted;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        console.error('Gagal fetch pendaftaran:', e);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    handleSync();
    const interval = setInterval(handleSync, 15000);
    window.addEventListener('storage', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleSync);
    };
  }, [handleSync]);

  // AUTO-FILL NIS & KELAS SAAT MODAL DIBUKA
  useEffect(() => {
    if (selectedKegiatan) {
      const defaultNis = user?.nis || user?.nisn || user?.noinduk || '';
      const defaultKelas = user?.kelas || user?.class || '';
      const lastPendaftaran = pendaftaranSaya[0];
      setNisInput(defaultNis || lastPendaftaran?.nis || '');
      setKelasInput(defaultKelas || lastPendaftaran?.kelas || '');
    }
  }, [selectedKegiatan, user, pendaftaranSaya]);

  // --- HANDLER UPLOAD & HAPUS AVATAR
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
        localStorage.setItem('ositara_siswa_avatar', reader.result);
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

  // --- BUKA FORM PENDAFTARAN KEGIATAN
  const handleOpenDaftar = (kegiatan) => {
    const namaKegiatanTarget =
      kegiatan.namaKegiatan || kegiatan.nama_proker || kegiatan.nama || '';
    const isAlreadyRegistered = pendaftaranList.some(
      (p) =>
        (String(p.kegiatanId) === String(kegiatan.id) ||
          (p.namaKegiatan &&
            p.namaKegiatan.toLowerCase().trim() ===
              namaKegiatanTarget.toLowerCase().trim())) &&
        (p.namaSiswa === namaUser ||
          p.nama === namaUser ||
          p.namasiswa === namaUser)
    );

    if (isAlreadyRegistered) {
      showToast('Kamu sudah terdaftar dalam kegiatan ini!', 'warning');
      return;
    }
    setSelectedKegiatan(kegiatan);
  };

  // --- SUBMIT PENDAFTARAN SISWA (OPTIMISTIC UI 0 DETIK + ANTI DOUBLE CLICK)
  const handleSubmitPendaftaran = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!nisInput.trim() || !kelasInput.trim()) {
      showToast('Mohon lengkapi NIS dan Kelas terlebih dahulu!', 'warning');
      return;
    }

    setIsSubmitting(true);
    const newId = generateUniqueId();
    const todayIso = new Date().toISOString().split('T')[0];
    const namaKegiatanFix =
      selectedKegiatan.namaKegiatan ||
      selectedKegiatan.nama_proker ||
      selectedKegiatan.nama_kegiatan ||
      selectedKegiatan.nama ||
      'Kegiatan OSIS';
    const tanggalFix =
      selectedKegiatan.tanggal ||
      selectedKegiatan.target ||
      selectedKegiatan.date ||
      '-';
    const textCatatan = catatanInput.trim();

    const payloadBackend = {
      id: newId,
      event_id: String(selectedKegiatan.id || '1'),
      kegiatan_id: String(selectedKegiatan.id || '1'),
      nama_kegiatan: namaKegiatanFix,
      nama_siswa: namaUser,
      nisn: nisInput.trim(),
      nis: nisInput.trim(),
      kelas: kelasInput.trim(),
      catatan: textCatatan,
      alasan: textCatatan,
      alasan_mengikuti: textCatatan,
      status: 'Terdaftar',
      status_pendaftaran: 'Terdaftar',
      tanggal_daftar: todayIso,
    };

    // 1. LANGSUNG PERBARUI UI & TUTUP MODAL SEKETIKA (0 DETIK)
    const pendaftaranBaru = {
      id: newId,
      kegiatanId: selectedKegiatan.id,
      namaKegiatan: namaKegiatanFix,
      tanggal: tanggalFix,
      namasiswa: namaUser,
      namaSiswa: namaUser,
      nama: namaUser,
      nis: nisInput.trim(),
      kelas: kelasInput.trim(),
      catatan: textCatatan,
      alasan: textCatatan,
      alasan_mengikuti: textCatatan,
      status: 'Terdaftar',
      tanggalDaftar: todayIso,
    };

    const updated = [pendaftaranBaru, ...pendaftaranList];
    setPendaftaranList(updated);
    localStorage.setItem('pendaftaranList', JSON.stringify(updated));
    localStorage.setItem('ositara_pendaftaran', JSON.stringify(updated));

    setSelectedKegiatan(null);
    setNisInput('');
    setKelasInput('');
    setCatatanInput('');
    showToast(`Berhasil mendaftar kegiatan "${namaKegiatanFix}"!`);

    // 2. KIRIM KE MYSQL DI LATAR BELAKANG
    try {
      let res = await fetch(`${API_BASE}/pendaftaran-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payloadBackend),
      });

      if (!res.ok) {
        await fetch(`${API_BASE}/pendaftaran`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payloadBackend),
        });
      }
    } catch (err) {
      console.error('Gagal simpan pendaftaran ke MySQL:', err);
      showToast('Tersimpan lokal, namun koneksi ke server terputus.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- BUKA MODAL KONFIRMASI HAPUS PENDAFTARAN
  const handleHapusPendaftaran = (item) => {
    setConfirmModal({
      isOpen: true,
      type: 'pendaftaran',
      id: item.id,
      title: 'Batalkan Pendaftaran?',
      message: `Apakah kamu yakin ingin membatalkan pendaftaran pada kegiatan "${
        item.namaKegiatan || item.nama_kegiatan || 'ini'
      }"?`,
    });
  };

  // --- EKSEKUSI KONFIRMASI MODAL CUSTOM (OPTIMISTIC DELETE)
  const handleExecuteConfirm = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' });

    if (type === 'pendaftaran' && id) {
      const updated = pendaftaranList.filter((item) => String(item.id) !== String(id));
      setPendaftaranList(updated);
      localStorage.setItem('pendaftaranList', JSON.stringify(updated));
      localStorage.setItem('ositara_pendaftaran', JSON.stringify(updated));
      showToast('Pendaftaran kegiatan berhasil dibatalkan.');

      try {
        let res = await fetch(`${API_BASE}/pendaftaran-event/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          await fetch(`${API_BASE}/pendaftaran/${id}`, {
            method: 'DELETE',
            headers: { Accept: 'application/json' },
          });
        }
      } catch (err) {
        console.error('Gagal menghapus pendaftaran dari database:', err);
      }
    } else if (type === 'avatar') {
      setAvatarUrl(null);
      localStorage.removeItem('ositara_siswa_avatar');
      setShowAvatarModal(false);
      showToast('Foto profil berhasil dihapus.');
    }
  };

  const menuList = [
    { id: 'beranda', label: 'Beranda', icon: 'beranda' },
    { id: 'kegiatan', label: 'Daftar Kegiatan', icon: 'kegiatan' },
    { id: 'riwayat', label: 'Kegiatan Saya', icon: 'riwayat' },
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

      {/* HEADER MOBILE - MENYATU DENGAN WARNA SIDEBAR */}
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
              DASHBOARD SISWA
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

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-sm transition-all animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      {/* SIDEBAR NAVIGATION - MATCH DENGAN KETUA & BENDAHARA */}
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
                className="w-10 h-10 object-contain shrink-0 animate-bounce transition-transform duration-300 drop-shadow-md"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest leading-none drop-shadow-md">
                OSITARA
              </h1>
              <p className="text-[10px] text-[#FFD43B] font-extrabold tracking-wider mt-1 uppercase drop-shadow-xs">
                DASHBOARD SISWA
              </p>
            </div>
          </div>

          <nav className="space-y-2 mt-4 md:mt-0">
            {menuList.map((menu) => {
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

        {/* TOMBOL LOGOUT SOLID MERAH MATCH */}
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
        {/* HEADER PROFIL SISWA - MATCH DENGAN KETUA & BENDAHARA */}
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
                  Selamat Datang, <span className="text-[#2158B8]">{namaUser}</span>!
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Peran:</span>
                  <span className="bg-blue-100/80 text-[#2158B8] font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-blue-300">
                    SISWA SEKOLAH
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-4 sm:space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {/* STATS CARDS - PALET GRADASI PASTEL MATCH DENGAN KETUA & BENDAHARA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
              {/* Total Proker OSIS (Biru Pastel) */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#3b72b5] via-[#4c9ae8] to-[#82c8f7] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#3b72b5]/30 hover:shadow-2xl hover:shadow-[#3b72b5]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight">
                    Total Proker OSIS
                  </p>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow mt-1 truncate">
                    {prokerList.length}
                  </h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <Icon type="calendar" />
                </div>
              </div>

              {/* Kegiatan Diikuti (Hijau Toska Pastel) */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#2b7a69] via-[#38a88e] to-[#6ee0c5] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#2b7a69]/30 hover:shadow-2xl hover:shadow-[#2b7a69]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight">
                    Kegiatan Diikuti
                  </p>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow mt-1 truncate">
                    {pendaftaranSaya.length}
                  </h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <Icon type="check" />
                </div>
              </div>

              {/* Status Pendaftaran (Emas/Amber Pastel) */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#c7852e] via-[#ebaa46] to-[#ffd27d] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#c7852e]/30 hover:shadow-2xl hover:shadow-[#c7852e]/40 hover:-translate-y-1 transition-all duration-300 text-white group flex items-center justify-between gap-2">
                <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-wider leading-tight">
                    Status Pendaftaran
                  </p>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow mt-1 truncate">
                    {pendaftaranSaya.length > 0 ? 'Aktif' : 'Belum Ada'}
                  </h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-white/30">
                  <Icon type="bell" />
                </div>
              </div>
            </div>

            {/* PENGUMUMAN RESMI */}
            <div className="bg-gradient-to-r from-[#1B4694] via-[#2158B8] to-[#3A86EF] p-5 sm:p-6 rounded-3xl text-white shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <span className="bg-[#f4d875] text-[#1B4694] text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 inline-block shadow-xs tracking-wider">
                  Pengumuman Resmi OSIS
                </span>
                <h3 className="text-lg sm:text-xl font-black mb-2 tracking-wide">
                  Portal Informasi OSITARA
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed font-medium">
                  Selamat datang di portal OSITARA Siswa! Di sini kamu bisa memantau jadwal Program Kerja mingguan pengurus OSIS serta mendaftarkan diri pada event kegiatan sekolah yang sedang terbuka.
                </p>
              </div>
            </div>

            {/* PROGRAM KERJA OSIS */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8]" />
                    Program Kerja OSIS
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Jadwal dan agenda proker mingguan dari Ketua OSIS
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider self-start sm:self-auto">
                  Informasi Agenda (Read Only)
                </span>
              </div>

              {prokerList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-400">
                    Belum ada jadwal program kerja dari Ketua OSIS.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prokerList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 border border-slate-200/80 bg-slate-50/80 hover:bg-blue-50/40 rounded-2xl flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2.5 gap-2">
                          <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-blue-100 text-[#2158B8] border border-blue-200 shrink-0 uppercase tracking-wider">
                            Proker OSIS
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 shrink-0">
                            {formatTanggal(item.target || item.tanggal)}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">
                          {item.nama_proker || item.nama}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Divisi/Sekbid:{' '}
                          <span className="font-semibold text-slate-700">
                            {item.sekbid || item.divisi || 'Ketua OSIS'}
                          </span>
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/70 text-center">
                        <span className="text-[11px] text-slate-400 italic font-bold">
                          Hanya Informasi Proker
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. DAFTAR KEGIATAN SEKOLAH */}
        {activeMenu === 'kegiatan' && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-base sm:text-lg font-black text-slate-800 pb-3 border-b border-slate-200/80 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8]" />
              Daftar Kegiatan Sekolah Tersedia
            </h3>

            {kegiatanList.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 text-center text-slate-400 font-medium shadow-sm">
                Belum ada agenda kegiatan sekolah dari Sekretaris OSIS.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {kegiatanList.map((item) => {
                  const judulTarget =
                    item.namaKegiatan ||
                    item.nama_proker ||
                    item.nama ||
                    'Kegiatan';
                  const isRegistered = pendaftaranList.some(
                    (p) =>
                      (String(p.kegiatanId) === String(item.id) ||
                        (p.namaKegiatan &&
                          p.namaKegiatan.toLowerCase().trim() ===
                            judulTarget.toLowerCase().trim())) &&
                      (p.namaSiswa === namaUser ||
                        p.nama === namaUser ||
                        p.namasiswa === namaUser)
                  );

                  return (
                    <div
                      key={item.id}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                            {judulTarget}
                          </h4>
                          <span className="px-2.5 py-0.5 bg-blue-100 text-[#2158B8] font-extrabold text-[10px] rounded-full shrink-0 border border-blue-200 uppercase tracking-wider">
                            Kegiatan
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {item.deskripsi || 'Tidak ada deskripsi.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-600 truncate">
                          Jadwal: {formatTanggal(item.tanggal)}
                        </span>
                        <button
                          disabled={isRegistered}
                          onClick={() => handleOpenDaftar(item)}
                          className={`px-4 py-2 font-black text-xs rounded-2xl transition-all duration-200 shadow-sm shrink-0 active:scale-95 ${
                            isRegistered
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                              : 'bg-[#2158B8] hover:bg-[#1B4694] text-white shadow-blue-600/20 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                          }`}
                        >
                          {isRegistered ? 'Terdaftar' : 'Daftar Event'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. RIWAYAT KEGIATAN SAYA */}
        {activeMenu === 'riwayat' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Kegiatan yang Diikuti
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Nama Kegiatan</th>
                    <th className="py-3 px-4">NIS/Kelas</th>
                    <th className="py-3 px-4">Catatan / Alasan</th>
                    <th className="py-3 px-4">Tanggal Mendaftar</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendaftaranSaya.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                        Kamu belum mendaftar kegiatan apapun.
                      </td>
                    </tr>
                  ) : (
                    pendaftaranSaya.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {item.namaKegiatan ||
                            item.nama_proker ||
                            item.nama_kegiatan ||
                            item.nama_event ||
                            item.nama}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {item.nis || item.nisn || '-'} ({item.kelas || '-'})
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {item.catatan || item.alasan || item.alasan_mengikuti || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {formatTanggal(item.tanggalDaftar || item.tanggal_daftar)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-3 py-1 font-bold text-[10px] sm:text-xs rounded-xl inline-block uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                            {item.status || 'Terdaftar'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleHapusPendaftaran(item)}
                            className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all duration-200 active:scale-95 cursor-pointer border border-rose-200 shadow-xs inline-flex items-center"
                            title="Batalkan Pendaftaran"
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
        )}
      </main>

      {/* MODAL KONFIRMASI HAPUS / BATAL CUSTOM */}
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
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM PENDAFTARAN */}
      {selectedKegiatan && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-blue-100 space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Form Pendaftaran Event
              </h3>
              <button
                onClick={() => setSelectedKegiatan(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Nama Event:{' '}
              <span className="font-bold text-[#2158B8]">
                {selectedKegiatan.namaKegiatan ||
                  selectedKegiatan.nama_proker ||
                  selectedKegiatan.nama}
              </span>
            </p>
            <form onSubmit={handleSubmitPendaftaran} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  NISN / NIS
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 242510076"
                  value={nisInput}
                  onChange={(e) => setNisInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/80 focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Kelas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: XI PPLG 4"
                  value={kelasInput}
                  onChange={(e) => setKelasInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/80 focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Alasan / Catatan Mengikuti Event
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tuliskan alasan mengapa kamu ingin mengikuti event ini..."
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] focus:border-transparent bg-slate-50/80 focus:bg-white transition-all shadow-xs"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-[#2158B8] hover:bg-[#1B4694] shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Kirim Pendaftaran'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedKegiatan(null)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
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
                htmlFor="avatar-file-input-siswa"
                className="w-full py-3 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                <span>Ganti / Unggah Foto Baru</span>
              </label>
              <input
                id="avatar-file-input-siswa"
                type="file"
                accept="image/*"
                onChange={handleUploadAvatar}
                className="hidden"
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleHapusAvatar}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer border border-rose-200 active:scale-95 transition-all"
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