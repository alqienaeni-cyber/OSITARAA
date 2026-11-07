<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PendaftaranEventController extends Controller
{
    // GET /api/pendaftaran-event
    public function index()
    {
        try {
            $data = DB::table('pendaftaran_event')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($data, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data', 'error' => $e->getMessage()], 500);
        }
    }

    // POST /api/pendaftaran-event
    public function store(Request $request)
    {
        $request->validate([
            'nama_kegiatan' => 'required|string',
            'nama_siswa'    => 'required|string',
            'kelas'         => 'required|string',
        ]);

        $rawId        = $request->id ?? (string) Str::uuid();
        $newId        = strlen($rawId) > 36 ? (string) Str::uuid() : $rawId;

        $rawKegId     = $request->kegiatan_id ?? $request->event_id ?? '1';
        $kegiatanId   = is_numeric($rawKegId) ? (int)$rawKegId : (string)$rawKegId;

        $nisFix       = $request->nis ?? $request->nisn ?? '-';
        $namaKegiatan = $request->nama_kegiatan;
        $namaSiswa    = $request->nama_siswa;
        $kelas        = $request->kelas;
        $catatan      = $request->catatan ?? '';
        $status       = $request->status ?? $request->status_pendaftaran ?? 'Terdaftar';
        $tglDaftar    = $request->tanggal_daftar ?? now()->format('Y-m-d');

        try {
            DB::table('pendaftaran_event')->insert([
                'id'             => $newId,
                'kegiatan_id'    => $kegiatanId,
                'nama_kegiatan'  => $namaKegiatan,
                'nama_siswa'     => $namaSiswa,
                'nis'            => $nisFix,
                'kelas'          => $kelas,
                'catatan'        => $catatan,
                'status'         => $status,
                'tanggal_daftar' => $tglDaftar,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil disimpan ke tabel pendaftaran_event',
                'data'    => [
                    'id'            => $newId,
                    'kegiatan_id'   => $kegiatanId,
                    'nama_kegiatan' => $namaKegiatan,
                    'nama_siswa'    => $namaSiswa
                ]
            ], 201);

        } catch (\Exception $e) {
            // Fallback jika ID di tabel MySQL berupa INT Auto Increment
            try {
                $insertedId = DB::table('pendaftaran_event')->insertGetId([
                    'kegiatan_id'    => is_numeric($kegiatanId) ? $kegiatanId : 1,
                    'nama_kegiatan'  => $namaKegiatan,
                    'nama_siswa'     => $namaSiswa,
                    'nis'            => $nisFix,
                    'kelas'          => $kelas,
                    'catatan'        => $catatan,
                    'status'         => $status,
                    'tanggal_daftar' => $tglDaftar,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Pendaftaran berhasil disimpan',
                    'data'    => ['id' => $insertedId, 'nama_kegiatan' => $namaKegiatan]
                ], 201);

            } catch (\Exception $err) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menyimpan pendaftaran: ' . $err->getMessage()
                ], 500);
            }
        }
    }

    // DELETE /api/pendaftaran-event/{id}
    public function destroy($id)
    {
        try {
            $deleted = DB::table('pendaftaran_event')->where('id', $id)->delete();

            if (!$deleted) {
                return response()->json(['message' => 'Data tidak ditemukan'], 404);
            }

            return response()->json(['message' => 'Pendaftaran berhasil dihapus'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus', 'error' => $e->getMessage()], 500);
        }
    }
}
