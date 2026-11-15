<?php

use Illuminate\Support\Facades\Route;

// 1. Halaman Utama Aplikasi OSITARA (Splash Screen, Login, & Semua Dashboard)
Route::get('/', function () {
    return view('app');
});

// 2. Route Simulasi Error 403 & 500 (untuk pengujian saat sidang/demo)
Route::get('/403', function () {
    abort(403);
});

Route::get('/500', function () {
    abort(500);
});

// 3. Semua URL acak selain '/' otomatis menampilkan halaman custom 404.blade.php
Route::fallback(function () {
    return response()->view('errors.404', [], 404);
});
