@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-[#FDFDFC] text-[#1b1b1b] flex flex-col items-center justify-center p-6">
    <!-- Konten atau komponen frontend asli kamu di sini -->
    <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">OSITARA</h1>
        <p class="text-lg text-gray-600 mb-6">Sistem Manajemen Pengelolaan Administrasi OSIS SMK Budi Bakti Ciwidey</p>
        <a href="/login" class="px-6 py-3 bg-[#2158B8] text-white rounded-lg shadow hover:bg-blue-700 transition">Masuk ke Sistem</a>
    </div>
</div>
@endsection
