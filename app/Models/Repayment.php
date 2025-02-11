<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Repayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'transaction_id',
        'user_id',
        'amount',
        'status',
    ];

    public function loanApplication()
    {
        return $this->belongsTo(LoanApplication::class, 'transaction_id', 'transaction_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
