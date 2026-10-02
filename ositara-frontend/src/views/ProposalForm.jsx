import { useState } from 'react';

export default function ProposalForm({ onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    judul_proposal: '',
    pengaju: '',
    anggaran: '',
    tanggal_pengajuan: new Date().toISOString().split('T')[0],
    deskripsi: '',
    file_proposal: null,
    fileName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Ukuran file PDF maksimal 5 MB!');
        e.target.value = '';
        return;
      }
      setFormData((prev) => ({
        ...prev,
        file_proposal: selectedFile,
        fileName: selectedFile.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Struktur objek disesuaikan dengan kolom tabel proposal_kegiatan
      const payload = {
        id: Date.now(),
        judul_proposal: formData.judul_proposal,
        pengaju: formData.pengaju,
        anggaran: Number(formData.anggaran) || 0,
        tanggal_pengajuan: formData.tanggal_pengajuan,
        deskripsi: formData.deskripsi,
        file_proposal: formData.file_proposal,
        fileName: formData.fileName,
        status: 'Menunggu'
      };

      if (onSubmit) {
        await onSubmit(payload);
      }
    } catch (error) {
      console.error('Gagal mengirim proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#86C5FF]/40 max-w-2xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center space-x-2 text-xs font-bold text-[#2158B8] hover:underline cursor-pointer group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali ke Daftar Proposal</span>
      </button>

      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-xl font-bold text-[#2158B8]">Formulir Pengajuan Proposal</h3>
        <p className="text-xs text-slate-500">Lengkapi data untuk disimpan ke tabel proposal_kegiatan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold">
        <div>
          <label className="block text-slate-600 mb-1">Judul Proposal / Kegiatan <span className="text-rose-500">*</span></label>
          <input
            type="text"
            required
            placeholder="Contoh: Proposal Pensi 2026"
            value={formData.judul_proposal}
            onChange={(e) => setFormData({ ...formData, judul_proposal: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8] focus:ring-2 focus:ring-[#86C5FF]/40"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 mb-1">Pengaju / Sekbid <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="Contoh: Sekbid Kesenian"
              value={formData.pengaju}
              onChange={(e) => setFormData({ ...formData, pengaju: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8] focus:ring-2 focus:ring-[#86C5FF]/40"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Tanggal Pengajuan <span className="text-rose-500">*</span></label>
            <input
              type="date"
              required
              value={formData.tanggal_pengajuan}
              onChange={(e) => setFormData({ ...formData, tanggal_pengajuan: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8] focus:ring-2 focus:ring-[#86C5FF]/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-600 mb-1">Estimasi Total Anggaran (Rp) <span className="text-rose-500">*</span></label>
          <input
            type="number"
            min="0"
            required
            placeholder="Contoh: 1500000"
            value={formData.anggaran}
            onChange={(e) => setFormData({ ...formData, anggaran: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8] focus:ring-2 focus:ring-[#86C5FF]/40"
          />
        </div>

        <div>
          <label className="block text-slate-600 mb-1">Deskripsi Ringkas <span className="text-rose-500">*</span></label>
          <textarea
            rows="3"
            required
            placeholder="Jelaskan secara ringkas tujuan kegiatan..."
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2158B8] focus:ring-2 focus:ring-[#86C5FF]/40"
          ></textarea>
        </div>

        <div>
          <label className="block text-slate-600 mb-1">Lampiran File Proposal (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-slate-500 border border-slate-300 rounded-xl p-2 text-xs focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2158B8]"
          />
          {formData.fileName && (
            <p className="mt-1.5 text-xs text-emerald-600 font-semibold">
              ✓ Berkas terlampir: {formData.fileName}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#2158B8] text-white font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
}
