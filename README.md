<div align="center">
  <img src="ositara-frontend/src/assets/LOGO OSITARA.png" alt="Logo OSITARA" width="120" />
  <h1>OSITARA</h1>
  <p><strong>Sistem Manajemen OSIS Digital Terintegrasi</strong></p>
  <p>
    <em>Platform digitalisasi administrasi, pengajuan proposal kegiatan, pencatatan keuangan kas, dan pendaftaran event OSIS berbasis web.</em>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/MySQL_%2F_SQLite-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="Database" />
  </p>
</div>

---

## 📋 Daftar Isi
- [Tentang Proyek](#-tentang-proyek)
- [Latar Belakang Masalah](#-latar-belakang-masalah)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack & Arsitektur](#-tech-stack--arsitektur)
- [Struktur Repositori](#-struktur-repositori)
- [Akses Aplikasi Online (Live Demo)](#-akses-aplikasi-online-live-demo)
- [Panduan Instalasi Lokal (Local Setup)](#-panduan-instalasi-lokal-local-setup)
- [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
- [Akun Uji Coba Default](#-akun-uji-coba-default)
- [Tim Pengembang](#-tim-pengembang)

---

## 📖 Tentang Proyek
**OSITARA** adalah aplikasi web berbasis *Monorepo* (RESTful API Backend & Single Page Application Frontend) yang dirancang untuk mendigitalisasi tata kelola organisasi siswa di sekolah (OSIS)[cite: 55, 60]. Proyek ini dikembangkan sebagai pemenuhan tugas **Uji Kompetensi Keahlian (UKK) Rekayasa Perangkat Lunak (RPL) Tahun Ajaran 2026/2027**[cite: 55, 61].

---

## 🎯 Latar Belakang Masalah
Pengelolaan administrasi OSIS secara konvensional sering menghadapi beberapa kendala operasional di lingkungan sekolah:
1. **Dokumen Terfragmentasi:** Arsip proposal kegiatan, surat-menyurat, dan program kerja masih tersebar secara fisik maupun file terpisah sehingga rawan hilang[cite: 61].
2. **Alur Persetujuan (Approval) Lambat:** Proses pengajuan proposal dari Sekretaris ke Pembina OSIS memakan waktu lama karena membutuhkan pertemuan fisik dan revisi manual[cite: 61].
3. **Transparansi Keuangan Kas:** Pencatatan pemasukan dan pengeluaran dana kas OSIS belum terpusat dan sulit diaudit secara *real-time*[cite: 61].
4. **Pendataan Event Manual:** Pendaftaran peserta kegiatan/lomba sekolah masih dilakukan secara manual tanpa pemantauan kuota secara langsung.

---

## ✨ Fitur Utama
- **Autentikasi & Otorisasi Multi-Role:** Pembatasan hak akses menggunakan Laravel Sanctum dan `RoleCheckMiddleware` dengan dashboard khusus untuk setiap peran (`Pembina`, `Ketua OSIS`, `Sekretaris`, `Bendahara`, `Pengurus`, dan `Siswa`)[cite: 56, 61].
- **Manajemen Proposal & Program Kerja (Sekretaris):** Pengajuan dokumen proposal (PDF/Word maksimal 2MB), pengelolaan program kerja (Proker), serta pemantauan status revisi[cite: 56, 61, 62].
- **Portal Approval & Monitoring (Pembina & Ketua OSIS):** Peninjauan berkas proposal secara langsung dengan status persetujuan (`Disetujui`, `Revisi`, `Ditolak`) beserta catatan umpan balik[cite: 56, 61].
- **Pencatatan Kas & Laporan Keuangan (Bendahara):** Pencatatan transaksi kas masuk/keluar, rekapitulasi saldo otomatis, serta ekspor laporan keuangan ke format PDF (DomPDF)[cite: 61].
- **Landing Page & Pendaftaran Event (Siswa):** Halaman informasi publik kegiatan OSIS serta pendaftaran event sekolah dengan validasi kuota *real-time*[cite: 56, 62].

---

## 🛠️ Tech Stack & Arsitektur

| Lapisan (Layer) | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS | Antarmuka pengguna responsif & SPA (`ositara-frontend/`)[cite: 55, 56] |
| **HTTP Client** | Axios | Komunikasi REST API (`src/api.js`) & manajemen token autentikasi |
| **Backend** | Laravel (PHP 8.2+) | RESTful API, validasi ganda, & logika bisnis inti[cite: 56, 61] |
| **Autentikasi** | Laravel Sanctum | Manajemen *Bearer Token* & proteksi *endpoint* berbasis peran |
| **Database** | MySQL / SQLite | Penyimpanan data relasional (`db_ositara` / `database.sqlite`)[cite: 55, 57, 61] |
| **PDF Generator** | Laravel DomPDF | Pembuatan laporan keuangan & rekapitulasi otomatis[cite: 61] |

---

## 📂 Struktur Repositori
Proyek ini menggunakan struktur **Monorepo** yang memisahkan kode sumber Backend dan Frontend dalam satu repositori[cite: 55, 59]:

```text
ositara/
├── api-tests/                      # Koleksi pengujian endpoint REST API
├── app/                            # Controllers, Models, & RoleCheckMiddleware (Laravel)
├── bootstrap/                      # Konfigurasi inisialisasi framework Laravel
├── config/                         # File konfigurasi sistem (app, auth, database, cors, sanctum)
├── database/
│   ├── factories/                  # Factory data dummy (UserFactory.php)
│   ├── migrations/                 # Skema tabel database OSITARA
│   ├── seeders/                    # Data awal & akun default aplikasi
│   └── database.sqlite             # Database SQLite siap pakai untuk pengujian cepat
├── ositara-frontend/               # Aplikasi Frontend (React + Vite)
│   ├── public/                     # Aset statis publik
│   ├── src/
│   │   ├── assets/                 # Aset gambar & LOGO OSITARA.png
│   │   ├── components/             # Komponen UI reusable
│   │   ├── views/                  # Halaman antarmuka pengguna:
│   │   │   ├── DashboardBendahara.jsx
│   │   │   ├── DashboardKetua.jsx
│   │   │   ├── DashboardPembina.jsx
│   │   │   ├── DashboardPengurus.jsx
│   │   │   ├── DashboardSekretaris.jsx
│   │   │   ├── DashboardSiswa.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── api.js                  # Konfigurasi Axios Client
│   │   ├── App.jsx                 # Routing utama aplikasi
│   │   └── main.jsx                # Entry point React
│   ├── index.html                  # Template HTML utama
│   ├── package.json                # Dependensi Node.js / React
│   └── vite.config.js              # Konfigurasi bundler Vite
├── public/
│   └── storage/proposals/          # Direktori penyimpanan unggahan berkas proposal
├── resources/views/errors/         # Halaman kustom error (403, 404, 500)
├── routes/                         # Definisi rute API (api.php) & Web
├── storage/                        # Log sistem & penyimpanan lokal Laravel
├── .env.example                    # Template konfigurasi environment Backend
├── composer.json                   # Dependensi PHP / Laravel
└── README.md                       # Dokumentasi utama repositori
