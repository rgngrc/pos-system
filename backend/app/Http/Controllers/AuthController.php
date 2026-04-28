<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = [
            'id' => 1,
            'username' => $request->username,
            'password' => $request->password,
            'role' => 'Cashier',
            'name' => 'Test User',
            'active' => true
        ];

        // Find user (in production, query database)
        $validUsers = [
            ['id' => 1, 'username' => 'cashier1', 'password' => 'pass123', 'role' => 'Cashier', 'name' => 'Juan dela Cruz', 'active' => true],
            ['id' => 2, 'username' => 'supervisor1', 'password' => 'pass123', 'role' => 'Supervisor', 'name' => 'Maria Santos', 'active' => true],
            ['id' => 3, 'username' => 'admin1', 'password' => 'pass123', 'role' => 'Administrator', 'name' => 'Pedro Reyes', 'active' => true],
        ];

        $foundUser = collect($validUsers)
            ->first(function ($u) use ($request) {
                return $u['username'] === $request->username && $u['password'] === $request->password;
            });

        if (!$foundUser) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return response()->json(['user' => $foundUser, 'token' => 'temp-token']);
    }

    public function logout()
    {
        return response()->json(['message' => 'Logged out successfully']);
    }
}
