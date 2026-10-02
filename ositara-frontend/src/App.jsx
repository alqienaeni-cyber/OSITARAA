import { useState, useEffect } from 'react';
import Login from './views/Login';
import Register from './views/Register';
import DashboardSiswa from './views/DashboardSiswa';
import DashboardPengurus from './views/DashboardPengurus';
import DashboardPembina from './views/DashboardPembina';
import api from './api';

import logoOsitara from './assets/LOGO OSITARA.png';

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

const extractRole = (userData) => {
  if (!userData) return '';
  const roleValue =
    userData.role ||
    userData.user?.role ||
    userData.data?.role ||
    userData.data?.user?.role ||
    '';
  return roleValue.toString().toLowerCase().trim();
};

const getInitialPage = (user) => {
  if (!user) return 'login';
  const role = extractRole(user);
  const pengurusKeywords = ['pengurus', 'admin', 'osis', 'ketua', 'sekretaris', 'bendahara', 'divisi', 'seksi', 'koordinator'];

  if (role.includes('pembina')) {
    return 'dashboard-pembina';
  } else if (pengurusKeywords.some((key) => role.includes(key))) {
    return 'dashboard-pengurus';
  }
  return 'dashboard-siswa';
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => getInitialUser());
  const [currentPage, setCurrentPage] = useState(() => getInitialPage(currentUser));

  // 1. STATE KEGIATAN OSIS
  const [kegiatanList, setKegiatanList] = useState(() => {
    const saved = localStorage.getItem('kegiatanList');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Gagal membaca kegiatanList dari localStorage:', e);
      }
    }
    return [
      {
        id: 1,
        namaKegiatan: 'Classmeeting Semester Ganjil',
        nama_kegiatan: 'Classmeeting Semester Ganjil',
        tanggal: '2026-12-10',
        deskripsi: 'Kegiatan perlombaan antar kelas setelah ujian.',
        status: 'Mendatang'
      }
    ];
  });

  // 2. STATE PENDAFTARAN SISWA
  const [pendaftaranList, setPendaftaranList] = useState(() => {
    const saved = localStorage.getItem('pendaftaranList');
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
    const saved = localStorage.getItem('anggotaList');
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
    const saved = localStorage.getItem('proposals');
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
        judul_proposal: 'Proposal Classmeeting 2026',
        pengirim: 'Sekretaris OSIS',
        pengaju: 'Sekretaris OSIS',
        tanggal_pengajuan: '2026-10-01',
        anggaran: 1500000,
        deskripsi: 'Pengajuan dana dan fasilitas kegiatan classmeeting akhir semester.',
        fileName: 'Proposal_Classmeeting_2026.pdf',
        file_proposal: null,
        status: 'Menunggu',
        ttpUrl: null
      }
    ];
  });

  // FETCH KEGIATAN DARI BACKEND
  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await api.get('/events');
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setKegiatanList(data);
          localStorage.setItem('kegiatanList', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Backend API /events tidak merespons. Menggunakan LocalStorage:', err);
        const saved = localStorage.getItem('kegiatanList');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) setKegiatanList(parsed);
          } catch (e) {
            console.error('Gagal mengurai fallback kegiatanList:', e);
          }
        }
      }
    };

    fetchKegiatan();
  }, []);

  // FETCH PROPOSAL DARI BACKEND
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await api.get('/proposals');
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setProposals(data);
          localStorage.setItem('proposals', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Backend API /proposals tidak merespons (500/offline). Menggunakan LocalStorage:', err);
        const saved = localStorage.getItem('proposals');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) setProposals(parsed);
          } catch (e) {
            console.error('Gagal mengurai fallback proposals:', e);
          }
        }
      }
    };

    fetchProposals();
  }, []);

  // SINKRONISASI KE LOCALSTORAGE
  useEffect(() => {
    if (kegiatanList && kegiatanList.length > 0) {
      localStorage.setItem('kegiatanList', JSON.stringify(kegiatanList));
    }
  }, [kegiatanList]);

  useEffect(() => {
    localStorage.setItem('pendaftaranList', JSON.stringify(pendaftaranList));
  }, [pendaftaranList]);

  useEffect(() => {
    if (anggotaList && anggotaList.length > 0) {
      localStorage.setItem('anggotaList', JSON.stringify(anggotaList));
    }
  }, [anggotaList]);

  useEffect(() => {
    if (proposals && proposals.length > 0) {
      localStorage.setItem('proposals', JSON.stringify(proposals));
    }
  }, [proposals]);

  // HANDLER KEGIATAN & PENDAFTARAN
  const handleTambahKegiatan = (kegiatanBaru) => {
    setKegiatanList((prev) => {
      const updated = [kegiatanBaru, ...prev];
      localStorage.setItem('kegiatanList', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDaftarKegiatan = (dataPendaftaran) => {
    setPendaftaranList((prev) => [dataPendaftaran, ...prev]);
  };

  // HANDLER ANGGOTA
  const handleTambahAnggota = (anggotaBaru) => {
    setAnggotaList((prev) => [anggotaBaru, ...prev]);
  };

  const handleHapusAnggota = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      setAnggotaList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // HANDLER PROPOSAL / PROKER
  const handleAddProposal = (newProposal) => {
    setProposals((prev) => {
      const updated = [newProposal, ...prev];
      localStorage.setItem('proposals', JSON.stringify(updated));
      return updated;
    });
  };

  // HANDLER PERBAIKAN UNTUK MENDUKUNG TTP (TANDA TANGAN PEMBINA)
  const handleUpdateStatusProposal = (id, newStatus, catatan = '', ttpUrl = null) => {
    setProposals((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              catatanPembina: catatan,
              ttpUrl: ttpUrl || item.ttpUrl || null
            }
          : item
      );
      localStorage.setItem('proposals', JSON.stringify(updated));
      return updated;
    });
  };

  // TIMER SPLASH SCREEN
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    const role = extractRole(userData);
    const pengurusKeywords = ['pengurus', 'admin', 'osis', 'ketua', 'sekretaris', 'bendahara', 'divisi', 'seksi', 'koordinator'];

    if (role.includes('pembina')) {
      setCurrentPage('dashboard-pembina');
    } else if (pengurusKeywords.some((key) => role.includes(key))) {
      setCurrentPage('dashboard-[#pengurus');
      setCurrentPage('dashboard-pengurus');
    } else {
      setCurrentPage('dashboard-siswa');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (showSplash) {
    return (
      <div className="relative min-h-screen bg-white flex flex-col items-center justify-center p-4 overflow-hidden select-none">
        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in px-4">
          <img src={logoOsitara} alt="Logo OSITARA" className="w-32 h-32 object-contain mb-4 animate-pulse" />
          <h1 className="text-3xl font-black text-[#2158B8] tracking-wider mb-2">OSITARA</h1>
          <p className="text-xs font-bold text-[#2158B8] uppercase">SISTEM MANAJEMEN OSIS<br />SMK BUDI BAKTI CIWIDEY</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-[#F2F4F7]">
      {currentPage === 'login' && <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setCurrentPage('register')} />}
      {currentPage === 'register' && <Register onGoToLogin={() => setCurrentPage('login')} />}

      {currentPage === 'dashboard-siswa' && (
        <DashboardSiswa
          user={currentUser}
          onLogout={handleLogout}
          kegiatanList={kegiatanList}
          pendaftaranList={pendaftaranList}
          onDaftarKegiatan={handleDaftarKegiatan}
        />
      )}

      {currentPage === 'dashboard-pengurus' && (
        <DashboardPengurus
          user={currentUser}
          onLogout={handleLogout}
          kegiatanList={kegiatanList}
          pendaftaranList={pendaftaranList}
          onTambahKegiatan={handleTambahKegiatan}
          anggotaList={anggotaList}
          dataAnggota={anggotaList}
          onTambahAnggota={handleTambahAnggota}
          onHapusAnggota={handleHapusAnggota}
          proposals={proposals}
          onAddProposal={handleAddProposal}
        />
      )}

      {currentPage === 'dashboard-pembina' && (
        <DashboardPembina
          user={currentUser}
          onLogout={handleLogout}
          anggotaList={anggotaList}
          dataAnggota={anggotaList}
          kegiatanList={kegiatanList}
          pendaftaranList={pendaftaranList}
          proposals={proposals}
          onUpdateProposalStatus={handleUpdateStatusProposal}
        />
      )}
    </main>
  );
}
