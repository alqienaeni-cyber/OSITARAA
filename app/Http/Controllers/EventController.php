<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    // 1. Ambil Semua Data Kegiatan
    public function index()
    {
        try {
            // Mengambil data dari tabel events jika sudah ada
            $events = DB::table('events')->latest()->get();

            return response()->json([
                'success' => true,
                'data'    => $events
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 2. Simpan Kegiatan Baru (Kelola Kegiatan)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_kegiatan'       => 'required|string|max:255',
            'tanggal_pelaksanaan' => 'required|date',
            'deskripsi'           => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi kegiatan gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $eventId = DB::table('events')->insertGetId([
                'nama_kegiatan'       => $request->nama_kegiatan,
                'tanggal_pelaksanaan' => $request->tanggal_pelaksanaan,
                'deskripsi'           => $request->deskripsi ?? null,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            $event = DB::table('events')->find($eventId);

            return response()->json([
                'success' => true,
                'message' => 'Kegiatan berhasil ditambahkan!',
                'data'    => $event
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 3. Simpan Pendaftaran Peserta Event
    public function storeRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_id'            => 'required|integer',
            'nama_siswa'          => 'required|string|max:255',
            'kelas'               => 'required|string|max:50',
            'tanggal_pelaksanaan' => 'required|date',
            'alasan_mengikuti'    => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi pendaftaran gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $registrationId = DB::table('pendaftaran_event')->insertGetId([
                'event_id'            => $request->event_id,
                'user_id'             => $request->user_id ?? null,
                'nama_siswa'          => $request->nama_siswa,
                'kelas'               => $request->kelas,
                'tanggal_pelaksanaan' => $request->tanggal_pelaksanaan,
                'alasan_mengikuti'    => $request->alasan_mengikuti,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            $registration = DB::table('pendaftaran_event')->find($registrationId);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mendaftar kegiatan!',
                'data'    => $registration
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 4. Ambil Daftar Semua Pendaftar
    public function getRegistrations()
    {
        try {
            $registrations = DB::table('pendaftaran_event')->latest()->get();

            return response()->json([
                'success' => true,
                'data'    => $registrations
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
