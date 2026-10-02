import { useState, useEffect } from 'react';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function DashboardSiswa({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('beranda');

  // Helper membaca data awal dari LocalStorage
  const getInitialData = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      return fallback;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return fallback;
    }
  };

  // State Utama
  const [kegiatanList, setKegiatanList] = useState(() => getInitialData('ositara_kegiatan', []));
  const [pendaftaranList, setPendaftaranList] = useState(() => getInitialData('ositara_pendaftaran', []));

  // State Form / Filter Modal
  const [activeTab, setActiveTab] = useState('Semua');
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [alasanGabung, setAlasanGabung] = useState('');

  // SINKRONISASI REAL-TIME DENGAN LOCALSTORAGE
  useEffect(() => {
    const handleStorageChange = () => {
      setKegiatanList(getInitialData('ositara_kegiatan', []));
      setPendaftaranList(getInitialData('ositara_pendaftaran', []));
    };

    // Event listener saat ada perubahan localStorage dari tab/window lain
    window.addEventListener('storage', handleStorageChange);

    // Interval fallback untuk membaca perubahan dalam tab yang sama
    const interval = setInterval(() => {
      const currentKegiatan = getInitialData('ositara_kegiatan', []);
      setKegiatanList((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(currentKegiatan)) {
          return currentKegiatan;
        }
        return prev;
      });
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Simpan data pendaftaran ke LocalStorage saat state pendaftaran berubah
  useEffect(() => {
    localStorage.setItem('ositara_pendaftaran', JSON.stringify(pendaftaranList));
  }, [pendaftaranList]);

  // Cek apakah siswa sudah mendaftar pada kegiatan tertentu
  const isSudahDaftar = (kegiatanId) => {
    const namaSiswa = user?.nama || user?.name || 'Siswa';
    return pendaftaranList.some(
      (p) => p.kegiatanId === kegiatanId && (p.namaSiswa === namaSiswa || p.userNama === namaSiswa)
    );
  };

  // Handler Pendaftaran Kegiatan
  const handleDaftarKegiatan = (e) => {
    e.preventDefault();
    if (!selectedKegiatan) return;

    const pendaftaranBaru = {
      id: Date.now(),
      kegiatanId: selectedKegiatan.id,
      namaKegiatan: selectedKegiatan.namaKegiatan || selectedKegiatan.nama,
      namaSiswa: user?.nama || user?.name || 'Siswa',
      kelas: user?.kelas || 'Siswa OSITARA',
      alasan: alasanGabung,
      tanggalDaftar: new Date().toLocaleDateString('id-ID'),
    };

    const updatedPendaftaran = [pendaftaranBaru, ...pendaftaranList];
    setPendaftaranList(updatedPendaftaran);
    localStorage.setItem('ositara_pendaftaran', JSON.stringify(updatedPendaftaran));

    alert(`Berhasil mendaftar di kegiatan "${selectedKegiatan.namaKegiatan || selectedKegiatan.nama}"!`);
    setSelectedKegiatan(null);
    setAlasanGabung('');
  };

  // Filter Kegiatan berdasarkan Tab (Semua / Mendatang / Selesai)
  const filteredKegiatan = kegiatanList.filter((item) => {
    if (activeTab === 'Semua') return true;
    return item.status === activeTab;
  });

  // Filter kegiatan yang didaftari siswa ini
  const namaSiswaCurrent = user?.nama || user?.name || 'Siswa';
  const kegiatanDiikuti = pendaftaranList.filter(
    (p) => p.namaSiswa === namaSiswaCurrent || p.userNama === namaSiswaCurrent
  );

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans relative">
      {/* SIDEBAR LEFT */}
      <aside className="w-64 bg-[#2158B8] text-white flex flex-col justify-between p-6 shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <img
              src={logoOsitara}
              alt="Logo OSITARA"
              className="w-10 h-10 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">OSITARA</h1>
              <p className="text-[10px] text-blue-200 font-bold tracking-wide mt-1 uppercase">DASHBOARD SISWA</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              {
                id: 'beranda',
                label: 'Beranda',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
              },
              {
                id: 'kegiatan',
                label: 'Daftar Kegiatan',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                id: 'riwayat',
                label: 'Kegiatan Saya',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
              },
            ].map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  activeMenu === menu.id ? 'bg-[#FFF3BF] text-[#2158B8] shadow-sm' : 'hover:bg-white/10 text-white'
                }`}
              >
                <span>{menu.icon}</span>
                <span>{menu.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl font-bold text-sm transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border-2 border-white shadow-sm">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#2158B8]">
              Selamat Datang, {user?.nama || user?.name || 'Siswa'}!
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Cari dan ikuti berbagai kegiatan seru sekolah di OSITARA.
            </p>
          </div>
        </div>

        {/* 1. MENU: BERANDA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Kegiatan Tersedia</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">{kegiatanList.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Kegiatan Mendatang</p>
                <h3 className="text-3xl font-black text-[#2158B8] mt-2">
                  {kegiatanList.filter((k) => k.status === 'Mendatang').length}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Kegiatan Diikuti</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-2">{kegiatanDiikuti.length}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#2158B8] mb-4">Kegiatan Mendatang Terbaru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kegiatanList.filter((k) => k.status === 'Mendatang').length === 0 ? (
                  <p className="text-slate-400 text-sm italic col-span-2">Belum ada kegiatan mendatang saat ini.</p>
                ) : (
                  kegiatanList
                    .filter((k) => k.status === 'Mendatang')
                    .map((k) => {
                      const sudah = isSudahDaftar(k.id);
                      return (
                        <div key={k.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-800 text-base">{k.namaKegiatan || k.nama}</h4>
                              <span className="px-2.5 py-0.5 bg-blue-100 text-[#2158B8] text-[10px] font-bold rounded-full">
                                {k.tanggal}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{k.deskripsi || 'Tidak ada deskripsi.'}</p>
                          </div>

                          <div className="pt-2">
                            {sudah ? (
                              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl">
                                ✓ Sudah Terdaftar
                              </span>
                            ) : (
                              <button
                                onClick={() => setSelectedKegiatan(k)}
                                className="px-4 py-2 bg-[#FFB800] hover:bg-[#e0a200] text-slate-900 font-bold text-xs rounded-xl transition cursor-pointer"
                              >
                                Daftar Sekarang
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. MENU: DAFTAR KEGIATAN */}
        {activeMenu === 'kegiatan' && (
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-[#2158B8]">Daftar Kegiatan Sekolah</h3>
              <div className="flex bg-slate-100 p-1 rounded-2xl space-x-1">
                {['Semua', 'Mendatang', 'Selesai'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === tab ? 'bg-white text-[#2158B8] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredKegiatan.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                  Tidak ada kegiatan untuk kategori ini.
                </div>
              ) : (
                filteredKegiatan.map((k) => {
                  const sudah = isSudahDaftar(k.id);
                  return (
                    <div key={k.id} className="p-5 rounded-3xl border border-blue-100 bg-slate-50/50 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 text-base">{k.namaKegiatan || k.nama}</h4>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            k.status === 'Mendatang' ? 'bg-blue-100 text-[#2158B8]' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {k.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-3">{k.deskripsi || 'Tidak ada deskripsi rinci.'}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          Tanggal: <span className="text-[#2158B8] font-bold">{k.tanggal}</span>
                        </span>

                        {sudah ? (
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl">
                            ✓ Terdaftar
                          </span>
                        ) : k.status === 'Selesai' ? (
                          <span className="px-3 py-1.5 bg-slate-200 text-slate-500 font-bold text-xs rounded-xl">
                            Selesai
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedKegiatan(k)}
                            className="px-4 py-1.5 bg-[#FFB800] hover:bg-[#e0a200] text-slate-900 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Daftar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3. MENU: KEGIATAN SAYA */}
        {activeMenu === 'riwayat' && (
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-[#2158B8]">Kegiatan yang Anda Ikuti</h3>

            {kegiatanDiikuti.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">Anda belum mendaftar di kegiatan apa pun.</p>
              </div>
            ) : (
              <div className="border border-blue-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-blue-100 text-[#2158B8] font-bold bg-slate-50">
                      <th className="py-3.5 px-6">Nama Kegiatan</th>
                      <th className="py-3.5 px-6">Tanggal Daftar</th>
                      <th className="py-3.5 px-6">Alasan/Catatan</th>
                      <th className="py-3.5 px-6 text-center">Status Pendaftaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kegiatanDiikuti.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-6 font-bold text-slate-700">{p.namaKegiatan}</td>
                        <td className="py-3.5 px-6 text-slate-500 text-xs">{p.tanggalDaftar || '-'}</td>
                        <td className="py-3.5 px-6 text-slate-600 text-xs italic">{p.alasan || '-'}</td>
                        <td className="py-3.5 px-6 text-center">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                            Terverifikasi
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL FORM DAFTAR KEGIATAN */}
      {selectedKegiatan && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-[#2158B8] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Pendaftaran Kegiatan</h3>
                <p className="text-xs text-blue-200 mt-0.5">{selectedKegiatan.namaKegiatan || selectedKegiatan.nama}</p>
              </div>
              <button
                onClick={() => setSelectedKegiatan(null)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center font-bold text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDaftarKegiatan} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Siswa</label>
                <input
                  type="text"
                  disabled
                  value={user?.nama || user?.name || 'Siswa'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Pelaksanaan</label>
                <input
                  type="text"
                  disabled
                  value={selectedKegiatan.tanggal}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2158B8] mb-1">Alasan / Motivasimu Bergabung</label>
                <textarea
                  rows="3"
                  required
                  value={alasanGabung}
                  onChange={(e) => setAlasanGabung(e.target.value)}
                  placeholder="Contoh: Ingin menambah pengalaman dan berpartisipasi aktif..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2158B8] text-sm font-medium"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedKegiatan(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-full cursor-pointer hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FFB800] text-slate-900 font-bold text-xs rounded-full cursor-pointer hover:bg-[#e0a200] transition shadow-sm"
                >
                  Konfirmasi Daftar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
