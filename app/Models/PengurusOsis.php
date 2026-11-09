<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengurusOsis extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database MySQL.
     *
     * @var string
     */
    protected $table = 'pengurus_osis';

    /**
     * Primary key untuk model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Kolom yang dapat diisi secara masal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'nisn',
        'nama_lengkap',
        'jabatan',
        'sekbid',
        'periode',
    ];

    /**
     * Tipe data bawaan yang di-cast oleh Eloquent.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'user_id'    => 'integer',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    /**
     * Relasi ke model User (opsional).
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
