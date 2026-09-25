<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\FinancialReportController;

// Public Routes (Tanpa Auth)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Butuh Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);

    // Event & Pendaftaran (US-001)
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::post('/events/{id}/register', [EventController::class, 'register']);

    // Proposal (US-003)
    Route::get('/proposals', [ProposalController::class, 'index']);
    Route::post('/proposals', [ProposalController::class, 'store']);
    Route::get('/proposals/{id}', [ProposalController::class, 'show']);
    Route::put('/proposals/{id}', [ProposalController::class, 'update']);
    Route::delete('/proposals/{id}', [ProposalController::class, 'destroy']);
    Route::put('/proposals/{id}/approval', [ProposalController::class, 'approve']);

    // Laporan Keuangan (FR-007)
    Route::get('/financial-reports', [FinancialReportController::class, 'index']);
    Route::post('/financial-reports', [FinancialReportController::class, 'store']);
    Route::get('/financial-reports/{id}', [FinancialReportController::class, 'show']);
    Route::put('/financial-reports/{id}', [FinancialReportController::class, 'update']);
    Route::delete('/financial-reports/{id}', [FinancialReportController::class, 'destroy']);
});
