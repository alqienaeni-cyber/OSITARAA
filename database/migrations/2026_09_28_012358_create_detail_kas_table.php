<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('detail_kas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengurus_osis_id')->constrained('pengurus_osis')->cascadeOnDelete();
            $table->date('tanggal');
            $table->enum('tipe_kas', ['masuk', 'keluar']);
            $table->decimal('nominal', 12, 2);
            $table->text('keterangan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_kas');
    }
};
