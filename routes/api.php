<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProposalController; // <-- Tambahkan ini

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/events', [EventController::class, 'index']);

    // Proposals (Tambahkan ini)
    Route::post('/proposals', [ProposalController::class, 'store']);
    Route::get('/proposals', [ProposalController::class, 'index']);
});
