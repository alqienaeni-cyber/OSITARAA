<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('laporan_keuangan')) {
            Schema::create('laporan_keuangan', function (Blueprint $table) {
                $table->id();
                $table->string('sumber', 255)->default('Kas OSIS');
                $table->string('kategori_sumber', 100)->nullable()->default('Kas OSIS');
                $table->enum('jenis', ['Pemasukan', 'Pengeluaran'])->default('Pemasukan');
                $table->string('keterangan', 255);
                $table->double('nominal')->default(0);
                $table->date('tanggal');
                $table->longText('bukti_nota')->nullable();
                $table->string('created_by', 100)->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('laporan_keuangan', function (Blueprint $table) {
                if (!Schema::hasColumn('laporan_keuangan', 'kategori_sumber')) {
                    $table->string('kategori_sumber', 100)->nullable()->default('Kas OSIS')->after('sumber');
                }
                if (!Schema::hasColumn('laporan_keuangan', 'bukti_nota')) {
                    $table->longText('bukti_nota')->nullable()->after('nominal');
                }
                if (!Schema::hasColumn('laporan_keuangan', 'created_by')) {
                    $table->string('created_by', 100)->nullable()->after('bukti_nota');
                }
            });

            try {
                DB::statement('ALTER TABLE laporan_keuangan MODIFY COLUMN bukti_nota LONGTEXT NULL');
            } catch (\Throwable $e) {
                // Abaikan jika driver bukan MySQL
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_keuangan');
    }
};
