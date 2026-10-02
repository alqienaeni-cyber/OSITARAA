<?php

namespace App\Http\Controllers;

use App\Models\ProgramKerja;
use Illuminate\Http\Request;

class ProgramKerjaController extends Controller
{
    public function index()
    {
        $programKerja = ProgramKerja::latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $programKerja
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_proker' => 'required|string|max:255',
            'divisi'      => 'required|string|max:255',
            'target'      => 'required|string|max:255',
        ]);

        $proker = ProgramKerja::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Program kerja berhasil ditambahkan!',
            'data'    => $proker
        ], 201);
    }

    public function destroy($id)
    {
        $proker = ProgramKerja::findOrFail($id);
        $proker->delete();

        return response()->json([
            'success' => true,
            'message' => 'Program kerja berhasil dihapus!'
        ], 200);
    }
}
