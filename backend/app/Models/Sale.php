<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sale extends Model
{
    protected $fillable = [
        'user_id', 
        'subtotal', 
        'discount_percentage', 
        'discount_amount', 
        'total', 
        'paymentMethod', 
        'cash_received', 
        'cash_change', 
        'items'
    ];

    protected $casts = [
        'items' => 'array',
    ];

    /**
     * Get the user (cashier) that owns the sale.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}