<?php

use Illuminate\Support\Facades\Route;

// Mengarahkan ke resources/views/app.blade.php
Route::get('/', function () {
    return view('app');
});

Route::get('/login', function () {
    return view('app');
})->name('login');

Route::get('/register', function () {
    return view('app');
});

Route::get('/test-403', function () {
    abort(403);
});

Route::get('/test-404', function () {
    abort(404);
});

Route::get('/test-500', function () {
    abort(500);
});

// Fallback Route untuk React SPA
Route::fallback(function () {
    return view('app');
});