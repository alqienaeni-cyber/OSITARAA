<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalKegiatan extends Model
{
    use HasFactory;

    // Menghubungkan langsung ke nama tabel di phpMyAdmin
    protected $table = 'proposal_kegiatan';

    // Mendaftarkan SELURUH kolom agar bisa diisi dari Controller/Form
    protected $fillable = [
        'judul_proposal',
        'kategori',
        'anggaran',
        'pengaju',
        'tanggal_pengajuan',
        'deskripsi',
        'file_proposal',
        'status',
        'catatan_pembina',
        'catatan_revisi',
        'catatan',
        'user_id',
    ];

    /**
     * Konversi tipe data otomatis
     */
    protected $casts = [
        'anggaran' => 'double',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
