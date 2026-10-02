<?php

namespace App\Http\Controllers;

use App\Models\DataAnggota;
use Illuminate\Http\Request;

class DataAnggotaController extends Controller
{
    /**
     * Menampilkan daftar semua anggota OSIS.
     */
    public function index()
    {
        $dataAnggota = DataAnggota::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data anggota OSIS',
            'data'    => $dataAnggota
        ], 200);
    }

    /**
     * Menyimpan data anggota OSIS baru.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nisn'               => 'required|string|max:20',
            'nama_lengkap'       => 'required|string|max:255',
            'jabatan'            => 'required|string|max:255',
            'kelas'              => 'required|string|max:255',
            'user_id'            => 'nullable|exists:users,id',
            'jenis_kelamin'      => 'nullable|in:L,P',
            'no_hp'              => 'nullable|string|max:20',
            'foto_profil'        => 'nullable|string',
            'sekbid'             => 'nullable|string|max:255',
            'periode'            => 'nullable|string|max:20',
            'status_keanggotaan' => 'nullable|string|max:50',
        ]);

        $dataAnggota = DataAnggota::create($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Data Anggota OSIS berhasil disimpan!',
            'data'    => $dataAnggota
        ], 201);
    }

    /**
     * Menampilkan detail data 1 anggota OSIS.
     */
    public function show(string $id)
    {
        $dataAnggota = DataAnggota::find($id);

        if (!$dataAnggota) {
            return response()->json([
                'success' => false,
                'message' => 'Data anggota tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail data anggota OSIS',
            'data'    => $dataAnggota
        ], 200);
    }

    /**
     * Memperbarui data anggota OSIS.
     */
    public function update(Request $request, string $id)
    {
        $dataAnggota = DataAnggota::find($id);

        if (!$dataAnggota) {
            return response()->json([
                'success' => false,
                'message' => 'Data anggota tidak ditemukan'
            ], 404);
        }

        $validatedData = $request->validate([
            'nisn'               => 'sometimes|required|string|max:20',
            'nama_lengkap'       => 'sometimes|required|string|max:255',
            'jabatan'            => 'sometimes|required|string|max:255',
            'kelas'              => 'sometimes|required|string|max:255',
            'jenis_kelamin'      => 'nullable|in:L,P',
            'no_hp'              => 'nullable|string|max:20',
            'foto_profil'        => 'nullable|string',
            'sekbid'             => 'nullable|string|max:255',
            'periode'            => 'nullable|string|max:20',
            'status_keanggotaan' => 'nullable|string|max:50',
        ]);

        $dataAnggota->update($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Data Anggota OSIS berhasil diperbarui!',
            'data'    => $dataAnggota
        ], 200);
    }

    /**
     * Menghapus data anggota OSIS.
     */
    public function destroy(string $id)
    {
        $dataAnggota = DataAnggota::find($id);

        if (!$dataAnggota) {
            return response()->json([
                'success' => false,
                'message' => 'Data anggota tidak ditemukan'
            ], 404);
        }

        $dataAnggota->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data Anggota OSIS berhasil dihapus!'
        ], 200);
    }
}
