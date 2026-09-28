import { useState } from 'react';

export default function LandingPage({ user, onGoToLogin, onGoToRegister, onLogout }) {
  const [activeTab, setActiveTab] = useState('semua');

  const activities = [
    { id: 1, title: 'Peringatan Hari Kemerdekaan RI', category: 'nasional', date: '17 Agustus 2026', desc: 'Serangkaian perlombaan dan upacara bendera memperingati HUT RI.' },
    { id: 2, title: 'Lomba Debat & Pidato Bahasa Indonesia', category: 'akademik', date: '25 Agustus 2026', desc: 'Wadah bagi siswa untuk mengasah kemampuan berfikir kritis dan publik speaking.' },
    { id: 3, title: 'Turnamen Futsal & Basket Inter-Class', category: 'olahraga', date: '10 September 2026', desc: 'Kompetisi olahraga tahunan antar kelas untuk menjunjung sportivitas.' },
  ];

  const filteredActivities = activeTab === 'semua'
    ? activities
    : activities.filter(act => act.category === activeTab);

  return (
    <div className="min-h-screen bg-brand-bg font-nunito text-slate-800 flex flex-col">
      {/* 1. Header / Navigation Bar */}
      <nav className="bg-brand-royal text-white px-8 py-4 sticky top-0 z-50 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-golden" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 10L3.5 8 12 4.12 20.5 8 12 12z"/>
            </svg>
          </div>
          <span className="font-poppins font-extrabold text-xl tracking-wider text-amber-300">OSITARA</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-200">
          <a href="#beranda" className="hover:text-brand-golden transition-all">Beranda</a>
          <a href="#tentang" className="hover:text-brand-golden transition-all">Tentang OSIS</a>
          <a href="#kegiatan" className="hover:text-brand-golden transition-all">Kegiatan</a>
          <a href="#pengurus" className="hover:text-brand-golden transition-all">Struktur Organisasi</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-200">Halo, <strong className="text-brand-golden">{user.name}</strong></span>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Keluar
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onGoToLogin}
                className="bg-transparent border border-brand-golden text-brand-golden hover:bg-amber-400 hover:text-brand-royal text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Masuk
              </button>
              <button
                onClick={onGoToRegister}
                className="bg-brand-golden text-brand-royal hover:bg-amber-400 text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
              >
                Daftar
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section id="beranda" className="bg-brand-royal text-white py-20 px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <span className="bg-blue-900/60 text-brand-golden border border-amber-400/30 text-[11px] font-bold px-4 py-1.5 rounded-full inline-block">
            Sistem Manajemen OSIS Terpadu
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-poppins leading-tight">
            Mewujudkan Organisasi Sekolah yang <span className="text-brand-golden">Transparan & Terstruktur</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            OSITARA mempermudah pengelolaan kegiatan, pendaftaran anggota, transparansi kas keuangan, serta pengajuan proposal dalam satu platform digital.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={onGoToRegister}
              className="bg-brand-golden text-brand-royal font-bold px-6 py-3 rounded-xl text-xs hover:bg-amber-400 shadow-lg transition-all"
            >
              Bergabung Sekarang
            </button>
            <a
              href="#kegiatan"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3 rounded-xl text-xs transition-all"
            >
              Lihat Kegiatan
            </a>
          </div>
        </div>
      </section>

      {/* 3. Section Tentang OSIS */}
      <section id="tentang" className="py-16 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold font-poppins text-brand-royal">Tentang OSIS Sekolah</h2>
          <p className="text-slate-500 text-xs mt-1">Visi dan Misi Pengurus OSIS Periode 2026/2027</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-brand-royal text-base font-poppins mb-2 flex items-center gap-2">
              <span>🎯</span> Visi Utama
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menjadikan OSIS sebagai wadah aspirasi siswa yang inklusif, kreatif, serta berintegritas tinggi dalam membentuk karakter kepemimpinan yang berasas Pancasila.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-brand-royal text-base font-poppins mb-2 flex items-center gap-2">
              <span>🚀</span> Misi Strategis
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Meningkatkan partisipasi aktif siswa dalam setiap program sekolah.</li>
              <li>Mengelola transparansi keuangan kas dan anggaran kegiatan.</li>
              <li>Menjalin komunikasi efektif antar siswa, pengurus, dan pembina.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Section Agenda / Kegiatan */}
      <section id="kegiatan" className="bg-slate-100/70 py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-poppins text-brand-royal">Agenda & Kegiatan Terbaru</h2>
            <p className="text-slate-500 text-xs mt-1">Ikuti berbagai kegiatan seru yang diselenggarakan oleh OSIS</p>
          </div>

          {/* Filter Tab */}
          <div className="flex justify-center gap-2 mb-8">
            {['semua', 'nasional', 'akademik', 'olahraga'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-brand-royal text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Cards Kegiatan */}
          <div className="grid md:grid-cols-3 gap-6">
            {filteredActivities.map((act) => (
              <div key={act.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-royal bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {act.category}
                  </span>
                  <h3 className="font-bold font-poppins text-slate-800 text-sm mt-3 mb-1">{act.title}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mb-3">📅 {act.date}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.desc}</p>
                </div>
                <button
                  onClick={onGoToRegister}
                  className="mt-6 w-full bg-slate-100 hover:bg-brand-royal hover:text-white text-slate-700 text-xs font-bold py-2 rounded-xl transition-all text-center"
                >
                  Ikut Kegiatan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Section Footer */}
      <footer className="bg-brand-royal text-white mt-auto pt-12 pb-6 px-8 border-t border-blue-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-8 text-xs">
          <div>
            <h4 className="font-poppins font-extrabold text-brand-golden text-lg mb-3">OSITARA</h4>
            <p className="text-slate-300 leading-relaxed">
              Sistem Informasi Manajemen Organisasi Siswa Intra Sekolah terpadu dan modern.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-3">Tautan Cepat</h5>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#beranda" className="hover:underline">Beranda</a></li>
              <li><a href="#tentang" className="hover:underline">Tentang OSIS</a></li>
              <li><a href="#kegiatan" className="hover:underline">Kegiatan Sekolah</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-3">Kontak Sekertariat</h5>
            <p className="text-slate-300 leading-relaxed">
              Gedung Ruang OSIS Lt. 2<br />
              Email: osis@skolah.sch.id<br />
              Telp: (021) 555-0192
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto border-t border-blue-900/60 pt-4 text-center text-[11px] text-slate-400">
          © 2026 OSITARA. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
