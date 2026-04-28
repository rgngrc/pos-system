<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoidRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'requested_by',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    // Relationships
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Aliases for frontend compatibility
    public function requested_by_user()
    {
        return $this->requestedBy();
    }

    public function reviewed_by_user()
    {
        return $this->reviewedBy();
    }
}