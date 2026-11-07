<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\PengurusOsisController;
use App\Http\Controllers\ProgramKerjaController;
use App\Http\Controllers\ProposalKegiatanController;
use App\Http\Controllers\PendaftaranEventController;

/*
|--------------------------------------------------------------------------
| API Routes - OSITARA SYSTEM
|--------------------------------------------------------------------------
*/

// Health Check API
Route::get('/health', [HealthController::class, 'check']);

// 1. PUBLIC ROUTES (Autentikasi & Bebas Akses)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 2. KELOLA KEGIATAN OSIS (Sekretaris & Event)
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::post('/events', [EventController::class, 'store']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);
Route::get('/events/{id}/peserta', [EventController::class, 'getPeserta']);

// Alias Route Kegiatan
Route::get('/kegiatan', [EventController::class, 'index']);
Route::get('/kegiatan/{id}', [EventController::class, 'show']);
Route::post('/kegiatan', [EventController::class, 'store']);
Route::put('/kegiatan/{id}', [EventController::class, 'update']);
Route::delete('/kegiatan/{id}', [EventController::class, 'destroy']);
Route::get('/kegiatan/{id}/peserta', [EventController::class, 'getPeserta']);

// 3. PENDAFTARAN EVENT SISWA
Route::get('/pendaftaran-event', [PendaftaranEventController::class, 'index']);
Route::post('/pendaftaran-event', [PendaftaranEventController::class, 'store']);
Route::delete('/pendaftaran-event/{id}', [PendaftaranEventController::class, 'destroy']);
Route::post('/events/{id}/register', [PendaftaranEventController::class, 'store']);

// Alias Route Pendaftaran
Route::get('/pendaftaran', [PendaftaranEventController::class, 'index']);
Route::post('/pendaftaran', [PendaftaranEventController::class, 'store']);
Route::delete('/pendaftaran/{id}', [PendaftaranEventController::class, 'destroy']);

// 4. PROPOSAL KEGIATAN (Sekretaris, Ketua, Pembina)
Route::get('/proposals', [ProposalKegiatanController::class, 'index']);
Route::get('/proposals/{id}', [ProposalKegiatanController::class, 'show']);
Route::post('/proposals', [ProposalKegiatanController::class, 'store']);
Route::put('/proposals/{id}', [ProposalKegiatanController::class, 'update']);
Route::patch('/proposals/{id}/status', [ProposalKegiatanController::class, 'updateStatus']);
Route::put('/proposals/{id}/status', [ProposalKegiatanController::class, 'updateStatus']);
Route::delete('/proposals/{id}', [ProposalKegiatanController::class, 'destroy']);

// Alias Route Proposal Kegiatan
Route::get('/proposal-kegiatan', [ProposalKegiatanController::class, 'index']);
Route::get('/proposal-kegiatan/{id}', [ProposalKegiatanController::class, 'show']);
Route::post('/proposal-kegiatan', [ProposalKegiatanController::class, 'store']);
Route::put('/proposal-kegiatan/{id}', [ProposalKegiatanController::class, 'update']);
Route::patch('/proposal-kegiatan/{id}/status', [ProposalKegiatanController::class, 'updateStatus']);
Route::put('/proposal-kegiatan/{id}/status', [ProposalKegiatanController::class, 'updateStatus']);
Route::delete('/proposal-kegiatan/{id}', [ProposalKegiatanController::class, 'destroy']);

// 5. PROGRAM KERJA OSIS (Ketua OSIS)
Route::get('/program-kerja', [ProgramKerjaController::class, 'index']);
Route::get('/program-kerja/{id}', [ProgramKerjaController::class, 'show']);
Route::post('/program-kerja', [ProgramKerjaController::class, 'store']);
Route::put('/program-kerja/{id}', [ProgramKerjaController::class, 'update']);
Route::delete('/program-kerja/{id}', [ProgramKerjaController::class, 'destroy']);

// 6. LAPORAN KEUANGAN OSIS (Bendahara OSIS)
Route::get('/keuangan', [FinancialReportController::class, 'index']);
Route::post('/keuangan', [FinancialReportController::class, 'store']);
Route::put('/keuangan/{id}', [FinancialReportController::class, 'update']);
Route::delete('/keuangan/{id}', [FinancialReportController::class, 'destroy']);

// Alias Route Laporan Keuangan
Route::get('/laporan-keuangan', [FinancialReportController::class, 'index']);
Route::post('/laporan-keuangan', [FinancialReportController::class, 'store']);
Route::put('/laporan-keuangan/{id}', [FinancialReportController::class, 'update']);
Route::delete('/laporan-keuangan/{id}', [FinancialReportController::class, 'destroy']);

// 7. PENGURUS & ANGGOTA OSIS
Route::get('/pengurus-osis', [PengurusOsisController::class, 'index']);
Route::get('/pengurus-osis/{id}', [PengurusOsisController::class, 'show']);
Route::post('/pengurus-osis', [PengurusOsisController::class, 'store']);
Route::put('/pengurus-osis/{id}', [PengurusOsisController::class, 'update']);
Route::delete('/pengurus-osis/{id}', [PengurusOsisController::class, 'destroy']);

// Alias Route Anggota
Route::get('/anggota', [PengurusOsisController::class, 'index']);

// 8. DASHBOARD STATS
Route::get('/dashboard/stats', [DashboardController::class, 'index']);

// 9. PROTECTED ROUTES (Sesi Terautentikasi Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});
