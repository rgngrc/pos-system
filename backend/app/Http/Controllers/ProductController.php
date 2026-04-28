<?php

namespace App\Http\Controllers;

use App\Models\Product; // Ensure this model exists
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of products from the database.
     */
    public function index()
    {
        return response()->json(Product::all());
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        
        return response()->json($product);
    }

    /**
     * Store a newly created product in the database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'barcode' => 'required|string|unique:products,barcode',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'category' => 'required|string',
        ]);

        // This line saves the data to your MySQL 'products' table
        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    /**
     * Update the specified product in the database.
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        // Updates only the fields sent in the request
        $product->update($request->all());

        return response()->json($product);
    }

    /**
     * Remove the specified product from the database.
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}