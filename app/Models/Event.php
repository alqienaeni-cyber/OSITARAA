<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    // Menentukan nama tabel asli di database phpMyAdmin
    protected $table = 'program_kerja';

    protected $fillable = [
        'nama_event',
        'nama_proker',
        'tanggal',
        'deskripsi',
        'lokasi',
        'divisi',
        'target',
        'status',
    ];

    /**
     * Relasi ke pendaftaran event
     */
    public function pendaftaran()
    {
        return $this->hasMany(PendaftaranEvent::class, 'event_id');
    }
}
