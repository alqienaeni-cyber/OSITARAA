<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposal_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('judul_proposal');
            $table->string('kategori', 100)->default('Kegiatan');
            $table->decimal('anggaran', 15, 2)->default(0);
            $table->string('pengaju', 100)->default('Sekretaris OSIS');
            $table->date('tanggal_pengajuan');
            $table->text('deskripsi');
            $table->string('file_proposal')->nullable();
            $table->string('status', 50)->default('Menunggu Persetujuan');
            $table->text('catatan_pembina')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposal_kegiatan');
    }
};
