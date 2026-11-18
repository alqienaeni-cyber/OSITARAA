<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LaporanKeuangan extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database MySQL.
     *
     * @var string
     */
    protected $table = 'laporan_keuangan';

    /**
     * Kolom-kolom yang dapat diisi secara massal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sumber',
        'kategori_sumber',
        'jenis',
        'keterangan',
        'nominal',
        'tanggal',
        'bukti_nota',
        'created_by',
    ];

    /**
     * Format casting tipe data Eloquent.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'nominal'    => 'double',
        'tanggal'    => 'date:Y-m-d',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];
}