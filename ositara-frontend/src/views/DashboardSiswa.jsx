import { useState, useEffect, useCallback } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

// --- DEKLARASI SVG / ICON DI LUAR KOMPONEN UTAMA ---
function Icon({ type }) {
  const icons = {
    beranda: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
    kegiatan: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    riwayat: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    logout: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    )
  };

  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[type] || null}
    </svg>
  );
}

const getInitialData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + performance.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
};

export default function DashboardSiswa({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('kegiatan');
  const [kegiatanList, setKegiatanList] = useState(() => getInitialData('ositara_kegiatan', []));
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const primary = getInitialData('ositara_pendaftaran', null);
    const secondary = getInitialData('pendaftaranList', []);
    return primary || secondary;
  });
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('ositara_siswa_avatar') || null);

  // State Modal Form Pendaftaran
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [nisInput, setNisInput] = useState('');
  const [kelasInput, setKelasInput] = useState('');
  const [catatanInput, setCatatanInput] = useState('');

  // Sync Data Real-time
  const handleSync = useCallback(() => {
    setKegiatanList(getInitialData('ositara_kegiatan', []));
    const savedPendaftaran = getInitialData('ositara_pendaftaran', null) || getInitialData('pendaftaranList', []);
    setPendaftaranList(savedPendaftaran);
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleSync);
    window.addEventListener('ositara_kegiatan_updated', handleSync);
    window.addEventListener('ositara_pendaftaran_updated', handleSync);

    const interval = setInterval(handleSync, 1000);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ositara_kegiatan_updated', handleSync);
      window.removeEventListener('ositara_pendaftaran_updated', handleSync);
      clearInterval(interval);
    };
  }, [handleSync]);

  // Upload Avatar
  const handleUploadAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_siswa_avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const namaUser = user?.nama || user?.name || user?.username || 'Siswa OSITARA';
  const inisialNama = namaUser.charAt(0).toUpperCase();

  // Buka Modal Form Pendaftaran
  const handleOpenDaftar = (kegiatan) => {
    const isAlreadyRegistered = pendaftaranList.some(
      (p) => p.kegiatanId === kegiatan.id && (p.namaSiswa === namaUser || p.nama === namaUser)
    );

    if (isAlreadyRegistered) {
      alert('Anda sudah terdaftar dalam kegiatan ini!');
      return;
    }

    setSelectedKegiatan(kegiatan);
  };

  // Submit Form Pendaftaran
  const handleSubmitPendaftaran = (e) => {
    e.preventDefault();
    if (!nisInput.trim() || !kelasInput.trim()) {
      alert('Mohon lengkapi NIS dan Kelas!');
      return;
    }

    const pendaftaranBaru = {
      id: generateUniqueId(),
      kegiatanId: selectedKegiatan.id,
      namaKegiatan: selectedKegiatan.namaKegiatan || selectedKegiatan.nama,
      tanggal: selectedKegiatan.tanggal,
      namaSiswa: namaUser,
      nama: namaUser,
      nis: nisInput.trim(),
      kelas: kelasInput.trim(),
      catatan: catatanInput.trim() || '-', // <--- DISIMPANKAN DENGAN PROPERTY 'catatan'
      status: 'Terdaftar',
      tanggalDaftar: new Date().toLocaleDateString('id-ID')
    };

    const updated = [pendaftaranBaru, ...pendaftaranList];
    setPendaftaranList(updated);

    localStorage.setItem('pendaftaranList', JSON.stringify(updated));
    localStorage.setItem('ositara_pendaftaran', JSON.stringify(updated));

    // TRIGER EVENT SINKRONISASI KE PENGURUS & PEMBINA
    window.dispatchEvent(new Event('ositara_pendaftaran_updated'));

    // Reset Form
    setSelectedKegiatan(null);
    setNisInput('');
    setKelasInput('');
    setCatatanInput('');

    alert(`Berhasil mendaftar kegiatan "${selectedKegiatan.namaKegiatan || selectedKegiatan.nama}"!`);
  };

  const menuList = [
    { id: 'beranda', label: 'Beranda', icon: 'beranda' },
    { id: 'kegiatan', label: 'Daftar Kegiatan', icon: 'kegiatan' },
    { id: 'riwayat', label: 'Kegiatan Saya', icon: 'riwayat' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0 shadow-lg">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <img src={logoOsitara} alt="Logo OSITARA" className="w-10 h-10 object-contain shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-[#FFF5BF] font-bold tracking-wide mt-1 uppercase">DASHBOARD SISWA</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuList.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer text-left ${
                  activeMenu === menu.id ? 'bg-[#FFF3BF] text-[#2158B8] shadow-sm' : 'hover:bg-white/10 text-white'
                }`}
              >
                <Icon type={menu.icon} />
                <span className="leading-snug">{menu.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer text-left">
          <Icon type="logout" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* HEADER USER */}
        <div className="flex items-center justify-between mb-8 bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <label className="relative group cursor-pointer shrink-0" title="Ubah Foto Profil">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-[#2158B8] border-2 border-white shadow-sm font-black text-xl">
                  {inisialNama}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold">
                Ubah
              </div>
            </label>
            <div>
              <h2 className="text-2xl font-black text-[#2158B8]">Selamat Datang, {namaUser}!</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Cari dan ikuti berbagai kegiatan seru sekolah di OSITARA.</p>
            </div>
          </div>
        </div>

        {/* 1. BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-[#2158B8]">Informasi OSITARA</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Selamat datang di portal OSITARA Siswa! Di sini kamu bisa melihat jadwal kegiatan sekolah terbaru, mendaftarkan diri pada event yang sedang berlangsung, dan melihat riwayat pendaftaran kegiatanmu.
            </p>
          </div>
        )}

        {/* 2. DAFTAR KEGIATAN */}
        {activeMenu === 'kegiatan' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#2158B8]">Daftar Kegiatan Sekolah</h3>
            {kegiatanList.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">
                Belum ada agenda kegiatan sekolah yang dibuka.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kegiatanList.map((item) => {
                  const isRegistered = pendaftaranList.some(
                    (p) => p.kegiatanId === item.id && (p.namaSiswa === namaUser || p.nama === namaUser)
                  );

                  return (
                    <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-800 text-base">{item.namaKegiatan || item.nama}</h4>
                          <span className="px-2.5 py-1 bg-blue-100 text-[#2158B8] font-bold text-[10px] rounded-full">
                            {item.status || 'Mendatang'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">Tanggal: {item.tanggal}</span>
                        <button
                          disabled={isRegistered}
                          onClick={() => handleOpenDaftar(item)}
                          className={`px-4 py-2 font-bold text-xs rounded-xl transition shadow-sm cursor-pointer ${
                            isRegistered
                              ? 'bg-emerald-100 text-emerald-700 font-bold cursor-not-allowed border border-emerald-300'
                              : 'bg-[#FFB800] hover:bg-[#e0a200] text-slate-900'
                          }`}
                        >
                          {isRegistered ? 'Terdaftar' : 'Daftar'}
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-xl font-bold text-[#2158B8] mb-6">Kegiatan yang Diikuti</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F2F4F7]">
                  <th className="py-3.5 px-6">Nama Kegiatan</th>
                  <th className="py-3.5 px-6">NIS / Kelas</th>
                  <th className="py-3.5 px-6">Tanggal Pelaksanaan</th>
                  <th className="py-3.5 px-6">Tanggal Mendaftar</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendaftaranList.filter((p) => p.namaSiswa === namaUser || p.nama === namaUser).length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400">Kamu belum mendaftar kegiatan apapun.</td></tr>
                ) : (
                  pendaftaranList
                    .filter((p) => p.namaSiswa === namaUser || p.nama === namaUser)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-6 font-bold text-slate-800">{item.namaKegiatan}</td>
                        <td className="py-3.5 px-6 text-slate-600 font-medium">{item.nis || '-'} / {item.kelas || '-'}</td>
                        <td className="py-3.5 px-6 text-slate-600 font-semibold">{item.tanggal}</td>
                        <td className="py-3.5 px-6 text-slate-500">{item.tanggalDaftar || '-'}</td>
                        <td className="py-3.5 px-6 text-center">
                          <span className={`px-3 py-1 font-bold text-xs rounded-full inline-block ${
                            item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                            item.status === 'Ditolak' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                            'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          }`}>
                            {item.status || 'Terdaftar'}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL FORM PENDAFTARAN */}
      {selectedKegiatan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold text-[#2158B8] mb-1">Form Pendaftaran Kegiatan</h3>
            <p className="text-xs font-semibold text-slate-500 mb-4">
              Kegiatan: <span className="font-bold text-slate-800">{selectedKegiatan.namaKegiatan || selectedKegiatan.nama}</span>
            </p>

            <form onSubmit={handleSubmitPendaftaran} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2158B8] mb-1">NISN / NIS</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 242510076"
                  value={nisInput}
                  onChange={(e) => setNisInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2158B8] mb-1">Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: XI PPLG 4"
                  value={kelasInput}
                  onChange={(e) => setKelasInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2158B8] mb-1">Catatan (Opsional)</label>
                <textarea
                  rows="2"
                  placeholder="Tulis catatan jika ada..."
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2158B8]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FFB800] text-slate-900 font-bold text-xs rounded-2xl hover:bg-[#e0a200] transition cursor-pointer shadow-sm"
                >
                  Kirim Pendaftaran
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedKegiatan(null)}
                  className="py-3 px-4 bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl hover:bg-slate-300 transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
