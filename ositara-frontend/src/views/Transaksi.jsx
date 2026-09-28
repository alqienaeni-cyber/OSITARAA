import { useState } from 'react';

export default function Transaksi({ user, onNavigate }) {
  const [transaksiList, setTransaksiList] = useState([
    { id: 1, tanggal: '2026-09-01', jenis: 'Masuk', keterangan: 'Iuran Kas Anggota Pengurus', jumlah: 500000, pembuat: 'Bendahara' },
    { id: 2, tanggal: '2026-09-05', jenis: 'Keluar', keterangan: 'Pembelian ATK & Spidol Whiteboard', jumlah: 75000, pembuat: 'Sekretaris' },
    { id: 3, tanggal: '2026-09-12', jenis: 'Masuk', keterangan: 'Dana Sponsor Lomba Debat', jumlah: 1200000, pembuat: 'Seksi Acara' },
  ]);

  const [formData, setFormData] = useState({
    jenis: 'Masuk',
    keterangan: '',
    jumlah: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.keterangan || !formData.jumlah) return;

    const newTrans = {
      id: Date.now(),
      tanggal: new Date().toISOString().split('T')[0],
      jenis: formData.jenis,
      keterangan: formData.keterangan,
      jumlah: parseFloat(formData.jumlah),
      pembuat: user?.name || 'Pengurus OSIS',
    };

    setTransaksiList([newTrans, ...transaksiList]);
    setFormData({ jenis: 'Masuk', keterangan: '', jumlah: '' });
  };

  // Hitung Total Kas
  const totalPemasukan = transaksiList
    .filter(t => t.jenis === 'Masuk')
    .reduce((acc, t) => acc + Number(t.jumlah), 0);

  const totalPengeluaran = transaksiList
    .filter(t => t.jenis === 'Keluar')
    .reduce((acc, t) => acc + Number(t.jumlah), 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  return (
    <div className="min-h-screen bg-brand-bg font-nunito flex flex-col">
      {/* Header / Navbar */}
      <header className="bg-brand-royal text-white px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('dashboard-pengurus')}
            className="bg-blue-900 hover:bg-blue-800 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            ← Dashboard
          </button>
          <div>
            <h1 className="font-bold text-lg font-poppins">OSITARA - Keuangan Kas OSIS</h1>
            <p className="text-xs text-brand-sky">Pencatatan Transaksi Pemasukan & Pengeluaran</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto w-full flex-1 space-y-6">
        {/* Ringkasan Saldo */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold">Total Saldo Kas</p>
            <h3 className="text-2xl font-extrabold text-brand-royal font-poppins mt-1">
              Rp {saldoKas.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold">Total Pemasukan</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 font-poppins mt-1">
              Rp {totalPemasukan.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold">Total Pengeluaran</p>
            <h3 className="text-2xl font-extrabold text-rose-500 font-poppins mt-1">
              Rp {totalPengeluaran.toLocaleString('id-ID')}
            </h3>
          </div>
        </div>

        {/* Form Tambah Transaksi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-base font-bold font-poppins text-brand-royal mb-4">Catat Transaksi Baru</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Transaksi</label>
              <select
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-royal"
              >
                <option value="Masuk">Pemasukan (Kas Masuk)</option>
                <option value="Keluar">Pengeluaran (Kas Keluar)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Keterangan / Keperluan</label>
              <input
                type="text"
                name="keterangan"
                required
                value={formData.keterangan}
                onChange={handleChange}
                placeholder="Contoh: Iuran Kas Bulanan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-royal"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Jumlah (Rp)</label>
              <input
                type="number"
                name="jumlah"
                required
                value={formData.jumlah}
                onChange={handleChange}
                placeholder="50000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-royal"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-golden text-brand-royal font-bold py-2.5 rounded-xl text-xs shadow-md hover:bg-amber-400 transition-all"
            >
              + Simpan Transaksi
            </button>
          </form>
        </div>

        {/* Tabel Riwayat Transaksi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-base font-bold font-poppins text-brand-royal mb-4">Riwayat Transaksi Kas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3">Pencatat</th>
                  <th className="p-3 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaksiList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 font-medium">{item.tanggal}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.jenis === 'Masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.jenis}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{item.keterangan}</td>
                    <td className="p-3 text-slate-500">{item.pembuat}</td>
                    <td className={`p-3 text-right font-bold ${
                      item.jenis === 'Masuk' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {item.jenis === 'Masuk' ? '+' : '-'} Rp {Number(item.jumlah).toLocaleString('id-ID')}
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
