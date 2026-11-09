@extends('layouts.app')

@section('title', 'Beranda')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-10">
        <div class="p-5 mb-4 bg-white rounded-3 shadow-sm border">
            <div class="container-fluid py-3">
                <h1 class="display-5 fw-bold text-primary">Selamat Datang di OSITARA</h1>
                <p class="col-md-8 fs-4 text-muted">Sistem Manajemen Pengelolaan Administrasi OSIS SMK Budi Bakti Ciwidey.</p>
                <hr class="my-4">
                <p>Aplikasi pengelolaan organisasi siswa berbasis web untuk mendukung efisiensi kegiatan sekolah.</p>
                <a href="#" class="btn btn-teal btn-lg">Masuk ke Sistem</a>
            </div>
        </div>
    </div>
</div>
@endsection
