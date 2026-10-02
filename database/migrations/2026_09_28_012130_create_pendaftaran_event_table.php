<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pendaftaran_event', function (Blueprint $table) {
            $table->id();

            // DIHUBUNGKAN KE TABEL proposal_kegiatan
            $table->foreignId('event_id')
                  ->constrained('proposal_kegiatan')
                  ->onDelete('cascade');

            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('cascade');

            // Data Identitas Pendaftar (Siswa)
            $table->string('kode_pendaftaran', 20)->unique();
            $table->string('nisn', 10);
            $table->string('nama_siswa', 100);
            $table->string('kelas', 20);
            $table->string('no_wa', 15);
            $table->text('alasan_mengikuti')->nullable();

            // File Persyaratan Upload
            $table->string('berkas_persyaratan', 255)->nullable();

            // Status Pendaftaran & Kehadiran
            $table->enum('status_pendaftaran', ['Pending', 'Terkonfirmasi', 'Ditolak'])->default('Pending');
            $table->enum('status_kehadiran', ['Hadir', 'Tidak Hadir'])->default('Tidak Hadir');
            $table->text('catatan_verifikasi')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_event');
    }
};
