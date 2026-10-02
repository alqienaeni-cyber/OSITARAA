<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengurusOsis extends Model
{
    use HasFactory;

    protected $table = 'pengurus_osis';

    protected $fillable = [
        'user_id',
        'nisn',
        'nama_lengkap',
        'jabatan',
        'periode',
    ];
}
