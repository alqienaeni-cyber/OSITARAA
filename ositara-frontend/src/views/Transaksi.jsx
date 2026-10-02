import { useState } from 'react';

export default function Transaksi({ dataKeuangan = [], isPengurus = false, onAddTransaksi }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: '',
    uraian: '',
    tipe: 'Pemasukan',
    jumlah: ''
  });

  const totalPemasukan = dataKeuangan
    .filter(k => k.tipe === 'Pemasukan')
    .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  const totalPengeluaran = dataKeuangan
    .filter(k => k.tipe === 'Pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddTransaksi) {
      onAddTransaksi({ ...formData, id: Date.now(), jumlah: Number(formData.jumlah) });
    }
    setIsModalOpen(false);
    setFormData({ tanggal: '', uraian: '', tipe: 'Pemasukan', jumlah: '' });
  };

  return (
    <div className="space-y-6">
      {/* RINGKASAN KAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
          <p className="text-xs font-bold text-slate-500">Total Pemasukan</p>
          <h4 className="text-2xl font-black text-emerald-600 mt-1">
            Rp {totalPemasukan.toLocaleString('id-ID')}
          </h4>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
          <p className="text-xs font-bold text-slate-500">Total Pengeluaran</p>
          <h4 className="text-2xl font-black text-rose-600 mt-1">
            Rp {totalPengeluaran.toLocaleString('id-ID')}
          </h4>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
          <p className="text-xs font-bold text-slate-500">Saldo Kas Saat Ini</p>
          <h4 className="text-2xl font-black text-[#2158B8] mt-1">
            Rp {saldoKas.toLocaleString('id-ID')}
          </h4>
        </div>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#2158B8]">Riwayat Arus Kas Transaksi</h3>
          {isPengurus && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              + Catat Transaksi
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#2158B8] text-sm">
                <th className="py-3 px-4 font-bold">No</th>
                <th className="py-3 px-4 font-bold">Tanggal</th>
                <th className="py-3 px-4 font-bold">Uraian Transaksi</th>
                <th className="py-3 px-4 font-bold">Tipe</th>
                <th className="py-3 px-4 font-bold text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {dataKeuangan.length > 0 ? (
                dataKeuangan.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">{idx + 1}</td>
                    <td className="py-3.5 px-4">{item.tanggal}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.uraian}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        item.tipe === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${
                      item.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {item.tipe === 'Pemasukan' ? '+' : '-'} Rp {Number(item.jumlah).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH TRANSAKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h4 className="text-lg font-bold text-[#2158B8] mb-4">Pencatatan Transaksi Kas</h4>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold">
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
                <label className="block text-slate-600 mb-1">Uraian Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian spanduk event"
                  value={formData.uraian}
                  onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Jenis Transaksi</label>
                <select
                  value={formData.tipe}
                  onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                >
                  <option value="Pemasukan">Pemasukan (+)</option>
                  <option value="Pengeluaran">Pengeluaran (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                />
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
