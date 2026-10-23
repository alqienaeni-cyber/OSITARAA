<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventRegist extends Model
{
    use HasFactory;

    protected $table = 'pendaftaran_event';

    protected $fillable = [
        'event_id',
        'user_id',
        'kode_pendaftaran',
        'nisn',
        'nama_siswa',
        'kelas',
        'catatan',
        'status_pendaftaran',
    ];

    // Relasi ke Model Event
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
}
