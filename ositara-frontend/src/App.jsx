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
    }
  }
  return null;
};

// EKSTRAKSI ROLE, JABATAN, & USERNAME SECARA LENGKAP
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

  return `${roleValue} ${usernameValue} ${emailValue}`.toString().toLowerCase().trim();
};

// PENENTU DASHBOARD DENGAN PRIORITAS JABATAN SPESIFIK
const getInitialPage = (user) => {
  if (!user) return 'login';
  const info = extractRole(user);

  // PRIORITAS 1: PEMBINA
  if (info.includes('pembina')) {
    return 'dashboard-pembina';
  }

  // PRIORITAS 2: SEKRETARIS (Harus di atas Ketua & Pengurus)
  if (info.includes('sekretaris') || info.includes('sekre')) {
    return 'dashboard-sekretaris';
  }

  // PRIORITAS 3: BENDAHARA
  if (info.includes('bendahara') || info.includes('beendaraha')) {
    return 'dashboard-bendahara';
  }

  // PRIORITAS 4: KETUA / PENGURUS UTAMA
  if (info.includes('ketua')) {
    return 'dashboard-ketua';
  }

  // FALLBACK PENGURUS UMUM / ADMIN
  if (info.includes('pengurus') || info.includes('admin') || info.includes('osis')) {
    return 'dashboard-ketua';
  }

  // DEFAULT FOR SISWA
  return 'dashboard-siswa';
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => getInitialUser());
  const [currentPage, setCurrentPage] = useState(() => getInitialPage(currentUser));

  // 1. STATE KEGIATAN OSIS
  const [kegiatanList, setKegiatanList] = useState(() => {
    const saved = localStorage.getItem('ositara_kegiatan') || localStorage.getItem('kegiatanList');
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
        status: 'Mendatang'
      }
    ];
  });

  // 2. STATE PENDAFTARAN SISWA (SINKRON DENGAN 'ositara_pendaftaran' & 'pendaftaranList')
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const saved = localStorage.getItem('ositara_pendaftaran') || localStorage.getItem('pendaftaranList');
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
    const saved = localStorage.getItem('ositara_anggota') || localStorage.getItem('anggotaList');
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
    const saved = localStorage.getItem('ositara_proposal') || localStorage.getItem('proposals');
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
        catatanRevisi: '-'
      }
    ];
  });

  // SINKRONISASI REAL-TIME DENGAN PENDAFTARAN KEGIATAN
  const handleGlobalSync = useCallback(() => {
    try {
      const savedProposals = localStorage.getItem('ositara_proposal') || localStorage.getItem('proposals');
      if (savedProposals) setProposals(JSON.parse(savedProposals));

      const savedKegiatan = localStorage.getItem('ositara_kegiatan') || localStorage.getItem('kegiatanList');
      if (savedKegiatan) setKegiatanList(JSON.parse(savedKegiatan));

      const savedAnggota = localStorage.getItem('ositara_anggota') || localStorage.getItem('anggotaList');
      if (savedAnggota) setAnggotaList(JSON.parse(savedAnggota));

      const savedPendaftaran = localStorage.getItem('ositara_pendaftaran') || localStorage.getItem('pendaftaranList');
      if (savedPendaftaran) setPendaftaranList(JSON.parse(savedPendaftaran));
    } catch (e) {
      console.error('Gagal merefresh state global:', e);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleGlobalSync);
    window.addEventListener('ositara_proposal_updated', handleGlobalSync);
    window.addEventListener('ositara_proker_updated', handleGlobalSync);
    window.addEventListener('ositara_keuangan_updated', handleGlobalSync);
    window.addEventListener('ositara_pendaftaran_updated', handleGlobalSync);

    const interval = setInterval(handleGlobalSync, 1000);

    return () => {
      window.removeEventListener('storage', handleGlobalSync);
      window.removeEventListener('ositara_proposal_updated', handleGlobalSync);
      window.removeEventListener('ositara_proker_updated', handleGlobalSync);
      window.removeEventListener('ositara_keuangan_updated', handleGlobalSync);
      window.removeEventListener('ositara_pendaftaran_updated', handleGlobalSync);
      clearInterval(interval);
    };
  }, [handleGlobalSync]);

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
              catatanPembina: catatan
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
        <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setCurrentPage('register')} />
      )}
      {currentPage === 'register' && (
        <Register onGoToLogin={() => setCurrentPage('login')} />
      )}

      {/* ROUTING DASHBOARD BERDASARKAN JABATAN */}
      {currentPage === 'dashboard-siswa' && (
        <DashboardSiswa
          user={currentUser}
          onLogout={handleLogout}
          kegiatanList={kegiatanList}
          pendaftaranList={pendaftaranList}
          onDaftarKegiatan={handleDaftarKegiatan}
        />
      )}

      {currentPage === 'dashboard-ketua' && (
        <DashboardKetua
          user={currentUser}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'dashboard-sekretaris' && (
        <DashboardSekretaris
          user={currentUser}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'dashboard-bendahara' && (
        <DashboardBendahara
          user={currentUser}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'dashboard-pembina' && (
        <DashboardPembina
          user={currentUser}
          onLogout={handleLogout}
          anggotaList={anggotaList}
          kegiatanList={kegiatanList}
          pendaftaranList={pendaftaranList}
          proposals={proposals}
          onUpdateProposalStatus={handleUpdateStatusProposal}
        />
      )}
    </main>
  );
}
