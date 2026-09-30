<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. PEMBINA
        User::create([
            'name'     => 'Pak Sufiyan Muthahar',
            'email'    => 'pembinaosis@ositara.com',
            'password' => Hash::make('pembinaosis26/27'),
            'role'     => 'Pembina',
            'nisn'     => '099999999',
            'kelas'    => '-',
            // 'jabatan' => 'Pembina OSIS', // Aktifkan jika kolom 'jabatan' ada di tabel users
        ]);

        // 2. PENGURUS - KETUA OSIS
        User::create([
            'name'     => 'Anggi Anggraeni',
            'nisn'     => '0051234567',
            'kelas'    => 'XII RPL 4',
            'email'    => 'ketuaosis@ositara.com',
            'password' => Hash::make('ketuaosis26/27'),
            'role'     => 'Ketua OSIS',
            // 'jabatan' => 'Ketua OSIS',
        ]);

        // 3. PENGURUS - SEKRETARIS
        User::create([
            'name'     => 'Naura Lutfiah',
            'nisn'     => '0051234568',
            'kelas'    => 'XII BRP 2',
            'email'    => 'sekretarisosis@ositara.com',
            'password' => Hash::make('sekretaris26/27'),
            'role'     => 'Sekretaris',
            //'jabatan' => 'Sekretaris',
        ]);

        // 4. PENGURUS - BENDAHARA
        User::create([
            'name'     => 'Salsabila Zahir A',
            'nisn'     => '0000000000',
            'kelas'    => 'XI RPL 2',
            'email'    => 'bendaharaosis@ositara.com',
            'password' => Hash::make('bendahara26/27'), // Password Bendahara
            'role'     => 'Bendahara',
           // 'jabatan' => 'Bendahara',
        ]);
    }
}
