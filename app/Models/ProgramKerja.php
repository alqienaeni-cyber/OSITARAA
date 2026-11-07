<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramKerja extends Model
{
    use HasFactory;

    protected $table = 'program_kerja';

    protected $fillable = [
        'user_id',
        'nama_proker',
        'sekbid',
        'periode',
        'target',
        'deskripsi',
        'status',
        'is_event',
    ];

    protected $casts = [
        'is_event' => 'integer',
        'user_id'  => 'integer',
    ];

    /**
     * Relasi ke Pendaftaran Event (jika is_event = 1)
     */
    public function pendaftar()
    {
        return $this->hasMany(PendaftaranEvent::class, 'event_id', 'id');
    }
}
