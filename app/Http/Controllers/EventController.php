<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRegist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Menampilkan semua daftar kegiatan OSIS
     */
    public function index()
    {
        $events = Event::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil daftar kegiatan',
            'data'    => $events
        ], 200);
    }

    /**
     * Menambah kegiatan baru (Form Kelola Kegiatan)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_event' => 'required|string|max:255',
            'tanggal'    => 'required|date',
            'deskripsi'  => 'nullable|string',
            'status'     => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $event = Event::create([
            'nama_event' => $request->nama_event,
            'tanggal'    => $request->tanggal,
            'deskripsi'  => $request->deskripsi ?? 'Tidak ada deskripsi.',
            'status'     => $request->status ?? 'Mendatang',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil disimpan!',
            'data'    => $event
        ], 201);
    }

    /**
     * Detail satu kegiatan
     */
    public function show($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Kegiatan tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $event], 200);
    }

    /**
     * Pendaftaran Siswa ke Event (Tabel pendaftaran_event)
     */
    public function storeRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:program_kerja,id',
            'nisn'     => 'required|string|max:20',
            'kelas'    => 'required|string|max:50',
            'catatan'  => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $registration = EventRegist::create([
            'event_id'           => $request->event_id,
            'user_id'            => Auth::check() ? Auth::id() : null,
            'kode_pendaftaran'   => 'REG-' . strtoupper(Str::random(6)),
            'nisn'               => $request->nisn,
            'nama_siswa'         => Auth::check() ? Auth::user()->name : ($request->nama_siswa ?? 'Siswa'),
            'kelas'              => $request->kelas,
            'catatan'            => $request->catatan ?? null,
            'status_pendaftaran' => 'Terdaftar',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran event berhasil disimpan!',
            'data'    => $registration
        ], 201);
    }

    /**
     * Ambil seluruh daftar pendaftar event
     */
    public function getRegistrations()
    {
        $registrations = EventRegist::with('event')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pendaftar event berhasil diambil',
            'data'    => $registrations
        ], 200);
    }

    /**
     * Ambil daftar peserta untuk 1 event tertentu (Modal Peserta)
     */
    public function getPeserta($id)
    {
        $peserta = EventRegist::where('event_id', $id)->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil daftar peserta',
            'data'    => $peserta
        ], 200);
    }

    /**
     * Hapus Kegiatan
     */
    public function destroy($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Kegiatan tidak ditemukan'], 404);
        }

        $event->delete();

        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil dihapus!'], 200);
    }
}
