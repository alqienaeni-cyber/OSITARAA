<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ProgramKerja extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung di database MySQL.
     *
     * @var string
     */
    protected $table = 'program_kerja';

    /**
     * Primary key untuk model ini.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Menentukan apakah model harus menggunakan timestamp (created_at & updated_at).
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Kolom-kolom yang dapat diisi secara masal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_proker',
        'nama_kegiatan',
        'divisi',
        'sekbid',
        'target',
        'tanggal',
        'deskripsi',
        'status',
        'periode',
        'user_id',
        'is_event',
    ];

    /**
     * Nilai default atribut model di database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'deskripsi' => 'Tidak ada deskripsi',
        'status'    => 'Mendatang',
        'periode'   => 'Mingguan',
        'is_event'  => false,
    ];

    /**
     * Atribut yang di-cast secara otomatis ke tipe data PHP bawaan.
     * Menilai format 'date:Y-m-d' agar merespons tanggal ISO bersih (YYYY-MM-DD)
     * dan mencegah munculnya string jam UTC panjang (T00:00:00.000000Z).
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_event'  => 'boolean',
        'user_id'   => 'integer',
        'target'    => 'date:Y-m-d',
        'tanggal'   => 'date:Y-m-d',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    /**
     * Relasi ke model User (Pengurus/Ketua OSIS yang membuat program).
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Scope query khusus untuk mengambil data Program Kerja milik Ketua OSIS (is_event = 0 / false).
     */
    public function scopeOnlyProker($query)
    {
        return $query->where('is_event', 0);
    }

    /**
     * Scope query khusus untuk mengambil data Kegiatan/Event milik Sekretaris (is_event = 1 / true).
     */
    public function scopeOnlyEvent($query)
    {
        return $query->where('is_event', 1);
    }

    /**
     * Accessor untuk mendapatkan nama bersih (kompatibel untuk nama_proker atau nama_kegiatan).
     */
    protected function namaDisplay(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->nama_kegiatan ?? $this->nama_proker ?? 'Tanpa Nama'
        );
    }

    /**
     * Accessor untuk memastikan format tanggal yang dikirim ke API selalu berupa YYYY-MM-DD.
     */
    protected function targetFormated(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->target) return '-';
                return is_string($this->target)
                    ? explode('T', $this->target)[0]
                    : $this->target->format('Y-m-d');
            }
        );
    }
}
