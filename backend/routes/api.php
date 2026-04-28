<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SalesController;

// Handle CORS preflight requests
Route::options('/{any}', function () {
    return response()
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        ->header('Access-Control-Max-Age', '3600');
})->where('any', '.*');

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
