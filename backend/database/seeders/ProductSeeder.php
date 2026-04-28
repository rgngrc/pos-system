<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('products')->insert([
            ['name' => 'Rice (5kg)', 'barcode' => '1001', 'price' => 250.00, 'stock' => 20, 'category' => 'Staples', 'active' => true, 'created_at' => now()],
            ['name' => 'Cooking Oil (1L)', 'barcode' => '1002', 'price' => 120.00, 'stock' => 30, 'category' => 'Condiments', 'active' => true, 'created_at' => now()],
            ['name' => 'Canned Tuna', 'barcode' => '1003', 'price' => 55.00, 'stock' => 40, 'category' => 'Canned Goods', 'active' => true, 'created_at' => now()],
            ['name' => 'Instant Noodles', 'barcode' => '1004', 'price' => 18.00, 'stock' => 100, 'category' => 'Instant Food', 'active' => true, 'created_at' => now()],
            ['name' => 'Cola (500ml)', 'barcode' => '1005', 'price' => 35.00, 'stock' => 50, 'category' => 'Beverages', 'active' => true, 'created_at' => now()],
            ['name' => 'Bread (Loaf)', 'barcode' => '1006', 'price' => 45.00, 'stock' => 25, 'category' => 'Bakery', 'active' => true, 'created_at' => now()],
            ['name' => 'Potato Chips', 'barcode' => '1007', 'price' => 28.00, 'stock' => 60, 'category' => 'Snacks', 'active' => true, 'created_at' => now()],
            ['name' => 'Milk (1L)', 'barcode' => '1008', 'price' => 95.00, 'stock' => 35, 'category' => 'Dairy', 'active' => true, 'created_at' => now()],
            ['name' => 'Toothpaste', 'barcode' => '1009', 'price' => 70.00, 'stock' => 40, 'category' => 'Personal Care', 'active' => true, 'created_at' => now()],
            ['name' => 'Salt', 'barcode' => '1010', 'price' => 22.00, 'stock' => 80, 'category' => 'Staples', 'active' => true, 'created_at' => now()],
        ]);
    }
}