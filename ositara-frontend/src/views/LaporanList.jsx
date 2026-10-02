import { useState } from 'react';
import LaporanDetail from './LaporanDetail.jsx';

export default function LaporanList({ dataLaporan = [], isPengurus = false, onAddLaporan }) {
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [filterKategori, setFilterKategori] = useState('Semua');

  const filteredLaporan = filterKategori === 'Semua'
    ? dataLaporan
    : dataLaporan.filter(l => l.kategori === filterKategori);

  if (selectedLaporan) {
    return (
      <LaporanDetail
        laporan={selectedLaporan}
        onBack={() => setSelectedLaporan(null)}
        isPengurus={isPengurus}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#2158B8]">Daftar Laporan OSIS</h3>
          <p className="text-xs text-slate-500">Rekapitulasi laporan pertanggungjawaban (LPJ) & laporan umum</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-4 py-2 border border-[#86C5FF]/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#2158B8]"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Kegiatan">Kegiatan</option>
            <option value="Keuangan">Keuangan</option>
            <option value="Anggota">Anggota</option>
          </select>

          {isPengurus && (
            <button
              onClick={onAddLaporan}
              className="px-4 py-2 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              + Unggah Laporan
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLaporan.length > 0 ? (
          filteredLaporan.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm flex flex-col justify-between hover:border-[#2158B8] transition cursor-pointer"
              onClick={() => setSelectedLaporan(item)}
            >
              <div>
                <span className="px-3 py-1 bg-blue-50 text-[#2158B8] font-bold text-xs rounded-full inline-block mb-3">
                  {item.kategori || 'Kegiatan'}
                </span>
                <h4 className="font-bold text-[#2158B8] text-base leading-snug mb-2">{item.judul}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {item.deskripsi || 'Laporan pertanggungjawaban pelaksanaan agenda dan kegiatan OSIS.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">{item.tanggal || '2026-06-01'}</span>
                <span className="text-xs font-black text-[#2158B8] hover:underline">
                  Lihat Detail →
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium text-sm">
            Belum ada laporan yang diunggah.
          </div>
        )}
      </div>
    </div>
  );
}
