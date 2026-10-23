<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DataAnggotaController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\PengurusOsisController;
use App\Http\Controllers\ProgramKerjaController;
use App\Http\Controllers\ProposalKegiatanController;

/*
|--------------------------------------------------------------------------
| API Routes - OSITARA
|--------------------------------------------------------------------------
*/

// Health Check API
Route::get('/health', [HealthController::class, 'check']);

// ==========================================
// 1. PUBLIC ROUTES (Tanpa Auth / Token)
// ==========================================

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Events / Kelola Kegiatan OSIS
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::post('/events', [EventController::class, 'store']);
Route::get('/events/{id}/peserta', [EventController::class, 'getPeserta']);

// Pendaftaran Event Siswa (Menggunakan EventController & Model EventRegist)
Route::get('/pendaftaran-event', [EventController::class, 'getRegistrations']);
Route::post('/pendaftaran-event', [EventController::class, 'storeRegistration']);
Route::post('/events/{id}/register', [EventController::class, 'storeRegistration']); // Kompatibilitas endpoint register

// Proposals (Public read & store - Mendukung /proposals dan /proposal-kegiatan)
Route::get('/proposals', [ProposalKegiatanController::class, 'index']);
Route::get('/proposals/{id}', [ProposalKegiatanController::class, 'show']);
Route::post('/proposals', [ProposalKegiatanController::class, 'store']);

Route::get('/proposal-kegiatan', [ProposalKegiatanController::class, 'index']);
Route::get('/proposal-kegiatan/{id}', [ProposalKegiatanController::class, 'show']);
Route::post('/proposal-kegiatan', [ProposalKegiatanController::class, 'store']);

// Program Kerja OSIS (Public read & store untuk testing)
Route::get('/program-kerja', [ProgramKerjaController::class, 'index']);
Route::get('/program-kerja/{id}', [ProgramKerjaController::class, 'show']);
Route::post('/program-kerja', [ProgramKerjaController::class, 'store']);

// Laporan Keuangan (Public read & store /laporan-keuangan dan /keuangan)
Route::get('/keuangan', [FinancialReportController::class, 'index']);
Route::post('/keuangan', [FinancialReportController::class, 'store']);
Route::get('/laporan-keuangan', [FinancialReportController::class, 'index']);
Route::post('/laporan-keuangan', [FinancialReportController::class, 'store']);

// Data Anggota & Pengurus OSIS (Public read & store untuk testing)
Route::get('/pengurus-osis', [PengurusOsisController::class, 'index']);
Route::get('/pengurus-osis/{id}', [PengurusOsisController::class, 'show']);
Route::post('/pengurus-osis', [PengurusOsisController::class, 'store']);

Route::get('/data-anggota', [DataAnggotaController::class, 'index']);

// Dashboard Info Stats
Route::get('/dashboard/stats', [DashboardController::class, 'index']);


// ==========================================
// 2. PROTECTED ROUTES (Wajib Auth Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth Logout & User Info
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // CRUD Event / Kegiatan
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    // CRUD Proposal Kegiatan
    Route::put('/proposals/{id}', [ProposalKegiatanController::class, 'update']);
    Route::patch('/proposals/{id}/status', [ProposalKegiatanController::class, 'updateStatus']);
    Route::delete('/proposals/{id}', [ProposalKegiatanController::class, 'destroy']);

    Route::put('/proposal-kegiatan/{id}', [ProposalKegiatanController::class, 'update']);
    Route::patch('/proposal-kegiatan/{id}/status', [ProposalKegiatanController::class, 'updateStatus']);
    Route::delete('/proposal-kegiatan/{id}', [ProposalKegiatanController::class, 'destroy']);

    // CRUD Program Kerja
    Route::put('/program-kerja/{id}', [ProgramKerjaController::class, 'update']);
    Route::delete('/program-kerja/{id}', [ProgramKerjaController::class, 'destroy']);

    // CRUD Pengurus OSIS
    Route::put('/pengurus-osis/{id}', [PengurusOsisController::class, 'update']);
    Route::delete('/pengurus-osis/{id}', [PengurusOsisController::class, 'destroy']);

    // CRUD Data Anggota
    Route::post('/data-anggota', [DataAnggotaController::class, 'store']);
    Route::put('/data-anggota/{id}', [DataAnggotaController::class, 'update']);
    Route::delete('/data-anggota/{id}', [DataAnggotaController::class, 'destroy']);

    // CRUD Laporan Keuangan
    Route::put('/keuangan/{id}', [FinancialReportController::class, 'update']);
    Route::delete('/keuangan/{id}', [FinancialReportController::class, 'destroy']);
    Route::put('/laporan-keuangan/{id}', [FinancialReportController::class, 'update']);
    Route::delete('/laporan-keuangan/{id}', [FinancialReportController::class, 'destroy']);

});
