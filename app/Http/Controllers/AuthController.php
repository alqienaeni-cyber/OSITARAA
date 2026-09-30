<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Registrasi khusus Siswa (Publik)
     */
   public function register(Request $request)
{
    // Validasi input
    $validated = $request->validate([
        'name'     => 'required|string|max:255',
        'nisn'     => 'required|string|unique:users,nisn', // Kolom DB disesuaikan ke 'nisn'
        'kelas'    => 'nullable|string',
        'email'    => 'required|string|email|unique:users,email',
        'password' => 'required|string|min:6',
        'role'     => 'nullable|string',
    ]);

    // Ambil role dari request, jika tidak diisi default ke 'siswa'
    $role = $request->input('role', 'siswa');

    // Simpan ke database
    $user = User::create([
        'name'     => $validated['name'],
        'nisn'     => $validated['nisn'],
        'kelas'    => $validated['kelas'] ?? null,
        'email'    => $validated['email'],
        'password' => Hash::make($validated['password']),
        'role'     => $role,
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    $roleLabel = ucfirst($user->role);

    return response()->json([
        'message'      => "Pendaftaran {$roleLabel} Berhasil!",
        'access_token' => $token,
        'token_type'   => 'Bearer',
        'user'         => $user
    ], 201);
}

    /**
     * Login untuk semua role (Siswa, Pembina, Pengurus)
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email atau Password salah!'
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Buat token baru saat login berhasil
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Login Berhasil!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user
        ], 200);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        // Hapus token yang sedang digunakan
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout Berhasil!'
        ], 200);
    }
}
