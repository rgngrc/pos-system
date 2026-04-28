<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;

class SalesController extends Controller
{
    public function index()
    {
        // Return all sales with user relationship loaded
        return Sale::with('user')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'              => 'required|exists:users,id',
            'subtotal'             => 'required|numeric',
            'discount_type'        => 'nullable|string',
            'discount_id_number'   => 'nullable|string',
            'discount_percentage'  => 'nullable|numeric|min:0|max:100',
            'discount_amount'      => 'nullable|numeric',
            'total'                => 'required|numeric',
            'paymentMethod'        => 'required|string',
            'cash_received'        => 'nullable|numeric',
            'cash_change'          => 'nullable|numeric',
            'items'                => 'required|array',
        ]);

        $sale = Sale::create($validated);
        return $sale->load('user');
    }

    public function show($id)
    {
        return Sale::with('user')->findOrFail($id);
    }

    public function userSales($userId)
    {
        return Sale::where('user_id', $userId)->with('user')->orderBy('created_at', 'desc')->get();
    }
}