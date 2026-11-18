import { useState, useEffect, useCallback } from 'react';
import Login from './views/Login';
import Register from './views/Register';
import DashboardSiswa from './views/DashboardSiswa';
import DashboardKetua from './views/DashboardKetua';
import DashboardSekretaris from './views/DashboardSekretaris';
import DashboardBendahara from './views/DashboardBendahara';
import DashboardPembina from './views/DashboardPembina';
import SplashScreen from './components/SplashScreen';
import api from './api';

const getInitialUser = () => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch (err) {
      console.error('Gagal membaca sesi user:', err);
      return null;
    }
  }
  return null;
};

// EKSTRAKSI ROLE, JABATAN, & EMAIL SECARA LENGKAP
const extractRole = (userData) => {
  if (!userData) return '';
  const roleValue =
    userData.role ||
    userData.user?.role ||
    userData.jabatan ||
    userData.user?.jabatan ||
    userData.data?.role ||
    userData.data?.user?.role ||
    '';
  const usernameValue =
    userData.username ||
    userData.user?.username ||
    userData.nama ||
    userData.name ||
    '';
  const emailValue =
    userData.email ||
    userData.user?.email ||
    '';
  return `${roleValue} ${usernameValue} ${emailValue}`
    .toString()
    .toLowerCase()
    .trim();
};

// PENENTU DASHBOARD DENGAN PRIORITAS KETUA DI ATAS SEKRETARIS
const getInitialPage = (user) => {
  if (!user) return 'login';
  const info = extractRole(user);

  // PRIORITAS 1: PEMBINA
  if (info.includes('pembina')) {
    return 'dashboard-pembina';
  }
  // PRIORITAS 2: KETUA & WAKIL KETUA OSIS
  if (info.includes('ketua') || info.includes('wakil')) {
    return 'dashboard-ketua';
  }
  // PRIORITAS 3: SEKRETARIS
  if (info.includes('sekretaris')) {
    return 'dashboard-sekretaris';
  }
  // PRIORITAS 4: BENDAHARA
  if (info.includes('bendahara')) {
    return 'dashboard-bendahara';
  }
  // FALLBACK PENGURUS UMUM / ADMIN MASUK KE KETUA OSIS
  if (info.includes('pengurus') || info.includes('admin') || info.includes('osis')) {
    return 'dashboard-ketua';
  }
  // DEFAULT UNTUK SISWA
  return 'dashboard-siswa';
};

