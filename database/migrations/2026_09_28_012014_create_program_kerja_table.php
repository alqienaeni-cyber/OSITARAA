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
        Schema::create('program_kerja', function (Blueprint $table) {
            $table->id();
            $table->string('nama_proker');
            $table->string('nama_kegiatan')->nullable();
            $table->string('divisi');
            $table->string('sekbid')->nullable();
            $table->string('target');
            $table->date('tanggal')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('status')->default('Mendatang');
            $table->boolean('is_event')->default(false);
            $table->string('periode')->default('Mingguan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_kerja');
    }
};
