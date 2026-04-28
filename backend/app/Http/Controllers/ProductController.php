<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProductController extends Controller
{
    private $products = [
        ['id' => 1, 'name' => 'Rice (5kg)', 'barcode' => '1001', 'price' => 250, 'stock' => 40, 'active' => true, 'category' => 'Staples'],
        ['id' => 2, 'name' => 'Cooking Oil (1L)', 'barcode' => '1002', 'price' => 85, 'stock' => 3, 'active' => true, 'category' => 'Condiments'],
        ['id' => 3, 'name' => 'Sugar (1kg)', 'barcode' => '1003', 'price' => 65, 'stock' => 20, 'active' => false, 'category' => 'Staples'],
        ['id' => 4, 'name' => 'Sardines (can)', 'barcode' => '1004', 'price' => 28, 'stock' => 0, 'active' => true, 'category' => 'Canned Goods'],
        ['id' => 5, 'name' => 'Instant Noodles', 'barcode' => '1005', 'price' => 15, 'stock' => 80, 'active' => true, 'category' => 'Instant Food'],
        ['id' => 6, 'name' => 'Bottled Water (500ml)', 'barcode' => '1006', 'price' => 20, 'stock' => 50, 'active' => true, 'category' => 'Beverages'],
        ['id' => 7, 'name' => 'Bread (loaf)', 'barcode' => '1007', 'price' => 45, 'stock' => 12, 'active' => true, 'category' => 'Bakery'],
    ];

    public function index()
    {
        return response()->json($this->products);
    }

    public function show($id)
    {
        $product = collect($this->products)->firstWhere('id', $id);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'barcode' => 'required|string|unique:products',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'category' => 'required|string',
        ]);

        $product = [
            'id' => count($this->products) + 1,
            'name' => $request->name,
            'barcode' => $request->barcode,
            'price' => $request->price,
            'stock' => $request->stock,
            'active' => true,
            'category' => $request->category,
        ];

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = collect($this->products)->firstWhere('id', $id);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $updated = array_merge($product, $request->all());
        return response()->json($updated);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Product deleted']);
    }
}
