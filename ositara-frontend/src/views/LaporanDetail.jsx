export default function LaporanDetail({ laporan, onBack }) {
  if (!laporan) return null;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#86C5FF]/40 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 flex items-center space-x-2 text-xs font-bold text-[#2158B8] hover:underline cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali ke Daftar Laporan</span>
      </button>

      <div className="border-b border-slate-100 pb-5 mb-6">
        <span className="px-3 py-1 bg-blue-100 text-[#2158B8] font-bold text-xs rounded-full">
          {laporan.kategori || 'Laporan'}
        </span>
        <h2 className="text-2xl font-black text-[#2158B8] mt-3">{laporan.judul}</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Diupload pada: {laporan.tanggal || '2026-06-01'} | Oleh: {laporan.penulis || 'Pengurus OSIS'}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-bold text-[#2158B8] mb-2">Ringkasan Laporan</h4>
          <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {laporan.deskripsi || 'Laporan pertanggungjawaban lengkap dapat diunduh melalui tautan berkas resmi di bawah ini.'}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[#2158B8] mb-3">Berkas Lampiran</h4>
          <div className="bg-white p-4 rounded-2xl border border-[#86C5FF]/60 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#2158B8]/10 text-[#2158B8] rounded-xl flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm truncate max-w-xs md:max-w-md">
                  {laporan.fileName || `${laporan.judul}.pdf`}
                </p>
                <p className="text-xs text-slate-400">Dokumen Resmi (PDF)</p>
              </div>
            </div>

            <a
              href={laporan.fileUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#2158B8] bg-[#FFF5BF] hover:bg-[#ffe875] px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              Unduh / Lihat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
