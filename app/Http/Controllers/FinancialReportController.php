<?php

namespace App\Http\Controllers;

use App\Models\LaporanKeuangan;
use Illuminate\Http\Request;
use Exception;

class FinancialReportController extends Controller
{
    /**
     * Menampilkan semua data laporan keuangan
     */
    public function index()
    {
        try {
            $laporan = LaporanKeuangan::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data'    => $laporan
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan data laporan keuangan baru
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'sumber'     => 'required|string|in:Kas OSIS,Anggaran Sekolah,Kas OSIS,Anggaran Sekolah',
                'jenis'      => 'required|string|in:Pemasukan,Pengeluaran',
                'keterangan' => 'required|string',
                'nominal'    => 'required|numeric',
            ]);

            $laporan = LaporanKeuangan::create([
                'sumber'     => $request->sumber,
                'jenis'      => $request->jenis,
                'keterangan' => $request->keterangan,
                'nominal'    => $request->nominal,
                'tanggal'    => $request->tanggal ?? now()->toDateString(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Laporan keuangan berhasil ditambahkan',
                'data'    => $laporan
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengupdate data laporan keuangan
     */
    public function update(Request $request, $id)
    {
        try {
            $laporan = LaporanKeuangan::find($id);

            if (!$laporan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan keuangan tidak ditemukan'
                ], 404);
            }

            $request->validate([
                'sumber'     => 'sometimes|required|string',
                'jenis'      => 'sometimes|required|string|in:Pemasukan,Pengeluaran',
                'keterangan' => 'sometimes|required|string',
                'nominal'    => 'sometimes|required|numeric',
                'tanggal'    => 'sometimes|required|date',
            ]);

            $laporan->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Laporan keuangan berhasil diperbarui',
                'data'    => $laporan
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus data laporan keuangan
     */
    public function destroy($id)
    {
        try {
            $laporan = LaporanKeuangan::find($id);

            if (!$laporan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan keuangan tidak ditemukan'
                ], 404);
            }

            $laporan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Laporan keuangan berhasil dihapus'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus: ' . $e->getMessage()
            ], 500);
        }
    }
}
