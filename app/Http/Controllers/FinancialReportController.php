<?php

namespace App\Http\Controllers;

use App\Models\LaporanKeuangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FinancialReportController extends Controller
{
    /**
     * Menampilkan seluruh daftar transaksi keuangan beserta ringkasan agregat.
     */
    public function index()
    {
        try {
            $data = LaporanKeuangan::orderBy('tanggal', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data laporan keuangan berhasil diambil',
                'data'    => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data laporan keuangan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rekapitulasi agregat keuangan menggunakan SQL SUM dan COUNT (GROUP BY jenis & sumber).
     */
    public function rekap()
    {
        try {
            $rekapPerJenis = LaporanKeuangan::select(
                'jenis',
                DB::raw('COUNT(*) as jumlah_transaksi'),
                DB::raw('SUM(nominal) as total_nominal')
            )
                ->groupBy('jenis')
                ->get();

            $rekapPerSumber = LaporanKeuangan::select(
                'sumber',
                'jenis',
                DB::raw('COUNT(*) as jumlah_transaksi'),
                DB::raw('SUM(nominal) as total_nominal')
            )
                ->groupBy('sumber', 'jenis')
                ->get();

            $totalPemasukan = (float) LaporanKeuangan::where('jenis', 'Pemasukan')->sum('nominal');
            $totalPengeluaran = (float) LaporanKeuangan::where('jenis', 'Pengeluaran')->sum('nominal');
            $jumlahTransaksi = (int) LaporanKeuangan::count();

            return response()->json([
                'success' => true,
                'message' => 'Rekap agregat keuangan berhasil dihitung',
                'data'    => [
                    'total_pemasukan'   => $totalPemasukan,
                    'total_pengeluaran' => $totalPengeluaran,
                    'saldo_akhir'       => $totalPemasukan - $totalPengeluaran,
                    'jumlah_transaksi'  => $jumlahTransaksi,
                    'per_jenis'         => $rekapPerJenis,
                    'per_sumber'        => $rekapPerSumber,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghitung rekap keuangan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Menyimpan transaksi kas baru (dengan proteksi anti double-submit & respons 409 jika duplikat).
     */
    public function store(Request $request)
    {
        $nominalInput = $request->input('nominal', $request->input('jumlah'));
        $jenisInput = $request->input('jenis', $request->input('kategori'));

        $validator = Validator::make([
            'tanggal'    => $request->input('tanggal', now()->toDateString()),
            'keterangan' => $request->input('keterangan'),
            'sumber'     => $request->input('sumber', 'Kas OSIS'),
            'jenis'      => $jenisInput,
            'nominal'    => $nominalInput,
        ], [
            'tanggal'    => 'required|date',
            'keterangan' => 'required|string|max:255',
            'sumber'     => 'nullable|string|max:100',
            'jenis'      => 'required|in:Pemasukan,Pengeluaran',
            'nominal'    => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi data keuangan gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $tanggalClean = $request->input('tanggal', now()->toDateString());
            $keteranganClean = trim($request->input('keterangan'));
            $nominalClean = (float) $nominalInput;

            // Cek apakah transaksi identik sudah tercatat pada tanggal yang sama
            $duplikat = LaporanKeuangan::where('tanggal', $tanggalClean)
                ->where('keterangan', $keteranganClean)
                ->where('jenis', $jenisInput)
                ->where('nominal', $nominalClean)
                ->first();

            if ($duplikat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi "' . $keteranganClean . '" sudah tercatat hari ini! Data duplikat tidak disimpan.',
                    'data'    => $duplikat,
                ], 409);
            }

            $laporan = LaporanKeuangan::create([
                'tanggal'    => $tanggalClean,
                'keterangan' => $keteranganClean,
                'sumber'     => $request->input('sumber') ?: 'Kas OSIS',
                'jenis'      => $jenisInput,
                'nominal'    => $nominalClean,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Laporan keuangan berhasil ditambahkan',
                'data'    => $laporan,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan laporan keuangan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Menampilkan detail satu transaksi keuangan.
     */
    public function show(int|string$id)
    {
        $laporan = LaporanKeuangan::find($id);
        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Data laporan keuangan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $laporan,
        ], 200);
    }

    /**
     * Memperbarui catatan transaksi keuangan.
     */
    public function update(Request $request, int|string $id)
    {
        $laporan = LaporanKeuangan::find($id);
        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Data laporan keuangan tidak ditemukan',
            ], 404);
        }

        $nominalInput = $request->input('nominal', $request->input('jumlah', $laporan->nominal));
        $jenisInput = $request->input('jenis', $request->input('kategori', $laporan->jenis));

        $validator = Validator::make([
            'tanggal'    => $request->input('tanggal', $laporan->tanggal),
            'keterangan' => $request->input('keterangan', $laporan->keterangan),
            'sumber'     => $request->input('sumber', $laporan->sumber),
            'jenis'      => $jenisInput,
            'nominal'    => $nominalInput,
        ], [
            'tanggal'    => 'required|date',
            'keterangan' => 'required|string|max:255',
            'sumber'     => 'nullable|string|max:100',
            'jenis'      => 'required|in:Pemasukan,Pengeluaran',
            'nominal'    => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi pembaruan gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $laporan->update([
                'tanggal'    => $request->input('tanggal', $laporan->tanggal),
                'keterangan' => trim($request->input('keterangan', $laporan->keterangan)),
                'sumber'     => $request->input('sumber', $laporan->sumber) ?: 'Kas OSIS',
                'jenis'      => $jenisInput,
                'nominal'    => (float) $nominalInput,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Laporan keuangan berhasil diperbarui',
                'data'    => $laporan,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui laporan keuangan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Menghapus catatan transaksi keuangan.
     */
    public function destroy(int|string $id)
    {
        $laporan = LaporanKeuangan::find($id);
        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Data laporan keuangan tidak ditemukan',
            ], 404);
        }

        try {
            $laporan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Laporan keuangan berhasil dihapus',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus laporan keuangan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
