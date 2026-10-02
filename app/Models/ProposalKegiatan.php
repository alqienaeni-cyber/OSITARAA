<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalKegiatan extends Model
{
    use HasFactory;

    // Tentukan nama tabel secara eksplisit
    protected $table = 'proposal_kegiatan';

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
    ];
}
