<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database MySQL.
     *
     * @var string
     */
    protected $table = 'pendaftaran_event';

    /**
     * Jika id pada tabel MySQL berupa INT AUTO_INCREMENT
     */
    public $incrementing = true;
    protected $keyType = 'int';

    /**
     * Kolom yang dapat diisi secara masal (mass assignable).
     *
     * @var array<int, string>
     */
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
        'tanggal_daftar',
    ];

    /**
     * Atribut yang di-cast otomatis oleh Eloquent.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'event_id'       => 'integer',
        'kegiatan_id'    => 'integer',
        'tanggal_daftar' => 'date:Y-m-d',
        'created_at'     => 'datetime:Y-m-d H:i:s',
        'updated_at'     => 'datetime:Y-m-d H:i:s',
    ];

    /**
     * Relasi ke tabel Program Kerja / Event Induk
     */
    public function event()
    {
        return $this->belongsTo(ProgramKerja::class, 'event_id', 'id');
    }
}
