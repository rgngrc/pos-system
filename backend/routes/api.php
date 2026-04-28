<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\VoidController;

// Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Products
Route::get('/products/search/{barcode}', [ProductController::class, 'searchByBarcode']);
Route::apiResource('products', ProductController::class);

// Users
Route::apiResource('users', UserController::class);

// Sales
Route::get('sales/user/{userId}', [SalesController::class, 'userSales']);
Route::apiResource('sales', SalesController::class);

// Void requests
Route::get('/void-requests', [VoidController::class, 'index']);
Route::post('/void-requests', [VoidController::class, 'store']);
Route::patch('/void-requests/{id}/review', [VoidController::class, 'review']);