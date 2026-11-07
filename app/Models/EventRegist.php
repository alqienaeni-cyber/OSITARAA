<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventRegist extends Model
{
    use HasFactory;

    protected $table = 'pendaftaran_event';

    // Jika id pada tabel MySQL berupa INT AUTO_INCREMENT:
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'event_id',
        'kegiatan_id',
        'nama_kegiatan',
        'nama_siswa',
        'nisn',
        'nis',
        'kelas',
        'catatan',
        'status',
        'status_pendaftaran',
        'tanggal_daftar'
    ];
}
