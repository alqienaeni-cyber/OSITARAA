import React, { useState, useEffect, useCallback } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// HELPER COMPONENT: ICON
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
    proker: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9z"
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
    proposal: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
    trash: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    ),
    edit: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    ),
  };

  return (
    <svg
      className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {icons[type] || null}
    </svg>
  );
}

const API_BASE = 'http://127.0.0.1:8000/api';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

export default function DashboardBendahara({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const readInitialData = useCallback((key, fallback = []) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  const [keuanganList, setKeuanganList] = useState(() =>
    readInitialData('ositara_keuangan', [])
  );
  const [proposalList, setProposalList] = useState(() =>
    readInitialData('ositara_proposal', [])
  );
  const [prokerList, setProkerList] = useState(() =>
    readInitialData('ositara_proker', [])
  );
  const [anggotaList, setAnggotaList] = useState(() =>
    readInitialData('ositara_anggota', [])
  );
  const [kegiatanList, setKegiatanList] = useState(() =>
    readInitialData('ositara_kegiatan', [])
  );

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem('ositara_bendahara_avatar') || null
  );

  const [editId, setEditId] = useState(null);
  const [sumberKeuangan, setSumberKeuangan] = useState('Kas OSIS');
  const [jenisKeuangan, setJenisKeuangan] = useState('Pemasukan');
  const [keteranganKeuangan, setKeteranganKeuangan] = useState('');
  const [jumlahKeuangan, setJumlahKeuangan] = useState('');

  const namaDisplay =
    user?.namaLengkap || user?.nama || user?.name || user?.username || 'Shopia Widarti Noviani';
  const inisialNama = namaDisplay.charAt(0).toUpperCase();

  // SINKRONISASI DATABASE MYSQL
  const handleSync = useCallback(async () => {
    try {
      let resKeuangan = await fetch(`${API_BASE}/laporan-keuangan`, {
        headers: { Accept: 'application/json' },
      });
      if (!resKeuangan.ok) {
        resKeuangan = await fetch(`${API_BASE}/keuangan`, {
          headers: { Accept: 'application/json' },
        });
      }
      if (resKeuangan.ok) {
        const data = await resKeuangan.json();
        const arr = Array.isArray(data) ? data : data.data || [];
        if (arr.length > 0) {
          const formatted = arr.map((item) => ({
            id: item.id,
            sumber: item.sumber || 'Kas OSIS',
            jenis: item.jenis || item.kategori || 'Pemasukan',
            kategori: item.jenis || item.kategori || 'Pemasukan',
            keterangan: item.keterangan || item.uraian || 'Tanpa Keterangan',
            jumlah: Number(item.nominal || item.jumlah || 0),
            nominal: Number(item.nominal || item.jumlah || 0),
            tanggal: item.tanggal || '-',
          }));
          setKeuanganList(formatted);
          localStorage.setItem('ositara_keuangan', JSON.stringify(formatted));
        }
      }
    } catch (e) {
      console.log('Sinkronisasi MySQL terputus, menggunakan data lokal.');
    }
  }, []);

  useEffect(() => {
    handleSync();
  }, [handleSync]);

  const totalPemasukan = keuanganList
    .filter((item) => (item.jenis || item.kategori) === 'Pemasukan')
    .reduce((acc, curr) => acc + (Number(curr.jumlah || curr.nominal) || 0), 0);

  const totalPengeluaran = keuanganList
    .filter((item) => (item.jenis || item.kategori) === 'Pengeluaran')
    .reduce((acc, curr) => acc + (Number(curr.jumlah || curr.nominal) || 0), 0);

  const sisaSaldo = totalPemasukan - totalPengeluaran;

  // HANDLER SIMPAN & UPDATE KE DATABASE MYSQL
  const handleSimpanKeuangan = async (e) => {
    e.preventDefault();
    if (!keteranganKeuangan.trim() || !jumlahKeuangan) {
      alert('Mohon isi keterangan dan nominal transaksi!');
      return;
    }
    const nominalValue =
      Number(String(jumlahKeuangan).replace(/[^0-9]/g, '')) || 0;
    const tanggalHariIni = new Date().toISOString().split('T')[0];

    const payload = {
      sumber: sumberKeuangan || 'Kas OSIS',
      jenis: jenisKeuangan || 'Pemasukan',
      kategori: jenisKeuangan || 'Pemasukan',
      keterangan: keteranganKeuangan.trim(),
      nominal: nominalValue,
      jumlah: nominalValue,
      tanggal: tanggalHariIni,
    };

    if (editId) {
      // MODE UPDATE (EDIT)
      const updatedList = keuanganList.map((item) =>
        String(item.id) === String(editId) ? { ...item, ...payload } : item
      );
      setKeuanganList(updatedList);
      localStorage.setItem('ositara_keuangan', JSON.stringify(updatedList));
      const currentEditId = editId;
      setEditId(null);
      setKeteranganKeuangan('');
      setJumlahKeuangan('');

      try {
        let res = await fetch(`${API_BASE}/laporan-keuangan/${currentEditId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await fetch(`${API_BASE}/keuangan/${currentEditId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          });
        }
        alert('Data transaksi berhasil diperbarui di Database MySQL!');
        handleSync();
      } catch (error) {
        console.error('Gagal memperbarui ke database:', error);
      }
    } else {
      // MODE TAMBAH BARU
      try {
        let res = await fetch(`${API_BASE}/laporan-keuangan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          res = await fetch(`${API_BASE}/keuangan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          });
        }
        if (res.ok) {
          const resData = await res.json();
          const savedItem = resData.data || resData;
          const newItem = {
            id: savedItem.id || String(Date.now()),
            ...payload,
          };
          const updatedList = [newItem, ...keuanganList];
          setKeuanganList(updatedList);
          localStorage.setItem('ositara_keuangan', JSON.stringify(updatedList));
          alert('Data transaksi berhasil ditambahkan ke Database MySQL!');
        } else {
          const tempId = String(Date.now());
          const dataBaru = { id: tempId, ...payload };
          const updatedList = [dataBaru, ...keuanganList];
          setKeuanganList(updatedList);
          localStorage.setItem('ositara_keuangan', JSON.stringify(updatedList));
        }
      } catch (error) {
        console.error('Gagal terhubung ke database:', error);
        const tempId = String(Date.now());
        const dataBaru = { id: tempId, ...payload };
        const updatedList = [dataBaru, ...keuanganList];
        setKeuanganList(updatedList);
        localStorage.setItem('ositara_keuangan', JSON.stringify(updatedList));
      }
      setKeteranganKeuangan('');
      setJumlahKeuangan('');
      handleSync();
    }
  };

  const handleEditKeuangan = (item) => {
    setEditId(item.id);
    setSumberKeuangan(item.sumber || 'Kas OSIS');
    setJenisKeuangan(item.jenis || item.kategori || 'Pemasukan');
    setKeteranganKeuangan(item.keterangan || '');
    setJumlahKeuangan(item.jumlah || item.nominal || '');
  };

  const handleHapusKeuangan = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?'))
      return;
    const updatedList = keuanganList.filter((item) => String(item.id) !== String(id));
    setKeuanganList(updatedList);
    localStorage.setItem('ositara_keuangan', JSON.stringify(updatedList));

    try {
      let res = await fetch(`${API_BASE}/laporan-keuangan/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        await fetch(`${API_BASE}/keuangan/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
        });
      }
      alert('Data transaksi berhasil dihapus dari Database MySQL!');
      handleSync();
    } catch (error) {
      console.error('Gagal menghapus dari database:', error);
    }
  };

  const handleUploadAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setAvatarUrl(result);
        localStorage.setItem('ositara_bendahara_avatar', result);
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem('ositara_bendahara_avatar');
    setShowAvatarModal(false);
  };

  const menuList = [
    { id: 'beranda', label: 'Beranda', icon: 'beranda' },
    { id: 'laporan-keuangan', label: 'Catat Kas & Laporan', icon: 'keuangan' },
    { id: 'pengajuan-proposal', label: 'Proposal Masuk', icon: 'proposal' },
    { id: 'program-kerja', label: 'Program Kerja', icon: 'proker' },
    { id: 'anggota-osis', label: 'Anggota OSIS', icon: 'anggota' },
    { id: 'kelola-kegiatan', label: 'Kelola Kegiatan', icon: 'kegiatan' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F4F7] font-sans text-slate-800 relative overflow-x-hidden">
      {/* HEADER MOBILE */}
      <div className="md:hidden bg-[#2158B8] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <img
            src={logoOsitara}
            alt="Logo"
            className="w-8 h-8 object-contain animate-bounce cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <div>
            <h1 className="text-base font-black tracking-wider leading-none">OSITARA</h1>
            <p className="text-[9px] text-[#FFF3BF] font-bold tracking-wide uppercase mt-0.5">
              BENDAHARA OSIS
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all focus:outline-none cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMobileMenuOpen
                  ? 'M6 18L18 6M6 6l12 12'
                  : 'M4 6h16M4 12h16M4 18h16'
              }
            />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      {/* SIDEBAR DENGAN TINGGI FLEKSIBEL (MIN-H-SCREEN & MD:RELATIVE) */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 min-h-screen w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="hidden md:flex items-center space-x-3 mb-10">
            <div className="relative group cursor-pointer">
              <img
                src={logoOsitara}
                alt="Logo"
                className="w-10 h-10 object-contain shrink-0 animate-bounce hover:scale-110 transition-transform duration-300 drop-shadow-md"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-[#FFF3BF] font-bold tracking-wide mt-1 uppercase">
                BENDAHARA OSIS
              </p>
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
        {/* HEADER USER */}
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
              <h2 className="text-xl sm:text-2xl font-black text-[#2158B8]">
                Halo, {namaDisplay}!
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Jabatan: <span className="font-bold text-[#2158B8]">Bendahara OSIS</span>
              </p>
            </div>
          </div>
        </div>

        {/* BERANDA LENGKAP BERSAMA WIDGET RINGKASAN DATA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            {/* CARD METRIK UTAMA KEUANGAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Sisa Saldo Kas
                  </p>
                  <h3 className="text-lg sm:text-xl font-black text-[#2158B8] mt-1">
                    {formatRupiah(sisaSaldo)}
                  </h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-[#2158B8] rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Icon type="keuangan" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Total Pemasukan
                  </p>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-600 mt-1">
                    {formatRupiah(totalPemasukan)}
                  </h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Icon type="keuangan" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Total Pengeluaran
                  </p>
                  <h3 className="text-lg sm:text-xl font-black text-rose-500 mt-1">
                    {formatRupiah(totalPengeluaran)}
                  </h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Icon type="keuangan" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Total Transaksi
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2158B8] mt-1">
                    {keuanganList.length}
                  </h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Icon type="keuangan" />
                </div>
              </div>
            </div>

            {/* WIDGET RINGKASAN INFORMASI AKTIVITAS TERBARU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* TRANSAKSI KAS OSIS TERAKHIR */}
              <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-[#2158B8] flex items-center gap-2">
                    <Icon type="keuangan" /> Transaksi Kas Terakhir
                  </h3>
                  <button
                    onClick={() => setActiveMenu('laporan-keuangan')}
                    className="text-xs font-bold text-[#2158B8] hover:underline"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>
                {keuanganList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Belum ada transaksi kas tercatat.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {keuanganList.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs border border-slate-100"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{item.keterangan}</p>
                          <p className="text-slate-500 text-[11px]">
                            {item.sumber || 'Kas OSIS'} &bull; {item.tanggal}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                            (item.jenis || item.kategori) === 'Pemasukan'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {formatRupiah(item.jumlah || item.nominal)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PROPOSAL MASUK TERAKHIR */}
              <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-[#2158B8] flex items-center gap-2">
                    <Icon type="proposal" /> Proposal Masuk Terakhir
                  </h3>
                  <button
                    onClick={() => setActiveMenu('pengajuan-proposal')}
                    className="text-xs font-bold text-[#2158B8] hover:underline"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>
                {proposalList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Belum ada proposal masuk.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {proposalList.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs border border-slate-100"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.judul || item.judul_proposal}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Anggaran: {formatRupiah(item.anggaran)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg ${
                            item.status === 'Disetujui' || item.status === 'Diterima'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status || 'Menunggu'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LAPORAN KEUANGAN & CATAT KAS */}
        {activeMenu === 'laporan-keuangan' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.3s_ease-out]">
            <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto">
              <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">
                Catatan Arus Kas Keuangan
              </h3>
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                    <th className="p-3 rounded-l-xl">Keterangan Transaksi</th>
                    <th className="p-3">Jenis</th>
                    <th className="p-3">Nominal</th>
                    <th className="p-3 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keuanganList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400">
                        Belum ada transaksi kas tercatat.
                      </td>
                    </tr>
                  ) : (
                    keuanganList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-800">{item.keterangan}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-full inline-block ${
                              (item.jenis || item.kategori) === 'Pemasukan'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : 'bg-rose-100 text-rose-700 border border-rose-300'
                            }`}
                          >
                            {item.jenis || item.kategori}
                          </span>
                        </td>
                        <td className="p-3 font-black text-slate-700">
                          {formatRupiah(item.jumlah || item.nominal)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEditKeuangan(item)}
                              title="Edit Transaksi"
                              className="p-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs"
                            >
                              <Icon type="edit" />
                            </button>
                            <button
                              onClick={() => handleHapusKeuangan(item.id)}
                              title="Hapus Transaksi"
                              className="p-1.5 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs"
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

            <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#2158B8]">
                  {editId ? 'Edit Transaksi Kas' : 'Catat Transaksi Kas'}
                </h3>
                {editId && (
                  <button
                    onClick={() => {
                      setEditId(null);
                      setKeteranganKeuangan('');
                      setJumlahKeuangan('');
                    }}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleSimpanKeuangan} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Keterangan Transaksi
                  </label>
                  <input
                    type="text"
                    value={keteranganKeuangan}
                    onChange={(e) => setKeteranganKeuangan(e.target.value)}
                    placeholder="Contoh: Dana Kas Sekolah"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Jenis Arus Kas
                  </label>
                  <select
                    value={jenisKeuangan}
                    onChange={(e) => setJenisKeuangan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] bg-white hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <option value="Pemasukan">Pemasukan (+ Kas)</option>
                    <option value="Pengeluaran">Pengeluaran (- Kas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nominal (Rp)
                  </label>
                  <input
                    value={jumlahKeuangan}
                    type="number"
                    onChange={(e) => setJumlahKeuangan(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2158B8] hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 text-slate-900 font-black text-xs sm:text-sm rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-md mt-2 ${
                    editId
                      ? 'bg-amber-400 hover:bg-amber-500 hover:shadow-amber-400/30'
                      : 'bg-[#FFC42B] hover:bg-[#ffb700] hover:shadow-amber-400/30'
                  }`}
                >
                  {editId ? 'Perbarui Transaksi Kas' : 'Simpan Transaksi Kas'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PROPOSAL MASUK */}
        {activeMenu === 'pengajuan-proposal' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">
              Daftar Proposal Masuk
            </h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="p-3 rounded-l-xl">Judul Proposal</th>
                  <th className="p-3">Anggaran</th>
                  <th className="p-3 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposalList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-slate-400">
                      Belum ada proposal masuk.
                    </td>
                  </tr>
                ) : (
                  proposalList.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        {item.judul || item.judul_proposal}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {formatRupiah(item.anggaran)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                            item.status === 'Disetujui' || item.status === 'Diterima'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : 'bg-amber-100 text-amber-700 border border-amber-300'
                          }`}
                        >
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

        {/* PROGRAM KERJA */}
        {activeMenu === 'program-kerja' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">
              Program Kerja OSIS (Sinkron Ketua OSIS)
            </h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="p-3 rounded-l-xl">Nama Program Kerja</th>
                  <th className="p-3">Divisi/Sekbid</th>
                  <th className="p-3 rounded-r-xl">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prokerList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-slate-400">
                      Belum ada program kerja.
                    </td>
                  </tr>
                ) : (
                  prokerList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        {item.nama || item.nama_proker}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.divisi || item.sekbid || '-'}
                      </td>
                      <td className="p-3 text-slate-600">{item.target}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ANGGOTA OSIS */}
        {activeMenu === 'anggota-osis' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">
              Daftar Anggota OSIS
            </h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="p-3 rounded-l-xl">Nama Lengkap</th>
                  <th className="p-3">Jabatan</th>
                  <th className="p-3 rounded-r-xl">Sekbid/Divisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anggotaList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-slate-400">
                      Belum ada data anggota.
                    </td>
                  </tr>
                ) : (
                  anggotaList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        {item.nama || item.namaLengkap}
                      </td>
                      <td className="p-3 text-slate-600">{item.jabatan}</td>
                      <td className="p-3 text-slate-600">
                        {item.divisi || item.sekbid || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* KELOLA KEGIATAN */}
        {activeMenu === 'kelola-kegiatan' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 overflow-x-auto animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold text-[#2158B8] mb-4 sm:mb-6">
              Daftar Kegiatan Sekolah
            </h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="p-3 rounded-l-xl">Nama Kegiatan</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kegiatanList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-slate-400">
                      Belum ada data kegiatan.
                    </td>
                  </tr>
                ) : (
                  kegiatanList.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        {item.nama || item.namaKegiatan}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.tanggal || item.waktu || '-'}
                      </td>
                      <td className="p-3 text-blue-600 font-bold">
                        {item.status || 'Mendatang'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL AVATAR PROFIL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 text-center transform transition-all duration-300 animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-[#2158B8]">Kelola Foto Profil</h3>
            <div className="flex justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-[#2158B8] border-4 border-slate-50 shadow-inner font-black text-2xl">
                  {inisialNama}
                </div>
              )}
            </div>
            <div className="space-y-2.5 pt-2">
              <label className="block w-full py-3 bg-[#2158B8] hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                Pilih Foto Baru
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAvatar}
                  className="hidden"
                />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleHapusAvatar}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-xs cursor-pointer"
                >
                  Hapus Foto Profil
                </button>
              )}
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
