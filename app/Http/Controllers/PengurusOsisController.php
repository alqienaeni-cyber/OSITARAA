<?php

namespace App\Http\Controllers;

use App\Models\PengurusOsis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Exception;

class PengurusOsisController extends Controller
{
    /**
     * Tampilkan semua data pengurus OSIS
     */
    public function index()
    {
        try {
            $data = PengurusOsis::orderBy('id', 'desc')->get();
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json([], 200);
        }
    }

    /**
     * Tampilkan detail pengurus berdasarkan ID
     */
    public function show($id)
    {
        try {
            $pengurus = PengurusOsis::find($id);
            if (!$pengurus) {
                return response()->json(['success' => false, 'message' => 'Anggota tidak ditemukan'], 404);
            }
            return response()->json(['success' => true, 'data' => $pengurus], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Simpan data pengurus OSIS baru
     */
    public function store(Request $request)
    {
        try {
            $payload = [
                'nisn'         => $request->input('nisn', $request->input('nis', '00000000')),
                'nama_lengkap' => $request->input('nama_lengkap', $request->input('nama', 'Pengurus Baru')),
                'jabatan'      => $request->input('jabatan', 'Anggota'),
            ];

            if (Schema::hasColumn('pengurus_osis', 'sekbid')) {
                $payload['sekbid'] = $request->input('sekbid', $request->input('divisi', 'Pengurus OSIS'));
            }

            if (Schema::hasColumn('pengurus_osis', 'periode')) {
                $payload['periode'] = $request->input('periode', '2026/2027');
            }

            if (Schema::hasColumn('pengurus_osis', 'user_id')) {
                $payload['user_id'] = $request->input('user_id', 1);
            }

            $pengurus = PengurusOsis::create($payload);

            return response()->json([
                'success' => true,
                'message' => 'Anggota OSIS berhasil disimpan',
                'data'    => $pengurus
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan anggota: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Perbarui data pengurus OSIS
     */
    public function update(Request $request, $id)
    {
        try {
            $pengurus = PengurusOsis::find($id);

            // Fallback cari berdasarkan nama jika ID tidak cocok
            if (!$pengurus) {
                $namaSearch = $request->input('nama_lengkap', $request->input('nama', ''));
                if (!empty($namaSearch)) {
                    $pengurus = PengurusOsis::where('nama_lengkap', 'LIKE', '%' . $namaSearch . '%')->first();
                }
            }

            $payload = [
                'nisn'         => $request->input('nisn', $request->input('nis', '00000000')),
                'nama_lengkap' => $request->input('nama_lengkap', $request->input('nama', 'Pengurus')),
                'jabatan'      => $request->input('jabatan', 'Anggota'),
            ];

            if (Schema::hasColumn('pengurus_osis', 'sekbid')) {
                $payload['sekbid'] = $request->input('sekbid', $request->input('divisi', 'Pengurus OSIS'));
            }

            if (Schema::hasColumn('pengurus_osis', 'periode')) {
                $payload['periode'] = $request->input('periode', '2026/2027');
            }

            // Jika pengurus belum ada sama sekali, buat baru (Upsert fallback)
            if (!$pengurus) {
                $pengurus = PengurusOsis::create($payload);
                return response()->json(['success' => true, 'data' => $pengurus], 200);
            }

            $pengurus->update($payload);

            return response()->json(['success' => true, 'data' => $pengurus], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus data pengurus OSIS
     */
    public function destroy($id)
    {
        try {
            $pengurus = PengurusOsis::find($id);
            if ($pengurus) {
                $pengurus->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil dihapus'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
