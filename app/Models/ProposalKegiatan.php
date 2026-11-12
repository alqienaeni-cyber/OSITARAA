<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalKegiatan extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database MySQL.
     *
     * @var string
     */
    protected $table = 'proposal_kegiatan';

    /**
     * Kolom yang diizinkan untuk pengisian massal (Mass Assignment).
     *
     * @var array
     */
    protected $fillable = [
        'judul_proposal',
        'pengaju',
        'tanggal_pengajuan',
        'status',
        'kategori',
        'anggaran',
        'deskripsi',
        'file_proposal',
        'catatan_pembina',
        'catatan_revisi',
    ];

    /**
     * Casting tipe data kolom.
     *
     * @var array
     */
    protected $casts = [
        'anggaran' => 'integer',
        'tanggal_pengajuan' => 'date:Y-m-d',
    ];

    /**
     * Otomatis menyertakan atribut virtual 'file_url' ke dalam respon JSON.
     *
     * @var array
     */
    protected $appends = ['file_url'];

    /**
     * Accessor untuk menghasilkan URL publik file proposal secara otomatis.
     *
     * @return string|null
     */
    public function getFileUrlAttribute()
    {
        if (!$this->file_proposal) {
            return null;
        }

        // Jika string sudah berupa URL lengkap (misal link eksternal)
        if (str_starts_with($this->file_proposal, 'http://') || str_starts_with($this->file_proposal, 'https://')) {
            return $this->file_proposal;
        }

        // Mengembalikan URL publik dari storage
        return asset('storage/proposals/' . $this->file_proposal);
    }
}
