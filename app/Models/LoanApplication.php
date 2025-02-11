<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanApplication extends Model
{
    use HasFactory;

    protected $table = 'loan_applications';

    protected $fillable = [
        'transaction_id',
        'employee_id',
        'loan_amount',
        'left_to_repay',
        'selected_plan',
        'interest_rate',
        'loan_purpose',
        'processing_fee',
        'total_amount_to_receive',
        'status'
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id', 'id');
    }
}
