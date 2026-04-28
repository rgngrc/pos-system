<?php

namespace App\Http\Controllers;

use App\Models\VoidRequest;
use Illuminate\Http\Request;

class VoidController extends Controller
{
    // Get all void requests
    public function index()
    {
        return VoidRequest::with(['sale', 'requestedBy', 'reviewedBy'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Cashier submits a void request
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'requested_by' => 'required|exists:users,id',
            'reason' => 'required|string',
        ]);

        // Check if there's already a pending request for this sale
        $existing = VoidRequest::where('sale_id', $validated['sale_id'])
                               ->where('status', 'Pending')
                               ->first();
        if ($existing) {
            return response()->json(['message' => 'Void request already pending for this sale'], 409);
        }

        $voidRequest = VoidRequest::create([
            'sale_id' => $validated['sale_id'],
            'requested_by' => $validated['requested_by'],
            'reason' => $validated['reason'],
            'status' => 'Pending',
        ]);

        return response()->json($voidRequest->load(['sale', 'requestedBy']), 201);
    }

    // Supervisor approves or rejects
    public function review(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Approved,Rejected',
            'reviewed_by' => 'required|exists:users,id',
        ]);

        $voidRequest = VoidRequest::with('sale')->findOrFail($id);

        if ($voidRequest->status !== 'Pending') {
            return response()->json(['message' => 'Void request already reviewed'], 409);
        }

        $voidRequest->update([
            'status' => $validated['status'],
            'reviewed_by' => $validated['reviewed_by'],
            'reviewed_at' => now(),
        ]);

        return response()->json($voidRequest->load(['sale', 'requestedBy', 'reviewedBy']));
    }
}