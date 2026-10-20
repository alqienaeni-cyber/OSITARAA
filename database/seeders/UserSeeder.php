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
            'nisn'     => '0000000000',
            'kelas'    => '-',
            'email'    => 'pembina@ositara.com',
            'password' => Hash::make('Osis26/27'),
            'role'     => 'pembina',
        ]);

        // 2. Akun Pengurus (Ketua OSIS dan Wakil Ketua OSIS)
        User::create([
            'name'     => 'Anggi Anggraeni',
            'nisn'     => '0051234567',
            'kelas'    => 'XII RPL 4',
            'email'    => 'ketuaosis@ositara.com',
            'password' => Hash::make('Osis26/27'),
            'role'     => 'pengurus',
        ]);

        User::create([
            'name'     => 'Devi Fauziah',
            'nisn'     => '0091142060',
            'kelas'    => 'XII RPL 4',
            'email'    => 'wakilketuaosis1@ositara.com',
            'password' => Hash::make('Osis26/27'),
            'role'     => 'pengurus',
        ]);

        User::create([
            'name'     => 'Oka Karina Siwi',
            'nisn'     => '0051234569',
            'kelas'    => 'XII DKV 2',
            'email'    => 'wakilketuaosis2@ositara.com',
            'password' => Hash::make('Osis26/27'),
            'role'     => 'pengurus',
        ]);

        // 3. Akun Pengurus (Sekretaris OSIS)
        User::create([
            'name'     => 'Naura Lutfiah',
            'nisn'     => '0051234568',
            'kelas'    => 'XII RPL 2',
            'email'    => 'sekretaris1@ositara.com',
            'password' => Hash::make('Osis26/27'),
            'role'     => 'pengurus',
        ]);

        User::create([
            'name'     => 'Salfa Alena Eka Putri',
            'nisn'     => '3092885812',
            'kelas'    => 'XII RPL 1',
            'email'    => 'sekretaris2@ositara.com',
            'password' => Hash::make('Osis26/27'),
            'role'     => 'pengurus',
        ]);

        // 4. Akun Pengurus (Bendahara OSIS)
        User::create([
            'name'     => 'Salsabila Zahir A',
            'nisn'     => '0092082502',
            'kelas'    => 'XII RPL 2',
            'email'    => 'bendahara1@ositara.com',
            'password' => Hash::make('Osis26/27'),
            'role'     => 'pengurus',
        ]);

        User::create([
            'name'     => 'Shopia Widarti Noviani',
            'nisn'     => '0088157818',
            'kelas'    => 'XII DKV 2',
            'email'    => 'bendahara2@ositara.com',
            'password' => Hash::make('Osis26/27'),
            'role'     => 'pengurus',
        ]);
    }
}
