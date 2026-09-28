<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('detail_anggaran_event', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_kegiatan_id')->constrained('proposal_kegiatan')->cascadeOnDelete();
            $table->string('nama_barang_item');
            $table->integer('qty');
            $table->decimal('harga_satuan', 12, 2);
            $table->decimal('total_harga', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_anggaran_event');
    }
};
