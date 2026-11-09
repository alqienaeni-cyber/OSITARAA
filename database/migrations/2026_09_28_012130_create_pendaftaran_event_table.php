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
        Schema::create('pendaftaran_event', function (Blueprint $table) {
            // Menggunakan UUID/String primary key sesuai isi database phpMyAdmin (contoh: 80af9236-6e59-...)
            $table->string('id', 50)->primary();
            $table->string('kegiatan_id', 50);
            $table->string('nama_kegiatan');
            $table->string('nama_siswa');
            $table->string('nis', 50);
            $table->string('kelas', 50);
            $table->text('catatan')->nullable();
            $table->string('status', 50)->default('Terdaftar');
            $table->date('tanggal_daftar');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_event');
    }
};
