<?php

namespace App\Http\Controllers;

use App\Models\ProposalKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Exception;

class ProposalKegiatanController extends Controller
{
    public function index()
    {
        try {
            $data = ProposalKegiatan::orderBy('id', 'desc')->get()->map(function ($item) {
                if ($item->file_proposal && !str_starts_with($item->file_proposal, 'http')) {
                    $item->file_url = url('/api/download-proposal/' . urlencode($item->file_proposal));
                } else {
                    $item->file_url = $item->file_proposal;
                }
                return $item;
            });
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json([], 200);
        }
    }

    public function show($id)
    {
        try {
            $proposal = ProposalKegiatan::find($id);
            if (!$proposal) {
                return response()->json(['success' => false, 'message' => 'Proposal tidak ditemukan'], 404);
            }

            if ($proposal->file_proposal && !str_starts_with($proposal->file_proposal, 'http')) {
                $proposal->file_url = url('/api/download-proposal/' . urlencode($proposal->file_proposal));
            } else {
                $proposal->file_url = $proposal->file_proposal;
            }

            return response()->json(['success' => true, 'data' => $proposal], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $judul = $request->input('judul_proposal', $request->input('judul', 'Proposal Baru'));
            $pengaju = $request->input('pengaju', $request->input('sekbid', 'Sekretaris OSIS'));

            $fileName = null;
            if ($request->hasFile('file_proposal')) {
                $file = $request->file('file_proposal');
                // Menggunakan nama asli bawaan file tanpa tambahan timestamp angka
                $fileName = $file->getClientOriginalName();
                $file->storeAs('public/proposals', $fileName);
            } else {
                $fileName = $request->input('file_proposal', $request->input('file', $request->input('fileName')));
            }

            $deskripsiVal = $request->input('deskripsi', 'Proposal diajukan oleh Sekretaris OSIS');

            $payload = [
                'judul_proposal'    => $judul,
                'pengaju'           => $pengaju,
                'tanggal_pengajuan' => $request->input('tanggal_pengajuan', $request->input('tanggal', date('Y-m-d'))),
                'status'            => $request->input('status', 'Menunggu Persetujuan'),
            ];

            if (Schema::hasColumn('proposal_kegiatan', 'kategori')) {
                $payload['kategori'] = $request->input('kategori', 'Kegiatan');
            }
            if (Schema::hasColumn('proposal_kegiatan', 'anggaran')) {
                $payload['anggaran'] = $request->input('anggaran', 0);
            }
            if (Schema::hasColumn('proposal_kegiatan', 'deskripsi')) {
                $payload['deskripsi'] = $deskripsiVal;
            }
            if (Schema::hasColumn('proposal_kegiatan', 'file_proposal')) {
                $payload['file_proposal'] = $fileName;
            }
            if (Schema::hasColumn('proposal_kegiatan', 'catatan_pembina')) {
                $payload['catatan_pembina'] = '-';
            }

            $proposal = ProposalKegiatan::create($payload);

            if ($proposal->file_proposal) {
                $proposal->file_url = url('/api/download-proposal/' . urlencode($proposal->file_proposal));
            }

            return response()->json([
                'success' => true,
                'message' => 'Proposal berhasil diajukan',
                'data'    => $proposal
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan proposal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $proposal = ProposalKegiatan::find($id);
            if (!$proposal) {
                return response()->json(['success' => false, 'message' => 'Proposal tidak ditemukan'], 404);
            }

            $payload = [];

            if ($request->has('judul_proposal') || $request->has('judul')) {
                $payload['judul_proposal'] = $request->input('judul_proposal', $request->input('judul'));
            }

            if ($request->has('anggaran')) {
                $payload['anggaran'] = $request->input('anggaran');
            }

            if ($request->has('kategori') && Schema::hasColumn('proposal_kegiatan', 'kategori')) {
                $payload['kategori'] = $request->input('kategori');
            }

            if ($request->has('status')) {
                $payload['status'] = $request->input('status');
            }

            $catatanVal = $request->input('catatan_pembina', $request->input('catatan_revisi', $request->input('catatan')));
            if ($catatanVal !== null) {
                if (Schema::hasColumn('proposal_kegiatan', 'catatan_pembina')) {
                    $payload['catatan_pembina'] = $catatanVal;
                }
                if (Schema::hasColumn('proposal_kegiatan', 'catatan_revisi')) {
                    $payload['catatan_revisi'] = $catatanVal;
                }
            }

            if ($request->hasFile('file_proposal')) {
                if ($proposal->file_proposal && Storage::exists('public/proposals/' . $proposal->file_proposal)) {
                    Storage::delete('public/proposals/' . $proposal->file_proposal);
                }

                $file = $request->file('file_proposal');
                $fileName = $file->getClientOriginalName();
                $file->storeAs('public/proposals', $fileName);
                $payload['file_proposal'] = $fileName;
            } else if ($request->has('file_proposal') && !empty($request->input('file_proposal'))) {
                $payload['file_proposal'] = $request->input('file_proposal');
            }

            if ($request->has('deskripsi')) {
                $payload['deskripsi'] = $request->input('deskripsi');
            }

            $proposal->update($payload);

            if ($proposal->file_proposal) {
                $proposal->file_url = url('/api/download-proposal/' . urlencode($proposal->file_proposal));
            }

            return response()->json([
                'success' => true,
                'message' => 'Proposal revisi berhasil diperbarui!',
                'data'    => $proposal
            ], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        return $this->update($request, $id);
    }

    public function destroy($id)
    {
        try {
            $proposal = ProposalKegiatan::find($id);
            if ($proposal) {
                if ($proposal->file_proposal && Storage::exists('public/proposals/' . $proposal->file_proposal)) {
                    Storage::delete('public/proposals/' . $proposal->file_proposal);
                }
                $proposal->delete();
            }
            return response()->json(['success' => true, 'message' => 'Proposal berhasil dihapus'], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Route khusus pengunduhan berkas PDF tanpa melewati symlink storage (Bebas 403 Forbidden)
     */
    public function downloadFile($filename)
    {
        $decodedFilename = urldecode($filename);
        $path = 'public/proposals/' . $decodedFilename;

        if (!Storage::exists($path)) {
            return response()->json(['message' => 'Berkas tidak ditemukan'], 404);
        }

        return Storage::download($path, $decodedFilename);
    }
}
