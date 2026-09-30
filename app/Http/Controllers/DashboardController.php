<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Role yang diizinkan mengakses dashboard
        $allowedRoles = ['ketua', 'sekretaris', 'bendahara'];

        // Cek jika role user tidak terdaftar
        if (!in_array(strtolower($user->role), $allowedRoles)) {
            return redirect('/')->with('error', 'Anda tidak memiliki akses ke dashboard.');
        }

        // Tampilkan halaman dashboard
        return view('dashboard');
    }
}
