<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramKerja extends Model
{
    use HasFactory;

    protected $table = 'program_kerja';

    protected $fillable = [
        'nama_proker',
        'divisi',
        'target',
        'deskripsi',
        'status',
    ];

    // Relasi 1 Kegiatan Memiliki Banyak Pendaftar
    public function pendaftar()
    {
        return $this->hasMany(PendaftaranEvent::class, 'event_id');
    }
}
