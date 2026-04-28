<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subtotal',
        'discount_type',
        'discount_id_number',
        'discount_percentage',
        'discount_amount',
        'total',
        'paymentMethod',
        'cash_received',
        'cash_change',
        'items',
    ];

    protected $casts = [
        'items' => 'json',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}