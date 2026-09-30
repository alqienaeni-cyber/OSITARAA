import { useState } from 'react';

export default function VerifikasiProposal({ proposalData, onBack, onApprove, onReject }) {
const [catatan, setCatatan] = useState('');
const [notification, setNotification] = useState(null);

  // Data default jika proposalData belum dikirim lewat props
const proposal = proposalData || {
    id: 1,
    judul: 'Proposal Classmeeting 2026',
    pengirim: 'Pengurus OSIS (Sekretaris)',
    fileUrl: '#',
    fileName: 'Proposal_Classmeeting_2026.pdf'
  };

  const handleSetujui = () => {
    setNotification({
      type: 'success',
      message: 'Proposal Berhasil Disetujui!'
    });
    if (onApprove) onApprove(proposal.id, catatan);
  };

  const handleTolak = () => {
    setNotification({
      type: 'error',
      message: 'Proposal Ditolak!'
    });
    if (onReject) onReject(proposal.id, catatan);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] p-6 md:p-10 font-nunito flex flex-col items-center justify-center">

      {/* NOTIFIKASI POPUP/BANNER */}
      {notification && (
        <div className={`w-full max-w-2xl mb-4 p-4 rounded-2xl text-center font-bold text-sm shadow-md transition ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* KARTU UTAMA VERIFIKASI PROPOSAL */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl w-full max-w-2xl border border-slate-100">

        {/* BUTTON KEMBALI */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center space-x-2 text-xs font-bold text-[#2158B8] hover:underline cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Dashboard</span>
          </button>
        )}

        {/* HEADER: JUDUL PROPOSAL & DIAJUKAN OLEH */}
        <div className="bg-white p-5 rounded-2xl border border-[#86C5FF]/50 shadow-sm flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 bg-[#2158B8] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            {/* SVG Icon Amplop / Dokumen Upload */}
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-black font-poppins text-[#2158B8] leading-tight">
              {proposal.judul}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">
              Diajukan Oleh: <span className="text-[#2158B8] font-bold">{proposal.pengirim}</span>
            </p>
          </div>
        </div>

        {/* INPUT DESKRIPSI / CATATAN REVISI */}
        <div className="mb-6 text-left">
          <label className="block text-sm font-bold text-[#2158B8] mb-2">
            Deskripsi / Catatan Pembina
          </label>
          <textarea
            rows="4"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tuliskan catatan atau deskripsi untuk menyetujui atau menolak proposal..."
            className="w-full p-4 bg-white border border-[#86C5FF]/60 rounded-2xl text-slate-700 font-semibold text-sm focus:outline-none focus:border-[#2158B8] focus:ring-2 focus:ring-[#86C5FF]/40 transition resize-none"
          ></textarea>
        </div>

        {/* DOKUMEN PROPOSAL */}
        <div className="mb-8 text-left">
          <h3 className="text-lg font-black font-poppins text-[#2158B8] mb-3">
            Dokumen Proposal
          </h3>
          <div className="bg-white p-4 rounded-2xl border border-[#86C5FF]/50 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#2158B8] text-white rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-[#2158B8] text-base truncate max-w-[200px] sm:max-w-xs">
                {proposal.fileName || 'Proposal'}
              </span>
            </div>

            {/* BUTTON LIHAT FILE */}
            <a
              href={proposal.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-[#2158B8] hover:underline bg-[#86C5FF]/20 hover:bg-[#86C5FF]/40 px-4 py-2 rounded-xl transition"
            >
              Lihat
            </a>
          </div>
        </div>

        {/* TOMBOL TOLAK DAN SETUJUI */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleTolak}
            className="w-full py-3.5 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-base rounded-2xl shadow-md transition transform active:scale-95 cursor-pointer"
          >
            Tolak
          </button>

          <button
            type="button"
            onClick={handleSetujui}
            className="w-full py-3.5 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-base rounded-2xl shadow-md transition transform active:scale-95 cursor-pointer"
          >
            Setujui
          </button>
        </div>

      </div>
    </div>
  );
}
