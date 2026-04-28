<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SalesController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'total' => 'required|numeric',
            'paymentMethod' => 'required|string',
            'user_id' => 'required|integer',
        ]);

        $transaction = [
            'id' => uniqid(),
            'items' => $request->items,
            'total' => $request->total,
            'paymentMethod' => $request->paymentMethod,
            'user_id' => $request->user_id,
            'timestamp' => now(),
            'status' => 'completed',
        ];

        return response()->json($transaction, 201);
    }

    public function index()
    {
        return response()->json([]);
    }
}
