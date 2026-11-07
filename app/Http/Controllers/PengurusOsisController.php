<?php

namespace App\Http\Controllers;

use App\Models\PengurusOsis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class PengurusOsisController extends Controller
{
    public function index()
    {
        try {
            $data = PengurusOsis::orderBy('id', 'desc')->get();
            return response()->json($data, 200);
        } catch (\Exception $e) {
            return response()->json([], 200);
        }
    }

    public function store(Request $request)
    {
        try {
            $payload = [
                'nisn'         => $request->input('nisn', $request->input('nis', '00000000')),
                'nama_lengkap' => $request->input('nama_lengkap', $request->input('nama', 'Pengurus Baru')),
                'jabatan'      => $request->input('jabatan', 'Anggota'),
                'sekbid'       => $request->input('sekbid', $request->input('divisi', 'Pengurus OSIS')),
            ];

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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan anggota: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $pengurus = PengurusOsis::find($id);

            if (!$pengurus) {
                $pengurus = PengurusOsis::where('nama_lengkap', 'LIKE', '%' . $request->input('nama_lengkap', $request->input('nama', '')) . '%')->first();
            }

            $payload = [
                'nisn'         => $request->input('nisn', $request->input('nis', '00000000')),
                'nama_lengkap' => $request->input('nama_lengkap', $request->input('nama', 'Pengurus')),
                'jabatan'      => $request->input('jabatan', 'Anggota'),
                'sekbid'       => $request->input('sekbid', $request->input('divisi', 'Pengurus OSIS')),
            ];

            if (!$pengurus) {
                $pengurus = PengurusOsis::create($payload);
                return response()->json(['success' => true, 'data' => $pengurus], 200);
            }

            $pengurus->update($payload);

            return response()->json(['success' => true, 'data' => $pengurus], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $pengurus = PengurusOsis::find($id);
            if ($pengurus) {
                $pengurus->delete();
            }
            return response()->json(['success' => true, 'message' => 'Berhasil dihapus'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
