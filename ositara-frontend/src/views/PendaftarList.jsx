import { useState } from 'react';

export default function PendaftarList({ dataPendaftar = [], isPengurus = false, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const filteredPendaftar = dataPendaftar.filter(p => {
    const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || p.nis.includes(searchTerm);
    const matchesStatus = filterStatus === 'Semua' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2158B8]">Data Pendaftar Anggota Baru</h3>
          <p className="text-xs text-slate-500">Seleksi pendaftaran calon pengurus OSIS</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-[#86C5FF]/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#2158B8]"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diterima">Diterima</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          <input
            type="text"
            placeholder="Cari nama atau NIS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-[#86C5FF]/60 rounded-xl text-sm focus:outline-none focus:border-[#2158B8]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[#2158B8] text-sm">
              <th className="py-3 px-4 font-bold">No</th>
              <th className="py-3 px-4 font-bold">Nama Pendaftar</th>
              <th className="py-3 px-4 font-bold">NIS</th>
              <th className="py-3 px-4 font-bold">Kelas</th>
              <th className="py-3 px-4 font-bold">Pilihan Sekbid</th>
              <th className="py-3 px-4 font-bold text-center">Status</th>
              <th className="py-3 px-4 font-bold text-center">Aksi / Keputusan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
            {filteredPendaftar.length > 0 ? (
              filteredPendaftar.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.nama}</td>
                  <td className="py-3.5 px-4">{item.nis}</td>
                  <td className="py-3.5 px-4">{item.kelas}</td>
                  <td className="py-3.5 px-4">{item.pilihanSekbid || 'Sekbid 1'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status || 'Menunggu'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {onUpdateStatus ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onUpdateStatus(item.id, 'Diterima')}
                          className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => onUpdateStatus(item.id, 'Ditolak')}
                          className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition cursor-pointer"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                  Belum ada data pendaftar calon anggota.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
