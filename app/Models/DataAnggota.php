<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataAnggota extends Model
{
    use HasFactory;

    protected $table = 'data_anggota';

    protected $fillable = [
        'user_id',
        'nisn',
        'nama_lengkap',
        'kelas',
        'jenis_kelamin',
        'no_hp',
        'foto_profil',
        'jabatan',
        'sekbid',
        'periode',
        'status_keanggotaan',
    ];

    /**
     * Relasi ke model User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
