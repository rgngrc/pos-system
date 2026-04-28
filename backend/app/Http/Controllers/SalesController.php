<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale; // Ensure your Model is imported

class SalesController extends Controller
{
    // This handles displaying the list in your Transactions.js
    public function index(Request $request)
    {
        $query = Sale::query();

        // If a user_id is provided in the URL, filter by it
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // 'with("user")' allows you to get the cashier's name from the users table
        return response()->json($query->with('user')->latest()->get());
    }

    // Your existing store method...
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'total' => 'required|numeric',
            'paymentMethod' => 'required|string',
            'user_id' => 'required|integer',
            'subtotal' => 'nullable|numeric',
            'discount_percentage' => 'nullable|numeric',
            'discount_amount' => 'nullable|numeric',
            'cash_received' => 'nullable|numeric',
            'cash_change' => 'nullable|numeric',
        ]);

        $sale = Sale::create($validated);

        return response()->json($sale, 201);
    }
}