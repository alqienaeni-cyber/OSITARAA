<?php

namespace App\Http\Controllers;

use App\Models\FinancialReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinancialReportController extends Controller
{
    public function index()
    {
        $reports = FinancialReport::latest()->get();
        return response()->json($reports, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:Masuk,Keluar',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $report = FinancialReport::create([
            'type' => $request->type,
            'amount' => $request->amount,
            'description' => $request->description,
            'created_by' => Auth::id(),
        ]);

        return response()->json(['message' => 'Laporan keuangan berhasil ditambahkan', 'data' => $report], 201);
    }
}
