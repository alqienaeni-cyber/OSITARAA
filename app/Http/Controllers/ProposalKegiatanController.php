<?php

namespace App\Http\Controllers;

use App\Models\ProposalKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProposalKegiatanController extends Controller
{
    /**
     * Menampilkan semua data proposal
     */
    public function index()
    {
        $proposals = ProposalKegiatan::latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $proposals
        ], 200);
    }

    /**
     * Menyimpan / Mengajukan proposal baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'judul_proposal' => 'required|string|max:255',
            'kategori'       => 'nullable|string|max:100',
            'anggaran'       => 'required|numeric|min:0',
            'file_proposal'  => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ], [
            'judul_proposal.required' => 'Judul proposal wajib diisi!',
            'anggaran.required'       => 'Nominal anggaran wajib diisi!',
            'anggaran.numeric'        => 'Anggaran harus berupa angka!',
            'file_proposal.mimes'     => 'File proposal harus berformat PDF, DOC, atau DOCX!',
            'file_proposal.max'       => 'Ukuran file maksimal 5 MB!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $filePath = null;
        if ($request->hasFile('file_proposal')) {
            $filePath = $request->file('file_proposal')->store('proposals', 'public');
        }

        $proposal = ProposalKegiatan::create([
            'judul_proposal'    => $request->judul_proposal,
            'kategori'          => $request->input('kategori', 'Kegiatan'),
            'anggaran'          => $request->anggaran,
            'pengaju'           => Auth::check() ? Auth::user()->name : ($request->pengaju ?? 'Pengurus OSIS'),
            'tanggal_pengajuan' => now()->toDateString(),
            'file_proposal'     => $filePath,
            'status'            => 'Menunggu Persetujuan',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Proposal berhasil diajukan!',
            'data'    => $proposal
        ], 201);
    }

    /**
     * Menampilkan detail satu proposal berdasarkan ID
     */
    public function show($id)
    {
        $proposal = ProposalKegiatan::find($id);

        if (!$proposal) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $proposal
        ], 200);
    }

    /**
     * Memperbarui status proposal dan catatan revisi oleh Pembina
     */
    public function updateStatus(Request $request, $id)
    {
        $proposal = ProposalKegiatan::find($id);

        if (!$proposal) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status'          => 'required|string|in:Menunggu Persetujuan,Disetujui,Ditolak,Revisi',
            'catatan_pembina' => 'nullable|string',
        ], [
            'status.required' => 'Status wajib diisi!',
            'status.in'       => 'Status harus berupa: Menunggu Persetujuan, Disetujui, Ditolak, atau Revisi!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Memperbarui status sekaligus menyimpan catatan revisi dari pembina
        $proposal->update([
            'status'          => $request->status,
            'catatan_pembina' => $request->catatan_pembina ?? $proposal->catatan_pembina,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status dan catatan proposal berhasil diperbarui!',
            'data'    => $proposal
        ], 200);
    }

    /**
     * Menghapus data proposal
     */
    public function destroy($id)
    {
        $proposal = ProposalKegiatan::find($id);

        if (!$proposal) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal tidak ditemukan'
            ], 404);
        }

        $proposal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Proposal berhasil dihapus!'
        ], 200);
    }
}
