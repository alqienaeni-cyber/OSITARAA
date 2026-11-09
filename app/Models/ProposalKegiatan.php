<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalKegiatan extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database MySQL.
     *
     * @var string
     */
    protected $table = 'proposal_kegiatan';

    /**
     * Kolom yang dapat diisi secara masal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'judul_proposal',
        'kategori',
        'anggaran',
        'pengaju',
        'tanggal_pengajuan',
        'status',
        'catatan_pembina',
        'catatan_revisi',
        'deskripsi',
        'file_proposal',
        'file_url',
    ];

    /**
     * Tipe data bawaan yang di-cast otomatis oleh Eloquent.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'anggaran'          => 'decimal:2',
        'tanggal_pengajuan' => 'date:Y-m-d',
    ];
}
