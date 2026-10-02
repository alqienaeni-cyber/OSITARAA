import { useState } from 'react';

export default function Proker({ dataProker = [], isPengurus = false, onAddProker }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    bidang: 'Sekbid OSIS',
    tanggal: '',
    penanggungJawab: '',
    status: 'Menunggu'
  });

  // Helper agar fleksibel membaca field beda nama (misal: 'nama' vs 'judul' vs 'judul_proposal')
  const getNama = (item) => item.nama || item.judul || item.judul_proposal || 'Proker OSIS';
  const getBidang = (item) => item.bidang || item.sekbid || item.kategori || 'Umum';
  const getTanggal = (item) => item.tanggal || item.tanggal_pengajuan || item.tgl || '-';
  const getPJ = (item) => item.penanggungJawab || item.penanggung_jawab || item.pengirim || item.pengaju || 'Pengurus OSIS';
  const getStatus = (item) => item.status || 'Menunggu';

  const filteredProker = dataProker.filter(p => {
    const namaText = getNama(p).toLowerCase();
    const bidangText = getBidang(p).toLowerCase();
    const query = searchTerm.toLowerCase();
    return namaText.includes(query) || bidangText.includes(query);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddProker) {
      onAddProker({
        id: Date.now(),
        nama: formData.nama,
        judul: formData.nama,
        judul_proposal: formData.nama,
        bidang: formData.bidang,
        tanggal: formData.tanggal,
        tanggal_pengajuan: formData.tanggal,
        penanggungJawab: formData.penanggungJawab,
        pengirim: formData.penanggungJawab,
        pengaju: formData.penanggungJawab,
        status: formData.status
      });
    }
    setIsModalOpen(false);
    setFormData({ nama: '', bidang: 'Sekbid OSIS', tanggal: '', penanggungJawab: '', status: 'Menunggu' });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2158B8]">Program Kerja (Proker)</h3>
          <p className="text-xs text-slate-500">Daftar agenda dan program kerja OSIS</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Cari nama proker atau bidang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-[#86C5FF]/60 rounded-xl text-sm focus:outline-none focus:border-[#2158B8]"
          />
          {isPengurus && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              + Ajukan Proker
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[#2158B8] text-sm">
              <th className="py-3 px-4 font-bold">No</th>
              <th className="py-3 px-4 font-bold">Nama Program Kerja</th>
              <th className="py-3 px-4 font-bold">Bidang / Sekbid</th>
              <th className="py-3 px-4 font-bold">Tanggal Pelaksanaan</th>
              <th className="py-3 px-4 font-bold">Penanggung Jawab</th>
              <th className="py-3 px-4 font-bold text-center">Status Proker</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
            {filteredProker.length > 0 ? (
              filteredProker.map((item, idx) => {
                const status = getStatus(item);
                const isDisetujui = status === 'Disetujui' || status === 'ACC' || status === 'Selesai';
                const isDitolak = status === 'Ditolak';

                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{getNama(item)}</td>
                    <td className="py-3.5 px-4">{getBidang(item)}</td>
                    <td className="py-3.5 px-4">{getTanggal(item)}</td>
                    <td className="py-3.5 px-4">{getPJ(item)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        isDisetujui ? 'bg-emerald-100 text-emerald-700' :
                        isDitolak ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                  Belum ada program kerja yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL AJUKAN PROKER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h4 className="text-lg font-bold text-[#2158B8] mb-4">Pengajuan Program Kerja Baru</h4>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Nama Proker</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Bidang / Sekbid</label>
                <input
                  type="text"
                  required
                  value={formData.bidang}
                  onChange={(e) => setFormData({ ...formData, bidang: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">PJ Proker</label>
                  <input
                    type="text"
                    required
                    value={formData.penanggungJawab}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2158B8] text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer"
                >
                  Simpan Proker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
