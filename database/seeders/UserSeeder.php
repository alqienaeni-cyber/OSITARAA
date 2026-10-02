<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Pembina
        User::create([
            'name'     => 'Pak Sufiyan Muthahar',
            'nisn'     => '09999999',
            'kelas'    => '-',
            'email'    => 'pembinaosis@ositara.com',
            'password' => Hash::make('password123'),
            'role'     => 'pembina',
        ]);

        // 2. Akun Pengurus (Ketua OSIS)
        User::create([
            'name'     => 'Anggi Anggraeni',
            'nisn'     => '0051234567',
            'kelas'    => 'XII RPL 4',
            'email'    => 'ketuaosis@ositara.com',
            'password' => Hash::make('password123'),
            'role'     => 'pengurus',
        ]);

        // 3. Akun Pengurus (Sekretaris OSIS)
        User::create([
            'name'     => 'Naura Lutfiah',
            'nisn'     => '0051234568',
            'kelas'    => 'XII RPL 2',
            'email'    => 'sekretarisosis@ositara.com',
            'password' => Hash::make('password123'),
            'role'     => 'pengurus',
        ]);

        // 4. Akun Pengurus (Bendahara OSIS)
        User::create([
            'name'     => 'Salsabila Zahir A',
            'nisn'     => '0000000000',
            'kelas'    => 'XI RPL 2',
            'email'    => 'bendaharaosis@ositara.com',
            'password' => Hash::make('password123'),
            'role'     => 'pengurus',
        ]);
    }
}
