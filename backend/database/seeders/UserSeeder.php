<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'username' => 'admin1',
            'password' => Hash::make('pass123'),
            'role' => 'Administrator',
            'active' => true,
        ]);

        User::create([
            'name' => 'Supervisor User',
            'username' => 'supervisor1',
            'password' => Hash::make('pass123'),
            'role' => 'Supervisor',
            'active' => true,
        ]);

        User::create([
            'name' => 'Cashier User',
            'username' => 'cashier1',
            'password' => Hash::make('pass123'),
            'role' => 'Cashier',
            'active' => true,
        ]);
    }
}