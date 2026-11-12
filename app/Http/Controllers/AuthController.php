<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Exception;

class AuthController extends Controller
{
    /**
     * Pendaftaran Akun Siswa Baru
     * Menyimpan data langsung ke tabel users MySQL tanpa membiarkan kolom bernilai NULL
     */
    public function register(Request $request)
    {
        try {
            // Validasi input dari frontend
            $validator = Validator::make($request->all(), [
                'name'     => 'required|string|max:255',
                'nisn'     => 'required|string|max:20',
                'kelas'    => 'required|string|max:50',
                'email'    => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    'ends_with:@ositara.com',
                    'unique:users,email',
                ],
                'password' => 'required|string|min:6',
            ], [
                'name.required'      => 'Nama Lengkap wajib diisi!',
                'nisn.required'      => 'NISN / NIPD wajib diisi!',
                'kelas.required'     => 'Kelas wajib diisi!',
                'email.required'     => 'Email wajib diisi!',
                'email.email'        => 'Format email tidak valid!',
                'email.ends_with'    => 'Email wajib menggunakan alamat @ositara.com (contoh: nama@ositara.com)!',
                'email.unique'       => 'Email ini sudah terdaftar! Gunakan email lain.',
                'password.required'  => 'Password wajib diisi!',
                'password.min'       => 'Password minimal harus 6 karakter!',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => $validator->errors(),
                ], 422);
            }

            // Membuat data user baru di MySQL
            $user = User::create([
                'name'              => trim($request->name),
                'nisn'              => trim($request->nisn),
                'kelas'             => trim($request->kelas),
                'email'             => strtolower(trim($request->email)),
                'email_verified_at' => now(), // Mengisi timestamp verifikasi
                'password'          => Hash::make($request->password),
                'role'              => $request->input('role', 'siswa'), // Default role: siswa
                'remember_token'    => Str::random(10), // Mengisi otomatis string acak 10 karakter
            ]);

            // Generate Bearer Token Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran Akun Siswa Berhasil!',
                'token'   => $token,
                'data'    => [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'nisn'              => $user->nisn,
                    'kelas'             => $user->kelas,
                    'email'             => $user->email,
                    'role'              => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                    'remember_token'    => $user->remember_token,
                ],
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftarkan akun: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Proses Login User (Siswa, Pengurus, Pembina)
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email'    => 'required|email',
                'password' => 'required|string',
            ], [
                'email.required'    => 'Email wajib diisi!',
                'email.email'       => 'Format email tidak sesuai!',
                'password.required' => 'Password tidak boleh kosong!',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $email    = strtolower(trim($request->email));
            $password = $request->password;

            $user = User::where('email', $email)->first();

            // 1. Cek jika email belum terdaftar di database MySQL
            if (!$user) {
                return response()->json([
                    'success'    => false,
                    'error_type' => 'EMAIL_NOT_FOUND',
                    'message'    => 'Akun dengan email ini belum terdaftar. Silakan klik Daftar terlebih dahulu!',
                ], 404);
            }

            // 2. Cek jika email sudah terdaftar tetapi password salah
            if (!Hash::check($password, $user->password)) {
                return response()->json([
                    'success'    => false,
                    'error_type' => 'WRONG_PASSWORD',
                    'message'    => 'Password yang Anda masukkan salah! Silakan periksa kembali atau klik Lupa Password.',
                ], 401);
            }

            // Isi email_verified_at dan remember_token jika sebelumnya masih NULL
            if (is_null($user->email_verified_at) || is_null($user->remember_token)) {
                $user->update([
                    'email_verified_at' => $user->email_verified_at ?? now(),
                    'remember_token'    => $user->remember_token ?? Str::random(10),
                ]);
            }

            // Hapus token lama agar tidak menumpuk
            $user->tokens()->delete();

            // Generate token baru
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil! Selamat datang kembali.',
                'token'   => $token,
                'data'    => [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'nisn'              => $user->nisn,
                    'kelas'             => $user->kelas,
                    'email'             => $user->email,
                    'role'              => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                    'remember_token'    => $user->remember_token,
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mendapatkan Data User Aktif
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated / Sesi telah berakhir.',
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Data profil user berhasil diambil.',
                'user'    => [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'nisn'              => $user->nisn,
                    'kelas'             => $user->kelas,
                    'email'             => $user->email,
                    'role'              => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                    'remember_token'    => $user->remember_token,
                    'created_at'        => $user->created_at,
                    'updated_at'        => $user->updated_at,
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data profil: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout User
     */
    public function logout(Request $request)
    {
        try {
            if ($request->user()) {
                $request->user()->currentAccessToken()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil dilakukan.',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan logout: ' . $e->getMessage(),
            ], 500);
        }
    }
}
