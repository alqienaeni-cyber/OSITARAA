<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pendaftaran_event', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_kegiatan_id')->constrained('proposal_kegiatan')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('tanggal_daftar');
            $table->string('status_pendaftaran');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_event');
    }
};
