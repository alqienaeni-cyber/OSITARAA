<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProposalController extends Controller
{
    // GET /api/proposals
    public function index()
    {
        $proposals = Proposal::all();
        return response()->json([
            'status' => 'success',
            'data' => $proposals
        ], 200);
    }

    // POST /api/proposals
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'file_path' => 'nullable|string',
        ]);

        $proposal = Proposal::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'file_path' => $validated['file_path'] ?? 'proposals/default.pdf',
            'status' => 'Pending',
            'user_id' => Auth::id() ?? 1,
        ]);

        return response()->json([
            'message' => 'Proposal berhasil dibuat',
            'data' => $proposal
        ], 201);
    }

    // GET /api/proposals/{id}
    public function show($id)
    {
        $proposal = Proposal::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $proposal
        ], 200);
    }

    // PUT /api/proposals/{id}
    public function update(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);
        $proposal->update($request->all());

        return response()->json([
            'message' => 'Proposal berhasil diperbarui',
            'data' => $proposal
        ], 200);
    }

    // DELETE /api/proposals/{id}
    public function destroy($id)
    {
        $proposal = Proposal::findOrFail($id);
        $proposal->delete();

        return response()->json([
            'message' => 'Proposal berhasil dihapus'
        ], 200);
    }

    // PUT /api/proposals/{id}/approval
    public function approve(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);
        $request->validate([
            'status' => 'required|in:Approved,Rejected,Pending'
        ]);

        $proposal->status = $request->status;
        $proposal->save();

        return response()->json([
            'message' => 'Status proposal berhasil diperbarui',
            'data' => $proposal
        ], 200);
    }
}
