<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('program_kerja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengurus_osis_id')->constrained('pengurus_osis')->cascadeOnDelete();
            $table->string('nama_program');
            $table->text('deskripsi')->nullable();
            $table->year('tahun_ajaran');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_kerja');
    }
};
