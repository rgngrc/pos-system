<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    private $users = [
        ['id' => 1, 'username' => 'cashier1', 'role' => 'Cashier', 'name' => 'Juan dela Cruz', 'active' => true],
        ['id' => 2, 'username' => 'supervisor1', 'role' => 'Supervisor', 'name' => 'Maria Santos', 'active' => true],
        ['id' => 3, 'username' => 'admin1', 'role' => 'Administrator', 'name' => 'Pedro Reyes', 'active' => true],
    ];

    public function index()
    {
        return response()->json($this->users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users',
            'name' => 'required|string',
            'role' => 'required|in:Cashier,Supervisor,Administrator',
        ]);

        $user = [
            'id' => count($this->users) + 1,
            'username' => $request->username,
            'name' => $request->name,
            'role' => $request->role,
            'active' => true,
        ];

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = collect($this->users)->firstWhere('id', $id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $updated = array_merge($user, $request->all());
        return response()->json($updated);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'User deleted']);
    }
}
