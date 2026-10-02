<?php

namespace App\Http\Controllers;

use App\Models\PengurusOsis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PengurusOsisController extends Controller
{
    // 1. Ambil Semua Data Pengurus OSIS
    public function index()
    {
        $pengurus = PengurusOsis::latest()->get();
        return response()->json([
            'success' => true,
            'data'    => $pengurus
        ], 200);
    }

    // 2. Simpan Data Pengurus OSIS Baru
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nisn'         => 'required|string|max:20',
            'nama_lengkap' => 'required|string|max:255',
            'jabatan'      => 'required|string|max:100',
            'periode'      => 'required|string|max:50',
            'user_id'      => 'nullable|integer',
        ], [
            'nisn.required'         => 'NISN wajib diisi!',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi!',
            'jabatan.required'      => 'Jabatan wajib diisi!',
            'periode.required'      => 'Periode wajib diisi!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $pengurus = PengurusOsis::create([
            'user_id'      => $request->user_id ?? null,
            'nisn'         => $request->nisn,
            'nama_lengkap' => $request->nama_lengkap,
            'jabatan'      => $request->jabatan,
            'periode'      => $request->periode ?? '2026/2027',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Anggota OSIS berhasil ditambahkan!',
            'data'    => $pengurus
        ], 201);
    }

    // 3. Update Data Pengurus OSIS
    public function update(Request $request, $id)
    {
        $pengurus = PengurusOsis::find($id);
        if (!$pengurus) {
            return response()->json(['message' => 'Pengurus OSIS tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nisn'         => 'sometimes|string|max:20',
            'nama_lengkap' => 'sometimes|string|max:255',
            'jabatan'      => 'sometimes|string|max:100',
            'periode'      => 'sometimes|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $pengurus->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data pengurus berhasil diperbarui!',
            'data'    => $pengurus
        ], 200);
    }

    // 4. Hapus Data Pengurus OSIS
    public function destroy($id)
    {
        $pengurus = PengurusOsis::find($id);
        if (!$pengurus) {
            return response()->json(['message' => 'Pengurus OSIS tidak ditemukan'], 404);
        }

        $pengurus->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data pengurus berhasil dihapus!'
        ], 200);
    }
}
