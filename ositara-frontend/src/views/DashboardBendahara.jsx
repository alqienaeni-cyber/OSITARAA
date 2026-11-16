import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// KOMPONEN IKON SVG
const Icon = ({ type }) => {
  switch (type) {
    case 'beranda':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'keuangan':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'proposal':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'proker':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case 'anggota':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'kegiatan':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'edit':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case 'trash':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    case 'users':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    default:
      return null;
  }
};

// HELPER PEMISAH PROGRAM KERJA (KETUA) VS KEGIATAN (SEKRETARIS)
const isKegiatanSekretaris = (item) => {
  const divisi = String(item?.divisi || item?.sekbid || item?.penanggung_jawab || '').toLowerCase().trim();
  const tipe = String(item?.tipe || item?.jenis || item?.kategori || '').toLowerCase().trim();
  return divisi === 'sekretaris' || tipe === 'kegiatan' || Boolean(item?.is_kegiatan);
};

export default function DashboardBendahara({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // DATA UTAMA
  const [keuanganList, setKeuanganList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ositara_keuangan') || '[]');
    } catch {
      return [];
    }
  });
  const [proposalList, setProposalList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ositara_proposal') || '[]');
    } catch {
      return [];
    }
  });
  const [prokerList, setProkerList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ositara_proker') || '[]');
      return saved.filter((item) => !isKegiatanSekretaris(item));
    } catch {
      return [];
    }
  });
  const [anggotaList, setAnggotaList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ositara_anggota') || '[]');
    } catch {
      return [];
    }
  });
  const [kegiatanList, setKegiatanList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ositara_kegiatan') || '[]');
    } catch {
      return [];
    }
  });
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ositara_pendaftaran') || '[]');
    } catch {
      return [];
    }
  });

  // STATE FORM INPUT KAS
  const [keterangan, setKeterangan] = useState('');
  const [sumber, setSumber] = useState('Kas OSIS');
  const [jenisTransaksi, setJenisTransaksi] = useState('Pemasukan');
  const [nominal, setNominal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE MODAL EDIT KAS
  const [editKasModal, setEditKasModal] = useState({
    isOpen: false,
    id: null,
    keterangan: '',
    sumber: 'Kas OSIS',
    jenis: 'Pemasukan',
    nominal: '',
    tanggal: '',
  });
  const [isUpdatingKas, setIsUpdatingKas] = useState(false);

  // STATE MODAL KONFIRMASI HAPUS & PESERTA & AVATAR
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    message: '',
  });
  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_bendahara_avatar') || '');

  // STATE NOTIFIKASI TOAST
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // SINKRONISASI KEUANGAN KE KETUA, SEKRETARIS, & PEMBINA
  const broadcastKeuangan = (updatedData) => {
    try {
      localStorage.setItem('ositara_keuangan', JSON.stringify(updatedData));
      window.dispatchEvent(new Event('ositara_keuangan_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Gagal menyimpan sinkronisasi localStorage:', e);
    }
  };

  // HELPER FORMAT
  const formatRupiah = (angka) => {
    const num = Number(angka) || 0;
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return '-';
    const d = new Date(tgl);
    if (isNaN(d.getTime())) return tgl;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // SINKRONISASI DATA DARI DATABASE API & LOCALSTORAGE
  const handleSyncData = useCallback(async () => {
    const extractArray = (res) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return null;
    };

    const fetchEndpoint = async (endpoint) => {
      try {
        const res = await api.get(endpoint);
        return extractArray(res.data);
      } catch {
        try {
          const r = await fetch(`${API_BASE}${endpoint}`, { headers: getAuthHeaders() });
          if (r.ok) {
            const j = await r.json();
            return extractArray(j);
          }
        } catch {
          return null;
        }
      }
      return null;
    };

    const [keuData, propData, prokData, angData, kegData, pendData] = await Promise.all([
      fetchEndpoint('/keuangan'),
      fetchEndpoint('/proposals'),
      fetchEndpoint('/program-kerja'),
      fetchEndpoint('/anggota'),
      fetchEndpoint('/kegiatan'),
      fetchEndpoint('/pendaftaran'),
    ]);

    if (keuData) {
      setKeuanganList(keuData);
      broadcastKeuangan(keuData);
    }
    if (propData) {
      setProposalList(propData);
      localStorage.setItem('ositara_proposal', JSON.stringify(propData));
    }

    // Program Kerja hanya dari Ketua, Kegiatan hanya dari Sekretaris
    if (prokData) {
      const prokerKetua = prokData.filter((item) => !isKegiatanSekretaris(item));
      setProkerList(prokerKetua);
      localStorage.setItem('ositara_proker', JSON.stringify(prokerKetua));

      const kegiatanDariTabel = prokData.filter((item) => isKegiatanSekretaris(item));
      if (kegData && kegData.length > 0) {
        setKegiatanList(kegData);
        localStorage.setItem('ositara_kegiatan', JSON.stringify(kegData));
      } else {
        setKegiatanList(kegiatanDariTabel);
        localStorage.setItem('ositara_kegiatan', JSON.stringify(kegiatanDariTabel));
      }
    } else if (kegData) {
      setKegiatanList(kegData);
      localStorage.setItem('ositara_kegiatan', JSON.stringify(kegData));
    }

    if (angData) {
      setAnggotaList(angData);
      localStorage.setItem('ositara_anggota', JSON.stringify(angData));
    }
    if (pendData) {
      setPendaftaranList(pendData);
      localStorage.setItem('ositara_pendaftaran', JSON.stringify(pendData));
    }
  }, []);

  useEffect(() => {
    const initialSync = setTimeout(() => {
      handleSyncData();
    }, 0);

    const interval = setInterval(() => {
      handleSyncData();
    }, 5000);

    const onStorageSync = () => {
      try {
        const keu = JSON.parse(localStorage.getItem('ositara_keuangan') || '[]');
        const prop = JSON.parse(localStorage.getItem('ositara_proposal') || '[]');
        const prokRaw = JSON.parse(localStorage.getItem('ositara_proker') || '[]');
        const ang = JSON.parse(localStorage.getItem('ositara_anggota') || '[]');
        const keg = JSON.parse(localStorage.getItem('ositara_kegiatan') || '[]');
        const pend = JSON.parse(localStorage.getItem('ositara_pendaftaran') || '[]');

        const prokKetua = prokRaw.filter((item) => !isKegiatanSekretaris(item));
        const kegSekre = prokRaw.filter((item) => isKegiatanSekretaris(item));

        setKeuanganList(keu);
        setProposalList(prop);
        setProkerList(prokKetua);
        setAnggotaList(ang);
        setKegiatanList(keg.length > 0 ? keg : kegSekre);
        setPendaftaranList(pend);
      } catch {
        // abaikan error parse
      }
    };

    window.addEventListener('storage', onStorageSync);
    window.addEventListener('ositara_keuangan_updated', onStorageSync);
    window.addEventListener('ositara_proposal_updated', onStorageSync);
    window.addEventListener('ositara_proker_updated', onStorageSync);
    window.addEventListener('ositara_kegiatan_updated', onStorageSync);

    return () => {
      clearTimeout(initialSync);
      clearInterval(interval);
      window.removeEventListener('storage', onStorageSync);
      window.removeEventListener('ositara_keuangan_updated', onStorageSync);
      window.removeEventListener('ositara_proposal_updated', onStorageSync);
      window.removeEventListener('ositara_proker_updated', onStorageSync);
      window.removeEventListener('ositara_kegiatan_updated', onStorageSync);
    };
  }, [handleSyncData]);

  // --- HANDLER TAMBAH TRANSAKSI KAS ---
  const handleTambahKas = async (e) => {
    e.preventDefault();
    if (!keterangan.trim() || !nominal) return;

    setIsSubmitting(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const nominalAngka = Number(nominal);

    const payload = {
      keterangan: keterangan.trim(),
      sumber,
      kategori: jenisTransaksi,
      jenis: jenisTransaksi,
      nominal: nominalAngka,
      jumlah: nominalAngka,
      tanggal: todayStr,
    };

    try {
      let resData = null;
      let isSuccess = false;

      try {
        const axiosRes = await api.post('/keuangan', payload);
        if (axiosRes.status >= 200 && axiosRes.status < 300) {
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
        broadcastKeuangan(updatedList);

        setKeterangan('');
        setNominal('');
        setSumber('Kas OSIS');
        showToast('Transaksi berhasil disimpan ke database!');

        await handleSyncData();
      }
    } catch (err) {
      console.error('Gagal menyimpan kas:', err);
      showToast('Koneksi ke server terputus.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER BUKA MODAL EDIT KAS ---
  const handleBukaEditKas = (item) => {
    setEditKasModal({
      isOpen: true,
      id: item.id,
      keterangan: item.keterangan || '',
      sumber: item.sumber || 'Kas OSIS',
      jenis: item.kategori || item.jenis || 'Pemasukan',
      nominal: item.nominal || item.jumlah || '',
      tanggal: item.tanggal || new Date().toISOString().split('T')[0],
    });
  };

  // --- HANDLER SIMPAN EDIT KAS ---
  const handleSimpanEditKas = async (e) => {
    e.preventDefault();
    if (!editKasModal.keterangan.trim() || !editKasModal.nominal) return;

    setIsUpdatingKas(true);
    const nominalAngka = Number(editKasModal.nominal);

    const payload = {
      keterangan: editKasModal.keterangan.trim(),
      sumber: editKasModal.sumber,
      kategori: editKasModal.jenis,
      jenis: editKasModal.jenis,
      nominal: nominalAngka,
      jumlah: nominalAngka,
      tanggal: editKasModal.tanggal,
    };

    try {
      const updatedList = keuanganList.map((item) =>
        String(item.id) === String(editKasModal.id) ? { ...item, ...payload } : item
      );
      setKeuanganList(updatedList);
      broadcastKeuangan(updatedList);

      try {
        await api.put(`/keuangan/${editKasModal.id}`, payload);
      } catch {
        await fetch(`${API_BASE}/keuangan/${editKasModal.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      setEditKasModal({
        isOpen: false,
        id: null,
        keterangan: '',
        sumber: 'Kas OSIS',
        jenis: 'Pemasukan',
        nominal: '',
        tanggal: '',
      });
      showToast('Transaksi kas berhasil diperbarui!');
      await handleSyncData();
    } catch (err) {
      console.error('Gagal mengedit transaksi kas:', err);
      showToast('Perubahan disimpan lokal, cek koneksi server.', 'warning');
    } finally {
      setIsUpdatingKas(false);
    }
  };

  // --- HANDLER HAPUS KAS (BUKA MODAL KONFIRMASI CUSTOM) ---
  const handleHapusKas = (item) => {
    setConfirmModal({
      isOpen: true,
      type: 'kas',
      id: item.id,
      title: 'Hapus Catatan Transaksi?',
      message: `Apakah kamu yakin ingin menghapus transaksi "${item.keterangan}"? Saldo kas akan otomatis disesuaikan kembali.`,
    });
  };

  // --- HANDLER FOTO PROFIL ---
  const handleUploadAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
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
      broadcastKeuangan(updated);
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
      setAvatarUrl('');
      localStorage.removeItem('ositara_bendahara_avatar');
      setShowAvatarModal(false);
      showToast('Foto profil berhasil dihapus.');
    }
  };

  // --- PESERTA TERDAFTAR ---
  const getPesertaByKegiatan = (keg) => {
    if (!keg) return [];
    const targetId = String(keg.id);
    const targetName = (keg.nama_proker || keg.namaKegiatan || keg.nama || '').toLowerCase().trim();

    return pendaftaranList.filter((p) => {
      const pid = String(p.kegiatanId || p.kegiatan_id || '');
      const pName = (p.namaKegiatan || p.nama_kegiatan || p.nama_proker || p.nama || '').toLowerCase().trim();
      return (pid && pid === targetId) || (pName && pName === targetName);
    });
  };

  // --- HITUNG RINGKASAN SALDO ---
  const totalPemasukan = keuanganList
    .filter((k) => k.kategori === 'Pemasukan' || k.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + (Number(curr.jumlah) || Number(curr.nominal) || 0), 0);

  const totalPengeluaran = keuanganList
    .filter((k) => k.kategori === 'Pengeluaran' || k.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + (Number(curr.jumlah) || Number(curr.nominal) || 0), 0);

  const saldoSaatIni = totalPemasukan - totalPengeluaran;

  const namaBendahara = user?.nama || user?.name || 'Salsabila Zahir A';
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
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-slate-100/80 font-sans text-slate-800 overflow-hidden selection:bg-[#2158B8] selection:text-white">
      {/* NOTIFIKASI TOAST MELAYANG */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-[fadeIn_0.2s_ease-out] max-w-sm">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm ${
              toast.type === 'warning'
                ? 'bg-gradient-to-tr from-[#c7852e] to-[#ff2274]'
                : 'bg-gradient-to-tr from-[#2158B8] to-[#3A86EF]'
            }`}
          >
            {toast.type === 'warning' ? '!' : '✓'}
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">{toast.message}</p>
        </div>
      )}

      {/* HEADER NAVBAR MOBILE */}
      <header className="md:hidden bg-gradient-to-r from-[#1B4694] to-[#2158B8] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md w-full border-b border-blue-800">
        <div className="flex items-center space-x-2.5">
          <img
            src="/logo-ositara.png"
            alt="Logo OSITARA"
            className="w-7 h-7 object-contain cursor-pointer hover:scale-110 transition-transform duration-300 drop-shadow"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-sm font-black tracking-widest leading-none">OSITARA</h1>
            <p className="text-[9px] text-[#FFF5BF] font-bold tracking-wider uppercase mt-0.5">BENDAHARA OSIS</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white focus:outline-none transition-transform active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* OVERLAY MOBILE */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-gradient-to-b from-[#1B4694] via-[#2158B8] to-[#1A428A] text-white flex flex-col justify-between transition-transform duration-300 ease-out shadow-2xl md:shadow-xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="p-6 flex items-center space-x-3 border-b border-white/10">
            <img
              src="/logo-ositara.png"
              alt="Logo OSITARA"
              className="w-9 h-9 object-contain cursor-pointer hover:scale-110 transition-transform duration-300 drop-shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-lg font-black tracking-widest leading-none text-white">OSITARA</h1>
              <p className="text-[10px] text-[#FFF5BF] font-bold tracking-wider uppercase mt-1">BENDAHARA OSIS</p>
            </div>
          </div>

          <nav className="mt-6 px-3.5 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFF5BF] text-[#1B4694] shadow-lg shadow-amber-900/20 translate-x-1'
                      : 'text-blue-100/90 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <span className={isActive ? 'text-[#2158B8]' : 'text-blue-200'}>
                    <Icon type={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full py-3 bg-rose-500/90 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-rose-950/30 hover:shadow-rose-600/40 active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
        {/* HEADER PROFILE BENDAHARA */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center space-x-4 relative z-10">
            <div
              onClick={() => setShowAvatarModal(true)}
              title="Klik untuk Ubah / Hapus Foto Profil"
              className="relative group cursor-pointer shrink-0"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar Bendahara"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/20 group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#1B4694] to-[#3A86EF] rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-md font-black text-xl sm:text-2xl group-hover:scale-105 transition-transform duration-300">
                  {inisialNama}
                </div>
              )}
              <div className="absolute inset-0 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-bold backdrop-blur-[1px]">
                Ubah
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
                Selamat Datang, <span className="text-[#2158B8]">{namaBendahara}!</span>
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-slate-500 font-medium">Jabatan:</p>
                <span className="px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold rounded-full bg-blue-50 text-[#2158B8] border border-blue-200/80 uppercase tracking-wide">
                  BENDAHARA OSIS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {/* 3 STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div className="bg-gradient-to-br from-[#1B4694] via-[#2158B8] to-[#316CE0] text-white p-6 rounded-3xl shadow-lg shadow-blue-900/15 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <p className="text-[11px] font-bold text-blue-100 uppercase tracking-wider">Total Saldo Kas OSIS</p>
                <h3 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">{formatRupiah(saldoSaatIni)}</h3>
                <p className="text-[11px] text-blue-200/90 mt-2 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFF5BF] inline-block" /> Dana aktif tersedia saat ini
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan</p>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                    + MASUK
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 tracking-tight">
                  {formatRupiah(totalPemasukan)}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Akumulasi dana masuk</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</p>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                    - KELUAR
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-500 mt-2 tracking-tight">
                  {formatRupiah(totalPengeluaran)}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Akumulasi pengeluaran kas</p>
              </div>
            </div>

            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transaksi Terakhir */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2158B8]" />
                    Transaksi Kas Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveMenu('catat-kas')}
                    className="text-xs font-bold text-[#2158B8] hover:text-amber-500 transition-colors duration-200 cursor-pointer hover:underline"
                  >
                    Kelola Kas &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {keuanganList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">Belum ada catatan transaksi kas.</p>
                    </div>
                  ) : (
                    keuanganList.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-slate-50/90 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-all duration-200 hover:translate-x-1"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{item.keterangan}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{formatTanggal(item.tanggal)}</p>
                        </div>
                        <span
                          className={`font-black text-xs sm:text-sm shrink-0 px-3 py-1 rounded-xl border ${
                            item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan'
                              ? 'text-emerald-700 bg-emerald-100/80 border-emerald-200'
                              : 'text-rose-600 bg-rose-100/80 border-rose-200'
                          }`}
                        >
                          {item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan' ? '+' : '-'}
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
                      <p className="text-xs text-slate-400 font-medium">Belum ada agenda kegiatan.</p>
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
                          <td className="py-3.5 px-4 font-bold text-slate-800">{item.keterangan}</td>
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
                            {item.kategori === 'Pemasukan' || item.jenis === 'Pemasukan' ? '+' : '-'}
                            {formatRupiah(item.jumlah || item.nominal)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleBukaEditKas(item)}
                                className="p-2 bg-blue-50 hover:bg-[#2158B8] text-[#2158B8] hover:text-white rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-xs border border-blue-200"
                                title="Edit Transaksi"
                              >
                                <Icon type="edit" />
                              </button>
                              <button
                                onClick={() => handleHapusKas(item)}
                                className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-xs border border-rose-200"
                                title="Hapus Transaksi"
                              >
                                <Icon type="trash" />
                              </button>
                            </div>
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
              <h3 className="text-lg font-black text-slate-800 mb-5 pb-3 border-b border-slate-100">Input Catatan Kas</h3>
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
                  className="w-full py-3.5 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. PROPOSAL MASUK (READ-ONLY) */}
        {activeMenu === 'proposal-masuk' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">Daftar Proposal Masuk</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-full">Read-Only</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Judul Proposal</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Anggaran</th>
                    <th className="py-3 px-4 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-slate-400 font-medium">
                        Belum ada data proposal masuk.
                      </td>
                    </tr>
                  ) : (
                    proposalList.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{p.judul || p.nama}</td>
                        <td className="py-3.5 px-4 text-slate-500">{formatTanggal(p.tanggal)}</td>
                        <td className="py-3.5 px-4 font-bold text-[#2158B8]">{formatRupiah(p.anggaran || p.dana)}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-3 py-1 rounded-xl text-[11px] font-extrabold ${
                              p.status === 'Disetujui'
                                ? 'bg-emerald-100 text-emerald-700'
                                : p.status === 'Ditolak'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {p.status || 'Menunggu Persetujuan'}
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

        {/* 4. PROGRAM KERJA (SINKRON KETUA OSIS) */}
        {activeMenu === 'program-kerja' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">Program Kerja OSIS</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[550px]">
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
                      <td colSpan="3" className="py-10 text-center text-slate-400 font-medium">
                        Belum ada data program kerja.
                      </td>
                    </tr>
                  ) : (
                    prokerList.map((pk) => (
                      <tr key={pk.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{pk.nama_proker || pk.nama}</td>
                        <td className="py-3.5 px-4 text-slate-600">{pk.divisi || pk.sekbid || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-500">{formatTanggal(pk.target || pk.tanggal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ANGGOTA OSIS (READ-ONLY) */}
        {activeMenu === 'anggota-osis' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">Daftar Anggota Pengurus OSIS</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-full">Read-Only</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">NIS</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4 rounded-r-xl">Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggotaList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-slate-400 font-medium">
                        Belum ada data anggota OSIS.
                      </td>
                    </tr>
                  ) : (
                    anggotaList.map((a) => (
                      <tr key={a.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{a.nis || '-'}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{a.nama}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#2158B8]">{a.jabatan || a.sekbid || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-600">{a.kelas || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. KELOLA KEGIATAN (SINKRON SEKRETARIS) */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">Daftar Kegiatan OSIS</h3>
            </div>
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
                      <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">
                        Belum ada data kegiatan OSIS.
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
                          <td className="py-3.5 px-4 text-slate-500">{formatTanggal(k.target || k.tanggal)}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {k.penanggung_jawab || k.divisi || k.sekbid || 'Sekretaris'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold bg-blue-100 text-[#2158B8]">
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

      {/* MODAL EDIT TRANSAKSI KAS */}
      {editKasModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-blue-100 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-800">Edit Catatan Kas</h3>
              <button
                type="button"
                onClick={() =>
                  setEditKasModal({
                    isOpen: false,
                    id: null,
                    keterangan: '',
                    sumber: 'Kas OSIS',
                    jenis: 'Pemasukan',
                    nominal: '',
                    tanggal: '',
                  })
                }
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimpanEditKas} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Keterangan Transaksi
                </label>
                <input
                  type="text"
                  required
                  value={editKasModal.keterangan}
                  onChange={(e) => setEditKasModal({ ...editKasModal, keterangan: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] bg-slate-50/80 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Sumber Dana
                  </label>
                  <select
                    value={editKasModal.sumber}
                    onChange={(e) => setEditKasModal({ ...editKasModal, sumber: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2158B8] cursor-pointer"
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
                    value={editKasModal.jenis}
                    onChange={(e) => setEditKasModal({ ...editKasModal, jenis: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2158B8] cursor-pointer"
                  >
                    <option value="Pemasukan">Pemasukan (+)</option>
                    <option value="Pengeluaran">Pengeluaran (-)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editKasModal.nominal}
                    onChange={(e) => setEditKasModal({ ...editKasModal, nominal: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] bg-slate-50/80 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={editKasModal.tanggal}
                    onChange={(e) => setEditKasModal({ ...editKasModal, tanggal: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] bg-slate-50/80 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditKasModal({
                      isOpen: false,
                      id: null,
                      keterangan: '',
                      sumber: 'Kas OSIS',
                      jenis: 'Pemasukan',
                      nominal: '',
                      tanggal: '',
                    })
                  }
                  className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingKas}
                  className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-[#2158B8] hover:bg-[#1B4694] shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isUpdatingKas ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS CUSTOM */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#c96268] to-[#ffafb4] text-white flex items-center justify-center shadow-lg shadow-[#c96268]/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800">{confirmModal.title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' })}
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
                  <p className="text-xs text-slate-400 font-medium">Belum ada peserta terdaftar.</p>
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
              <h3 className="text-base sm:text-lg font-black text-slate-800">Kelola Foto Profil</h3>
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
