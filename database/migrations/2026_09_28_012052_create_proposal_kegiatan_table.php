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
        Schema::create('proposal_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('judul_proposal');
            $table->string('kategori')->nullable();
            $table->decimal('anggaran', 15, 2)->default(0); // Menyimpan nominal anggaran
            $table->string('pengaju')->nullable();
            $table->date('tanggal_pengajuan')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('file_proposal')->nullable(); // Untuk menyimpan lampiran file PDF/Doc
            $table->string('status')->default('Pending'); // Status: Pending, Revisi, Disetujui, Ditolak
            $table->text('catatan_pembina')->nullable(); // <-- Kolom catatan revisi dari pembina
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_kegiatan');
    }
};
