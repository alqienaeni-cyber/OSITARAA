import { useState } from 'react';

export default function DashboardPembina({ user, onLogout }) {
  const [proposals] = useState([
    { id: 1, title: 'Proposal Lomba Peringatan 17 Agustus', author: 'Seksi Acara', status: 'Pending', date: '2026-08-01' },
    { id: 2, title: 'Pengadaan Perlengkapan Sound System', author: 'Seksi Sarpras', status: 'Disetujui', date: '2026-07-20' },
  ]);

  return (
    <div className="min-h-screen bg-brand-bg font-nunito flex flex-col">
      {/* Navbar Dashboard */}
      <header className="bg-brand-royal text-white px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-golden rounded-full flex items-center justify-center font-bold text-brand-royal font-poppins">
            P
          </div>
          <div>
            <h1 className="font-bold text-lg font-poppins">OSITARA - Pembina</h1>
            <p className="text-xs text-brand-sky">Selamat Datang, {user?.name || 'Pembina OSIS'}</p>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold font-poppins text-brand-royal mb-2">Persetujuan Proposal Program Kerja</h2>
          <p className="text-slate-500 text-xs mb-6">Tinjau dan berikan persetujuan untuk proposal kegiatan yang diajukan Pengurus OSIS.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Judul Proposal</th>
                  <th className="p-3">Pengaju</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{item.title}</td>
                    <td className="p-3 text-slate-600">{item.author}</td>
                    <td className="p-3 text-slate-500">{item.date}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button className="bg-brand-royal text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-800 transition-all">
                        Setujui
                      </button>
                      <button className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-bold hover:bg-slate-300 transition-all">
                        Tolak
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
