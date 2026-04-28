<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SalesController;

// --- REMOVED THE OPTIONS ROUTE FROM HERE ---

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Product routes
Route::apiResource('products', ProductController::class);
Route::get('products/search/{barcode}', [ProductController::class, 'searchByBarcode']);

// User routes
Route::apiResource('users', UserController::class);

// Sales routes
Route::apiResource('sales', SalesController::class);
Route::get('sales/user/{userId}', [SalesController::class, 'userSales']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');