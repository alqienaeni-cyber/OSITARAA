<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Menampilkan halaman registrasi
    public function showRegisterForm()
    {
        return view('auth.register');
    }

    // Proses Registrasi (Khusus Siswa yang mendaftar mandiri)
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'nisn'     => 'required|string|max:20|unique:users,nisn',
            'kelas'    => 'required|string|max:50',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'nisn'     => $request->nisn,
            'kelas'    => $request->kelas,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'siswa', // Otomatis set role sebagai siswa jika daftar sendiri
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil! Silakan login.',
            'user'    => $user
        ], 201);
    }

    // Menampilkan halaman login
    public function showLoginForm()
    {
        return view('auth.login');
    }

    // Proses Login (Murni API JSON dengan Redirect Berdasarkan Role)
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek kecocokan user dan password
        if ($user && Hash::check($request->password, $user->password)) {

            // Tentukan arah redirect berdasarkan kolom role di database
            $redirectUrl = '/dashboard-siswa'; // Default

            if ($user->role === 'pembina') {
                $redirectUrl = '/dashboard-pembina';
            } elseif ($user->role === 'pengurus') {
                $redirectUrl = '/dashboard-pengurus';
            }

            return response()->json([
                'message'  => 'Login berhasil',
                'user'     => $user,
                'redirect' => $redirectUrl
            ], 200);
        }

        return response()->json([
            'message' => 'Email atau password salah.'
        ], 422);
    }

    // Proses Logout (Murni API JSON)
    public function logout(Request $request)
    {
        return response()->json([
            'message' => 'Logout berhasil'
        ], 200);
    }
}
