<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    use HasFactory;

    protected $table = 'pendaftaran_event';

    protected $fillable = [
        'event_id',
        'user_id',
        'nama_siswa',
        'kelas',
        'tanggal_pelaksanaan',
        'alasan_mengikuti',
    ];
}
