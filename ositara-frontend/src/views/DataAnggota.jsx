import { useState } from 'react';
import axios from 'axios';

export default function DataAnggota({ dataAnggota = [], isPengurus = false, onUpdateAnggota, onDeleteAnggota }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: '', jabatan: '', nis: '', kelas: '', status: 'Aktif' });

  const filteredAnggota = dataAnggota.filter(a =>
    (a.nama || a.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.jabatan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.nis || a.nisn || '').includes(searchTerm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const payload = {
        nisn: formData.nis,
        nama_lengkap: formData.nama,
        jabatan: formData.jabatan,
        periode: '2026/2027',
      };

      if (formData.id) {
        // Update ke Database Laravel
        await axios.put(`/api/pengurus-osis/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Simpan Baru ke Database Laravel
        await axios.post('/api/pengurus-osis', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (onUpdateAnggota) {
        onUpdateAnggota(formData);
      }

      setIsModalOpen(false);
      setFormData({ id: null, nama: '', jabatan: '', nis: '', kelas: '', status: 'Aktif' });
      window.location.reload();

    } catch (error) {
      console.error('Gagal menyimpan data:', error.response?.data || error.message);
      // Fallback jika API backend belum aktif/offline
      if (onUpdateAnggota) {
        onUpdateAnggota(formData);
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/pengurus-osis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onDeleteAnggota) {
        onDeleteAnggota(id);
      }
      window.location.reload();
    } catch (error) {
      console.error('Gagal menghapus dari database:', error);
      if (onDeleteAnggota) {
        onDeleteAnggota(id);
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      nama: item.nama || item.nama_lengkap || '',
      jabatan: item.jabatan || '',
      nis: item.nis || item.nisn || '',
      kelas: item.kelas || '',
      status: item.status || 'Aktif'
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#86C5FF]/40 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2158B8]">Data Anggota OSIS</h3>
          <p className="text-xs text-slate-500">Daftar pengurus dan anggota aktif</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Cari nama, jabatan, atau NIS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-[#86C5FF]/60 rounded-xl text-sm focus:outline-none focus:border-[#2158B8]"
          />
          {isPengurus && (
            <button
              onClick={() => {
                setFormData({ id: null, nama: '', jabatan: '', nis: '', kelas: '', status: 'Aktif' });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-[#2158B8] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              + Tambah Anggota
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[#2158B8] text-sm">
              <th className="py-3 px-4 font-bold">No</th>
              <th className="py-3 px-4 font-bold">Nama Lengkap</th>
              <th className="py-3 px-4 font-bold">NIS</th>
              <th className="py-3 px-4 font-bold">Jabatan</th>
              <th className="py-3 px-4 font-bold">Kelas</th>
              <th className="py-3 px-4 font-bold">Status</th>
              {isPengurus && <th className="py-3 px-4 font-bold text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
            {filteredAnggota.length > 0 ? (
              filteredAnggota.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.nama || item.nama_lengkap}</td>
                  <td className="py-3.5 px-4">{item.nis || item.nisn || '-'}</td>
                  <td className="py-3.5 px-4">{item.jabatan || '-'}</td>
                  <td className="py-3.5 px-4">{item.kelas || '-'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.status || 'Aktif'}
                    </span>
                  </td>
                  {isPengurus && (
                    <td className="py-3.5 px-4 text-center space-x-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-xs font-bold text-[#2158B8] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isPengurus ? 7 : 6} className="py-6 text-center text-slate-400 font-medium">
                  Tidak ada data anggota ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT / TAMBAH ANGGOTA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h4 className="text-lg font-bold text-[#2158B8] mb-4">
              {formData.id ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">NIS</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Jabatan</label>
                <input
                  type="text"
                  required
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8]"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
