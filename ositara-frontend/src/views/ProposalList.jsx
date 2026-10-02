import { useState } from 'react';
import ProposalForm from './ProposalForm.jsx';

export default function ProposalList({ dataProposal = [], isPengurus = false, onAddProposal, onApproveProposal }) {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProposal = dataProposal.filter(p => {
    const judul = p.judul_proposal || p.judul || '';
    const pengaju = p.pengaju || '';
    return judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pengaju.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isCreating) {
    return (
      <ProposalForm
        onBack={() => setIsCreating(false)}
        onSubmit={(newProposal) => {
          if (onAddProposal) onAddProposal(newProposal);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#2158B8]">Daftar Proposal Kegiatan</h3>
          <p className="text-xs text-slate-500">Pengajuan anggaran & izin kegiatan (Tabel: proposal_kegiatan)</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Cari proposal / pengaju..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-[#86C5FF]/60 rounded-xl text-sm focus:outline-none focus:border-[#2158B8]"
          />
          {isPengurus && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              + Ajukan Proposal
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[#2158B8] text-sm">
              <th className="py-3 px-4 font-bold">No</th>
              <th className="py-3 px-4 font-bold">Judul Proposal</th>
              <th className="py-3 px-4 font-bold">Pengaju / Sekbid</th>
              <th className="py-3 px-4 font-bold">Tanggal</th>
              <th className="py-3 px-4 font-bold text-right">Anggaran</th>
              <th className="py-3 px-4 font-bold text-center">Status</th>
              {!isPengurus && <th className="py-3 px-4 font-bold text-center">Aksi Pembina</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
            {filteredProposal.length > 0 ? (
              filteredProposal.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {item.judul_proposal || item.judul}
                  </td>
                  <td className="py-3.5 px-4">{item.pengaju}</td>
                  <td className="py-3.5 px-4">{item.tanggal_pengajuan || item.tanggal}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                    Rp {Number(item.anggaran || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status || 'Menunggu'}
                    </span>
                  </td>
                  {!isPengurus && (
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'Menunggu' && onApproveProposal ? (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => onApproveProposal(item.id, 'Disetujui')}
                            className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 cursor-pointer"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => onApproveProposal(item.id, 'Ditolak')}
                            className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isPengurus ? 6 : 7} className="py-6 text-center text-slate-400 font-medium">
                  Belum ada data proposal kegiatan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
