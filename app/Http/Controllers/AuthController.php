<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'nisn'     => 'required|string',
            'kelas'    => 'required|string',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'nisn'     => $validated['nisn'],
            'kelas'    => $validated['kelas'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']), // Enkripsi password
            'role'     => 'Siswa',
        ]);

        return response()->json([
            'message' => 'Pendaftaran Berhasil!',
            'user'    => $user
        ], 201);
    }

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

        $user = Auth::user();

        return response()->json([
            'message' => 'Login Berhasil!',
            'user'    => $user
        ]);
    }
}