const normalizeProkerGlobal = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item) => {
      const divisi = String(item?.sekbid || item?.divisi || '').toLowerCase().trim();
      const status = String(item?.status || '').toLowerCase().trim();
      return !(
        String(item?.is_event) === '1' ||
        item?.is_event === true ||
        divisi === 'sekretaris' ||
        status === 'mendatang' ||
        status === 'berlangsung' ||
        status === 'selesai'
      );
    })
    .map((pk) => {
      const periodeVal =
        pk.periode || pk.periode_program || pk.tahun_ajaran || pk.tahunAjaran || 'Mingguan';
      return {
        ...pk,
        nama_proker: pk.nama_proker || pk.nama || pk.namaKegiatan || '-',
        nama: pk.nama || pk.nama_proker || pk.namaKegiatan || '-',
        divisi: pk.divisi || pk.sekbid || pk.penanggung_jawab || 'Umum',
        sekbid: pk.sekbid || pk.divisi || pk.penanggung_jawab || 'Umum',
        target: pk.target || pk.tanggal || '',
        tanggal: pk.tanggal || pk.target || '',
        periode: String(periodeVal).trim() || 'Mingguan',
      };
    });
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => getInitialUser());
  const [currentPage, setCurrentPage] = useState(() => getInitialPage(currentUser));

  // 1. STATE KEGIATAN OSIS
  const [kegiatanList, setKegiatanList] = useState(() => {
    const saved =
      localStorage.getItem('ositara_kegiatan') ||
      localStorage.getItem('kegiatanList');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Gagal membaca kegiatan dari localStorage:', e);
      }
    }
    return [
      {
        id: 1,
        namaKegiatan: 'Classmeeting Semester Ganjil',
        nama: 'Classmeeting Semester Ganjil',
        tanggal: '2026-12-10',
        deskripsi: 'Kegiatan perlombaan antar kelas setelah ujian.',
        status: 'Mendatang',
      },
    ];
  });

  // 2. STATE PENDAFTARAN SISWA
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const saved =
      localStorage.getItem('ositara_pendaftaran') ||
      localStorage.getItem('pendaftaranList');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // 3. STATE ANGGOTA OSIS
  const [anggotaList, setAnggotaList] = useState(() => {
    const saved =
      localStorage.getItem('ositara_anggota') ||
      localStorage.getItem('anggotaList');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Gagal membaca data anggota dari localStorage:', e);
      }
    }
    return [
      { id: 1, nis: '2023001', nama: 'Salsabila Zahir A', jabatan: 'Ketua OSIS', kelas: 'XI PPLG 1', status: 'Aktif' },
      { id: 2, nis: '2023002', nama: 'Budi Santoso', jabatan: 'Wakil Ketua', kelas: 'XI PPLG 2', status: 'Aktif' },
      { id: 3, nis: '2023003', nama: 'Siti Aminah', jabatan: 'Sekretaris', kelas: 'XI AKL 1', status: 'Aktif' },
      { id: 4, nis: '2023004', nama: 'Ahmad Rizky', jabatan: 'Bendahara', kelas: 'XI TKM 1', status: 'Aktif' },
    ];
  });

  // 4. STATE PROPOSAL
  const [proposals, setProposals] = useState(() => {
    const saved =
      localStorage.getItem('ositara_proposal') ||
      localStorage.getItem('proposals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Gagal membaca proposal dari localStorage:', e);
      }
    }
    return [
      {
        id: 1,
        judul: 'Proposal Classmeeting 2026',
        anggaran: 1500000,
        tanggal: '2026-10-01',
        fileProposal: 'Proposal_Classmeeting_2026.pdf',
        fileUrl: null,
        status: 'Menunggu Persetujuan',
        catatanRevisi: '-',
      },
    ];
  });

  // 5. STATE PROGRAM KERJA OSIS (LINEAR KE SEMUA DASHBOARD)
  const [prokerList, setProkerList] = useState(() => {
    const saved =
      localStorage.getItem('ositara_proker') ||
      localStorage.getItem('prokerList') ||
      localStorage.getItem('ositara_program_kerja');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return normalizeProkerGlobal(parsed);
      } catch (e) {
        console.error('Gagal membaca proker dari localStorage:', e);
      }
    }
    return [];
  });

  // 6. STATE KEUANGAN OSIS
  const [keuanganList, setKeuanganList] = useState(() => {
    const saved =
      localStorage.getItem('ositara_keuangan_list') ||
      localStorage.getItem('ositara_keuangan') ||
      localStorage.getItem('keuanganList');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Gagal membaca keuangan dari localStorage:', e);
      }
    }
    return [];
  });

  // SINKRONISASI REAL-TIME ANTAR DASHBOARD
  const handleGlobalSync = useCallback(() => {
    try {
      const savedProposals =
        localStorage.getItem('ositara_proposal') ||
        localStorage.getItem('proposals');
      if (savedProposals) setProposals(JSON.parse(savedProposals));

      const savedKegiatan =
        localStorage.getItem('ositara_kegiatan') ||
        localStorage.getItem('kegiatanList');
      if (savedKegiatan) setKegiatanList(JSON.parse(savedKegiatan));

      const savedAnggota =
        localStorage.getItem('ositara_anggota') ||
        localStorage.getItem('anggotaList');
      if (savedAnggota) setAnggotaList(JSON.parse(savedAnggota));

      const savedPendaftaran =
        localStorage.getItem('ositara_pendaftaran') ||
        localStorage.getItem('pendaftaranList');
      if (savedPendaftaran) setPendaftaranList(JSON.parse(savedPendaftaran));

      const savedProker =
        localStorage.getItem('ositara_proker') ||
        localStorage.getItem('prokerList') ||
        localStorage.getItem('ositara_program_kerja');
      if (savedProker) setProkerList(normalizeProkerGlobal(JSON.parse(savedProker)));

      const savedKeuangan =
        localStorage.getItem('ositara_keuangan_list') ||
        localStorage.getItem('ositara_keuangan') ||
        localStorage.getItem('keuanganList');
      if (savedKeuangan) setKeuanganList(JSON.parse(savedKeuangan));
    } catch (e) {
      console.error('Gagal merefresh state global:', e);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleGlobalSync);
    window.addEventListener('ositara_proposal_updated', handleGlobalSync);
    window.addEventListener('ositara_proker_updated', handleGlobalSync);
    window.addEventListener('ositara_anggota_updated', handleGlobalSync);
    window.addEventListener('ositara_keuangan_updated', handleGlobalSync);
    window.addEventListener('ositara-keuangan-updated', handleGlobalSync);
    window.addEventListener('ositara_pendaftaran_updated', handleGlobalSync);
    const interval = setInterval(handleGlobalSync, 1500);
    return () => {
      window.removeEventListener('storage', handleGlobalSync);
      window.removeEventListener('ositara_proposal_updated', handleGlobalSync);
      window.removeEventListener('ositara_proker_updated', handleGlobalSync);
      window.removeEventListener('ositara_anggota_updated', handleGlobalSync);
      window.removeEventListener('ositara_keuangan_updated', handleGlobalSync);
      window.removeEventListener('ositara-keuangan-updated', handleGlobalSync);
      window.removeEventListener('ositara_pendaftaran_updated', handleGlobalSync);
      clearInterval(interval);
    };
  }, [handleGlobalSync]);

  // FETCH BACKEND PROGRAM KERJA (KETUA -> SEMUA ROLE)
  useEffect(() => {
    const fetchProker = async () => {
      for (const ep of ['/program-kerja', '/program_kerja', '/prokers', '/proker']) {
        try {
          const res = await api.get(ep);
          const data = res.data?.data || res.data;
          if (Array.isArray(data) && data.length > 0) {
            const norm = normalizeProkerGlobal(data);
            setProkerList(norm);
            localStorage.setItem('ositara_proker', JSON.stringify(norm));
            localStorage.setItem('prokerList', JSON.stringify(norm));
            localStorage.setItem('ositara_program_kerja', JSON.stringify(norm));
            break;
          }
        } catch {
          // coba endpoint berikutnya
        }
      }
    };
    fetchProker();
  }, []);

  // FETCH BACKEND ANGGOTA OSIS
  useEffect(() => {
    const fetchAnggota = async () => {
      for (const ep of ['/pengurus-osis', '/pengurus_osis', '/anggota-osis', '/anggota']) {
        try {
          const res = await api.get(ep);
          const data = res.data?.data || res.data;
          if (Array.isArray(data) && data.length > 0) {
            setAnggotaList(data);
            localStorage.setItem('ositara_anggota', JSON.stringify(data));
            localStorage.setItem('anggotaList', JSON.stringify(data));
            break;
          }
        } catch {
          // coba endpoint berikutnya
        }
      }
    };
    fetchAnggota();
  }, []);

  // FETCH BACKEND EVENT
  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await api.get('/events');
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setKegiatanList(data);
          localStorage.setItem('ositara_kegiatan', JSON.stringify(data));
          localStorage.setItem('kegiatanList', JSON.stringify(data));
        }
      } catch {
        console.warn('Backend API /events tidak merespons. Menggunakan LocalStorage.');
      }
    };
    fetchKegiatan();
  }, []);

  // FETCH BACKEND PROPOSALS
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await api.get('/proposals');
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setProposals(data);
          localStorage.setItem('ositara_proposal', JSON.stringify(data));
          localStorage.setItem('proposals', JSON.stringify(data));
        }
      } catch {
        console.warn('Backend API /proposals tidak merespons. Menggunakan LocalStorage.');
      }
    };
    fetchProposals();
  }, []);

  // FETCH BACKEND KEUANGAN
  useEffect(() => {
    const fetchKeuangan = async () => {
      try {
        const res = await api.get('/keuangan');
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setKeuanganList(data);
          localStorage.setItem('ositara_keuangan_list', JSON.stringify(data));
          localStorage.setItem('ositara_keuangan', JSON.stringify(data));
          localStorage.setItem('keuanganList', JSON.stringify(data));
        }
      } catch {
        console.warn('Backend API /keuangan tidak merespons. Menggunakan LocalStorage.');
      }
    };
    fetchKeuangan();
  }, []);

  // SIMPAN OTOMATIS SAAT STATE BERUBAH
  useEffect(() => {
    if (kegiatanList && kegiatanList.length > 0) {
      localStorage.setItem('ositara_kegiatan', JSON.stringify(kegiatanList));
      localStorage.setItem('kegiatanList', JSON.stringify(kegiatanList));
    }
  }, [kegiatanList]);

  useEffect(() => {
    localStorage.setItem('pendaftaranList', JSON.stringify(pendaftaranList));
    localStorage.setItem('ositara_pendaftaran', JSON.stringify(pendaftaranList));
  }, [pendaftaranList]);

  useEffect(() => {
    if (anggotaList && anggotaList.length > 0) {
      localStorage.setItem('ositara_anggota', JSON.stringify(anggotaList));
      localStorage.setItem('anggotaList', JSON.stringify(anggotaList));
    }
  }, [anggotaList]);

  useEffect(() => {
    if (proposals && proposals.length > 0) {
      localStorage.setItem('ositara_proposal', JSON.stringify(proposals));
      localStorage.setItem('proposals', JSON.stringify(proposals));
    }
  }, [proposals]);

  useEffect(() => {
    if (prokerList && prokerList.length > 0) {
      localStorage.setItem('ositara_proker', JSON.stringify(prokerList));
      localStorage.setItem('prokerList', JSON.stringify(prokerList));
      localStorage.setItem('ositara_program_kerja', JSON.stringify(prokerList));
    }
  }, [prokerList]);

  useEffect(() => {
    localStorage.setItem('ositara_keuangan_list', JSON.stringify(keuanganList));
    localStorage.setItem('ositara_keuangan', JSON.stringify(keuanganList));
    localStorage.setItem('keuanganList', JSON.stringify(keuanganList));
  }, [keuanganList]);

  // HANDLER UPDATE KEUANGAN DARI DASHBOARD BENDAHARA SINKRON KE SEMUA DASHBOARD
  const handleUpdateKeuangan = (updatedList) => {
    setKeuanganList(updatedList);
    localStorage.setItem('ositara_keuangan_list', JSON.stringify(updatedList));
    localStorage.setItem('ositara_keuangan', JSON.stringify(updatedList));
    localStorage.setItem('keuanganList', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('ositara_keuangan_updated'));
    window.dispatchEvent(
      new CustomEvent('ositara-keuangan-updated', { detail: { keuanganList: updatedList } })
    );
  };

  const handleDaftarKegiatan = (dataPendaftaran) => {
    setPendaftaranList((prev) => {
      const updated = [dataPendaftaran, ...prev];
      localStorage.setItem('pendaftaranList', JSON.stringify(updated));
      localStorage.setItem('ositara_pendaftaran', JSON.stringify(updated));
      window.dispatchEvent(new Event('ositara_pendaftaran_updated'));
      return updated;
    });
  };

  const handleUpdateStatusProposal = (id, newStatus, catatan = '') => {
    setProposals((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              catatanRevisi: catatan,
              catatanPembina: catatan,
            }
          : item
      );
      localStorage.setItem('ositara_proposal', JSON.stringify(updated));
      localStorage.setItem('proposals', JSON.stringify(updated));
      window.dispatchEvent(new Event('ositara_proposal_updated'));
      return updated;
    });
  };

  // SPLASH SCREEN TIMER
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    const pageTarget = getInitialPage(userData);
    setCurrentPage(pageTarget);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <main className="w-full min-h-screen bg-[#F2F4F7]">
      {currentPage === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => setCurrentPage('register')}
        />
      )}

      {currentPage === 'register' && (
        <Register onGoToLogin={() => setCurrentPage('login')} />
      )}

      {/* ROUTING DASHBOARD BERDASARKAN JABATAN */}
      {currentPage === 'dashboard-siswa' && (
        <DashboardSiswa
          user={currentUser}
          onLogout={handleLogout}
          prokerList={prokerList}
          kegiatanList={kegiatanList}
          pendaftaranList={pendaftaranList}
          onDaftarKegiatan={handleDaftarKegiatan}
        />
      )}

      {currentPage === 'dashboard-ketua' && (
        <DashboardKetua
          user={currentUser}
          onLogout={handleLogout}
          initialProker={prokerList}
          initialAnggota={anggotaList}
          initialKegiatan={kegiatanList}
          initialPendaftaran={pendaftaranList}
          initialProposal={proposals}
          keuanganList={keuanganList}
        />
      )}

      {currentPage === 'dashboard-sekretaris' && (
        <DashboardSekretaris
          user={currentUser}
          onLogout={handleLogout}
          prokerList={prokerList}
          anggotaList={anggotaList}
          kegiatanList={kegiatanList}
          pendaftaranList={pendaftaranList}
          proposals={proposals}
          keuanganList={keuanganList}
        />
      )}

      {currentPage === 'dashboard-bendahara' && (
        <DashboardBendahara
          user={currentUser}
          onLogout={handleLogout}
          keuanganList={keuanganList}
          onUpdateKeuangan={handleUpdateKeuangan}
          proposalList={proposals}
          prokerList={prokerList}
          anggotaList={anggotaList}
          kegiatanList={kegiatanList}
          pesertaList={pendaftaranList}
        />
      )}

      {currentPage === 'dashboard-pembina' && (
        <DashboardPembina
          user={currentUser}
          onLogout={handleLogout}
          prokerList={prokerList}
          anggotaList={anggotaList}
          kegiatanList={kegiatanList}
          pendaftaranList={pendaftaranList}
          proposals={proposals}
          keuanganList={keuanganList}
          onUpdateProposalStatus={handleUpdateStatusProposal}
        />
      )}
    </main>
  );
}
