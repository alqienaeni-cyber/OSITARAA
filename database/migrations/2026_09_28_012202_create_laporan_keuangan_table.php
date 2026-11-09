<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('laporan_keuangan', function (Blueprint $table) {
            $table->id();
            $table->string('sumber'); // Menampung "Kas OSIS", "Anggaran Sekolah", atau sumber dana lainnya
            $table->enum('jenis', ['Pemasukan', 'Pengeluaran']);
            $table->text('keterangan');
            $table->decimal('nominal', 15, 2);
            $table->date('tanggal');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_keuangan');
    }
};
