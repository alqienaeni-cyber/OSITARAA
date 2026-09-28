<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('laporan_keuangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_kegiatan_id')->constrained('proposal_kegiatan')->cascadeOnDelete();
            $table->enum('jenis_keuangan', ['pemasukan', 'pengeluaran']);
            $table->decimal('jumlah', 12, 2);
            $table->text('keterangan')->nullable();
            $table->string('bukti_transaksi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_keuangan');
    }
};
