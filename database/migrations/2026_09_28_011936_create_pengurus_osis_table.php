<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pengurus_osis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nisn')->unique();
            $table->string('nama_lengkap');
            $table->string('jabatan');
            $table->string('periode');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengurus_osis');
    }
};
