<?php

namespace App\Http\Controllers;

use App\Models\ProgramKerja;
use App\Models\EventRegist; // <-- Sesuaikan dengan file app/Models/EventRegist.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ProgramKerjaController extends Controller
{
    /**
     * Get Daftar Program Kerja (is_event = 0) -> Read Only / Internal
     */
    public function getProker()
    {
        $proker = ProgramKerja::where('is_event', 0)->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $proker
        ], 200);
    }

    /**
     * Tambah Program Kerja Baru
     */
    public function storeProker(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_proker' => 'required|string|max:255',
            'divisi'      => 'required|string|max:100',
            'target'      => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $proker = ProgramKerja::create([
            'nama_proker' => $request->nama_proker,
            'divisi'      => $request->divisi,
            'target'      => $request->target,
            'is_event'    => 0,
        ]);

        return response()->json(['success' => true, 'data' => $proker], 201);
    }

    /**
     * Get Daftar Kegiatan / Event (is_event = 1) -> Untuk Diikuti Siswa
     */
    public function getEvents()
    {
        $events = ProgramKerja::where('is_event', 1)->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $events
        ], 200);
    }

    /**
     * Tambah Kegiatan / Event Baru (Form Kelola Kegiatan)
     */
    public function storeEvent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_event' => 'required|string|max:255',
            'tanggal'    => 'required|date',
            'deskripsi'  => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $event = ProgramKerja::create([
            'nama_proker' => $request->nama_event,
            'divisi'      => $request->divisi ?? 'Sekbid OSIS',
            'target'      => $request->tanggal,
            'deskripsi'   => $request->deskripsi ?? 'Tidak ada deskripsi',
            'status'      => $request->status ?? 'Mendatang',
            'is_event'    => 1,
        ]);

        return response()->json(['success' => true, 'data' => $event], 201);
    }

    /**
     * Pendaftaran Siswa ke Kegiatan
     */
    public function registerEvent(Request $request, $id)
    {
        $event = ProgramKerja::where('id', $id)->where('is_event', 1)->first();

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Kegiatan tidak ditemukan / bukan event terbuka'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nisn'  => 'required|string|max:20',
            'kelas' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $pendaftaran = EventRegist::create([
            'event_id'           => $event->id,
            'user_id'            => Auth::check() ? Auth::id() : null,
            'kode_pendaftaran'   => 'REG-' . strtoupper(Str::random(6)),
            'nisn'               => $request->nisn,
            'nama_siswa'         => Auth::check() ? Auth::user()->name : ($request->nama_siswa ?? 'Manis.'),
            'kelas'              => $request->kelas,
            'catatan'            => $request->catatan ?? null,
            'status_pendaftaran' => 'Terdaftar',
        ]);

        return response()->json(['success' => true, 'data' => $pendaftaran], 201);
    }

    /**
     * Get Daftar Peserta Terdaftar di Kegiatan
     */
    public function getPeserta($id)
    {
        $peserta = EventRegist::where('event_id', $id)->latest()->get();

        return response()->json(['success' => true, 'data' => $peserta], 200);
    }
}
