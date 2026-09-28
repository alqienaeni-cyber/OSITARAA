import { useState } from 'react';

export default function DashboardPengurus({ user, onLogout, onNavigate }) {
  const [summary] = useState({
    totalKas: 'Rp 4.500.000',
    totalProposal: 5,
    proposalPending: 2,
  });

  return (
    <div className="min-h-screen bg-brand-bg font-nunito flex flex-col">
      {/* Navbar Dashboard */}
      <header className="bg-brand-royal text-white px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-golden rounded-full flex items-center justify-center font-bold text-brand-royal font-poppins">
            O
          </div>
          <div>
            <h1 className="font-bold text-lg font-poppins">OSITARA - Pengurus OSIS</h1>
            <p className="text-xs text-brand-sky">Selamat Datang, {user?.name || 'Pengurus'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          Keluar
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto w-full flex-1 space-y-6">
        {/* Ringkasan Status */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold">Saldo Kas OSIS</p>
            <h3 className="text-2xl font-extrabold text-brand-royal font-poppins mt-1">{summary.totalKas}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold">Total Proposal Diajukan</p>
            <h3 className="text-2xl font-extrabold text-brand-royal font-poppins mt-1">{summary.totalProposal}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold">Menunggu Persetujuan</p>
            <h3 className="text-2xl font-extrabold text-amber-500 font-poppins mt-1">{summary.proposalPending}</h3>
          </div>
        </div>

        {/* Menu Navigasi Pengurus */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold font-poppins text-brand-royal mb-4">Akses Cepat Pengurus</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate && onNavigate('transaksi')}
              className="bg-brand-golden text-brand-royal px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-amber-400 transition-all shadow-sm"
            >
              💰 Kelola Transaksi / Kas
            </button>
            <button className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all">
              📄 Buat Proposal Baru
            </button>
            <button className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all">
              📅 Tambah Kegiatan Baru
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
