<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class HealthController extends Controller
{
    /**
     * Mengecek status kesehatan aplikasi dan koneksi database
     */
    public function check()
    {
        try {
            DB::connection()->getPdo();

            return response()->json([
                'module' => 'Health Check OSITARA',
                'organization' => 'OSIS SMK Budi Bakti Ciwidey',
                'team' => 'Fluttershy',
                'status' => 'success',
                'database' => 'db_ositara terhubung',
                'timestamp' => now(),
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'module' => 'Health Check OSITARA',
                'status' => 'error',
                'message' => 'Koneksi database gagal',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
