<?php

namespace App\Http\Controllers;

use App\Models\ProgramKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Exception;

class ProgramKerjaController extends Controller
{
    /**
     * Tampilkan semua data program kerja / kegiatan
     */
    public function index()
    {
        try {
            $data = ProgramKerja::orderBy('id', 'desc')->get();
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json([], 200);
        }
    }

    /**
     * Tampilkan detail data berdasarkan ID
     */
    public function show($id)
    {
        try {
            $proker = ProgramKerja::find($id);
            if (!$proker) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }
            return response()->json(['success' => true, 'data' => $proker], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Simpan data kegiatan / program kerja baru
     */
    public function store(Request $request)
    {
        try {
            $isEvent = (int) $request->input('is_event', $request->input('isEvent', 0));
            $namaProker = $request->input('nama_proker',
                $request->input('nama_kegiatan',
                $request->input('nama', 'Program Kerja')));

            $sekbidInput = $request->input('sekbid',
                $request->input('divisi', 'Sekretaris'));

            $targetInput = $request->input('target',
                $request->input('tanggal', date('Y-m-d')));

            $payload = [
                'nama_proker' => $namaProker,
                'sekbid'      => $sekbidInput,
                'target'      => $targetInput,
                'is_event'    => $isEvent,
            ];

            if (Schema::hasColumn('program_kerja', 'nama_kegiatan')) {
                $payload['nama_kegiatan'] = $namaProker;
            }
            if (Schema::hasColumn('program_kerja', 'divisi')) {
                $payload['divisi'] = $sekbidInput;
            }
            if (Schema::hasColumn('program_kerja', 'tanggal')) {
                $payload['tanggal'] = $targetInput;
            }

            // PERIODE (Mingguan, Bulanan, Tahunan)
            if (Schema::hasColumn('program_kerja', 'periode')) {
                $payload['periode'] = $request->input('periode', 'Mingguan');
            }

            // LOGIKA ATURAN ISI KONTEN (KETUA VS SEKRETARIS)
            if ($isEvent === 1) {
                // Kegiatan (Sekretaris): Mengikuti input dari Frontend
                if (Schema::hasColumn('program_kerja', 'status')) {
                    $payload['status'] = $request->input('status', 'Mendatang');
                }
                if (Schema::hasColumn('program_kerja', 'deskripsi')) {
                    $payload['deskripsi'] = $request->input('deskripsi', 'Tidak ada deskripsi');
                }
            } else {
                // Program Kerja (Ketua): Diisi string khusus (bukan NULL)
                if (Schema::hasColumn('program_kerja', 'status')) {
                    $payload['status'] = 'Tidak ada status';
                }
                if (Schema::hasColumn('program_kerja', 'deskripsi')) {
                    $payload['deskripsi'] = 'Tidak ada deskripsi';
                }
                if (Schema::hasColumn('program_kerja', 'user_id')) {
                    $payload['user_id'] = (int) $request->input('user_id', 1);
                }
            }

            $proker = ProgramKerja::create($payload);

            return response()->json([
                'success' => true,
                'message' => $isEvent === 1 ? 'Kegiatan berhasil disimpan!' : 'Program kerja berhasil disimpan!',
                'data'    => $proker
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Perbarui data kegiatan / program kerja
     */
    public function update(Request $request, $id)
    {
        try {
            $proker = ProgramKerja::find($id);
            if (!$proker) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            $isEvent = (int) $request->input('is_event', $request->input('isEvent', $proker->is_event));

            $namaProker = $request->input('nama_proker',
                $request->input('nama_kegiatan',
                $request->input('nama', $proker->nama_proker)));

            $sekbidInput = $request->input('sekbid',
                $request->input('divisi', $proker->sekbid));

            $targetInput = $request->input('target',
                $request->input('tanggal', $proker->target));

            $payload = [
                'nama_proker' => $namaProker,
                'sekbid'      => $sekbidInput,
                'target'      => $targetInput,
                'is_event'    => $isEvent,
            ];

            if (Schema::hasColumn('program_kerja', 'nama_kegiatan')) {
                $payload['nama_kegiatan'] = $namaProker;
            }
            if (Schema::hasColumn('program_kerja', 'divisi')) {
                $payload['divisi'] = $sekbidInput;
            }
            if (Schema::hasColumn('program_kerja', 'tanggal')) {
                $payload['tanggal'] = $targetInput;
            }

            if (Schema::hasColumn('program_kerja', 'periode')) {
                $payload['periode'] = $request->input('periode', $proker->periode ?? 'Mingguan');
            }

            if ($isEvent === 1) {
                // Kegiatan (Sekretaris)
                if (Schema::hasColumn('program_kerja', 'status')) {
                    $payload['status'] = $request->input('status', $proker->status ?? 'Mendatang');
                }
                if (Schema::hasColumn('program_kerja', 'deskripsi')) {
                    $payload['deskripsi'] = $request->input('deskripsi', $proker->deskripsi ?? 'Tidak ada deskripsi');
                }
            } else {
                // Program Kerja (Ketua)
                if (Schema::hasColumn('program_kerja', 'status')) {
                    $payload['status'] = 'Tidak ada status';
                }
                if (Schema::hasColumn('program_kerja', 'deskripsi')) {
                    $payload['deskripsi'] = 'Tidak ada deskripsi';
                }
            }

            $proker->update($payload);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diperbarui!',
                'data'    => $proker
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus data
     */
    public function destroy($id)
    {
        try {
            $proker = ProgramKerja::find($id);
            if ($proker) {
                $proker->delete();
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
