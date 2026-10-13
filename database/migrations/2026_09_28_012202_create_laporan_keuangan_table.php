<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_keuangan', function (Blueprint $table) {
            $table->id();
            $table->enum('sumber', ['Kas OSIS', 'Anggaran Sekolah']);
            $table->enum('jenis', ['Pemasukan', 'Pengeluaran']);
            $table->string('keterangan');
            $table->decimal('nominal', 15, 2);
            $table->date('tanggal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_keuangan');
    }
};
