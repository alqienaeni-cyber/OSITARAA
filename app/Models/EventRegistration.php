<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    use HasFactory;

    protected $table = 'pendaftaran_event';

    protected $fillable<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendaftaranEvent extends Model
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
        'no_wa',
        'alasan_mengikuti',
        'berkas_persyaratan',
        'status_pendaftaran',
        'status_kehadiran',
        'catatan',
    ];
} = [
        'event_id',
        'user_id',
        'nama_siswa',
        'kelas',
        'tanggal_pelaksanaan',
        'alasan_mengikuti',
    ];
}
