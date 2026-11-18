<?php

namespace App\Http\Controllers;

use App\Models\LaporanKeuangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class FinancialReportController extends Controller
{
    /**
     * Helper untuk menormalisasi jenis transaksi agar selalu 'Pemasukan' atau 'Pengeluaran'.
     */
    private function normalizeJenis(mixed $raw): string
    {
        $val = strtolower(trim((string) $raw));
        if (
            $val === 'pengeluaran' ||
            $val === 'keluar' ||
            $val === 'expense' ||
            $val === 'debit' ||
            str_contains($val, 'keluar')
        ) {
            return 'Pengeluaran';
        }
        return 'Pemasukan';
    }

    /**
     * Helper untuk menormalisasi kategori induk sumber dana.
     */
    private function normalizeKategoriSumber(?string $kategoriRaw, string $sumberLabel): string
    {
        $kat = trim((string) $kategoriRaw);
        if ($kat !== '') {
            return $kat;
        }
        return in_array($sumberLabel, ['Kas OSIS', 'Dana Sekolah', 'Sponsor'], true)
            ? $sumberLabel
            : 'Lainnya';
    }

    /**
     * Filter atribut sesuai kolom yang benar-benar tersedia di tabel database.
     */
    private function filterExistingColumns(array $attributes): array
    {
        try {
            $table = (new LaporanKeuangan())->getTable();
            $columns = Schema::getColumnListing($table);
            if (!empty($columns)) {
                return array_intersect_key($attributes, array_flip($columns));
            }
        } catch (\Throwable $e) {
            // Gunakan atribut standar jika pengecekan skema gagal
        }
        return $attributes;
    }

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
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data laporan keuangan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rekapitulasi agregat keuangan menggunakan SQL SUM dan COUNT.
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

            $totalPemasukan = (float) LaporanKeuangan::where('jenis', 'Pemasukan')->sum('nominal');
            $totalPengeluaran = (float) LaporanKeuangan::where('jenis', 'Pengeluaran')->sum('nominal');
            $jumlahTransaksi = (int) LaporanKeuangan::count();

            return response()->json([
                'success' => true,
                'message' => 'Rekap agregat keuangan berhasil dihitung',
                'data' => [
                    'total_pemasukan' => $totalPemasukan,
                    'total_pengeluaran' => $totalPengeluaran,
                    'saldo_akhir' => $totalPemasukan - $totalPengeluaran,
                    'jumlah_transaksi' => $jumlahTransaksi,
                    'per_jenis' => $rekapPerJenis,
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
     * Menyimpan transaksi kas baru (Pemasukan maupun Pengeluaran).
     */
    public function store(Request $request)
    {
        $nominalInput = $request->input('nominal', $request->input('jumlah'));
        $rawJenis = $request->input(
            'jenis',
            $request->input('tipe', $request->input('jenis_transaksi', $request->input('kategori')))
        );
        $jenisClean = $rawJenis !== null ? $this->normalizeJenis($rawJenis) : null;
        $sumberClean = trim((string) $request->input('sumber', $request->input('sumber_dana', 'Kas OSIS'))) ?: 'Kas OSIS';
        $kategoriClean = $this->normalizeKategoriSumber($request->input('kategori_sumber'), $sumberClean);
        $buktiNota = $request->input('bukti_nota', $request->input('foto_nota', $request->input('buktiNota')));

        $validator = Validator::make([
            'tanggal' => $request->input('tanggal', now()->toDateString()),
            'keterangan' => $request->input('keterangan'),
            'sumber' => $sumberClean,
            'kategori_sumber' => $kategoriClean,
            'jenis' => $jenisClean,
            'nominal' => $nominalInput,
            'bukti_nota' => $buktiNota,
        ], [
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'sumber' => 'nullable|string|max:100',
            'kategori_sumber' => 'nullable|string|max:100',
            'jenis' => 'required|in:Pemasukan,Pengeluaran',
            'nominal' => 'required|numeric|min:1',
            'bukti_nota' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi data keuangan gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $tanggalClean = $request->input('tanggal', now()->toDateString());
            $keteranganClean = trim((string) $request->input('keterangan'));
            $nominalClean = (float) $nominalInput;

            // Cek apakah transaksi identik sudah tercatat pada tanggal yang sama
            $duplikat = LaporanKeuangan::where('tanggal', $tanggalClean)
                ->where('keterangan', $keteranganClean)
                ->where('jenis', $jenisClean)
                ->where('nominal', $nominalClean)
                ->first();

            if ($duplikat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi "' . $keteranganClean . '" sudah tercatat hari ini! Data duplikat tidak disimpan.',
                    'data' => $duplikat,
                ], 409);
            }

            $payloadSimpan = $this->filterExistingColumns([
                'tanggal' => $tanggalClean,
                'keterangan' => $keteranganClean,
                'sumber' => $sumberClean,
                'kategori_sumber' => $kategoriClean,
                'jenis' => $jenisClean,
                'nominal' => $nominalClean,
                'bukti_nota' => $jenisClean === 'Pengeluaran' ? ($buktiNota ?: null) : null,
                'created_by' => $request->user()?->name ?? $request->input('created_by', 'Bendahara OSIS'),
            ]);

            $laporan = LaporanKeuangan::create($payloadSimpan);

            return response()->json([
                'success' => true,
                'message' => 'Laporan keuangan berhasil ditambahkan',
                'data' => $laporan,
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
    public function show(int|string $id)
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
            'data' => $laporan,
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
        $rawJenis = $request->input(
            'jenis',
            $request->input('tipe', $request->input('jenis_transaksi', $laporan->jenis))
        );
        $jenisClean = $this->normalizeJenis($rawJenis);
        $sumberClean = trim((string) $request->input('sumber', $laporan->sumber)) ?: 'Kas OSIS';
        $kategoriClean = $this->normalizeKategoriSumber(
            $request->input('kategori_sumber', $laporan->kategori_sumber ?? null),
            $sumberClean
        );
        $buktiNota = $request->has('bukti_nota') || $request->has('foto_nota')
            ? ($request->input('bukti_nota') ?? $request->input('foto_nota'))
            : ($laporan->bukti_nota ?? null);

        $validator = Validator::make([
            'tanggal' => $request->input('tanggal', $laporan->tanggal),
            'keterangan' => $request->input('keterangan', $laporan->keterangan),
            'sumber' => $sumberClean,
            'kategori_sumber' => $kategoriClean,
            'jenis' => $jenisClean,
            'nominal' => $nominalInput,
            'bukti_nota' => $buktiNota,
        ], [
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'sumber' => 'nullable|string|max:100',
            'kategori_sumber' => 'nullable|string|max:100',
            'jenis' => 'required|in:Pemasukan,Pengeluaran',
            'nominal' => 'required|numeric|min:1',
            'bukti_nota' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi pembaruan gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $payloadUpdate = $this->filterExistingColumns([
                'tanggal' => $request->input('tanggal', $laporan->tanggal),
                'keterangan' => trim((string) $request->input('keterangan', $laporan->keterangan)),
                'sumber' => $sumberClean,
                'kategori_sumber' => $kategoriClean,
                'jenis' => $jenisClean,
                'nominal' => (float) $nominalInput,
                'bukti_nota' => $jenisClean === 'Pengeluaran' ? ($buktiNota ?: null) : null,
            ]);

            $laporan->update($payloadUpdate);

            return response()->json([
                'success' => true,
                'message' => 'Laporan keuangan berhasil diperbarui',
                'data' => $laporan,
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
