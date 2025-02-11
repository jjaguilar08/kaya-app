<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Repayment;
use App\Models\User;
use App\Models\LoanApplication;

class RepaymentController extends Controller
{
    // Store Repayment
    public function store(Request $request)
    {
        $request->validate([
            'loan_id' => 'required|integer',
            'transaction_id' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'user_id' => 'required|integer|exists:users,id',
            'status' => 'required|string|in:Pending,Approved,Rejected'
        ]);

        $repayment = Repayment::create($request->all());

        return response()->json([
            'message' => 'Repayment request submitted successfully',
            'repayment' => $repayment
        ], 201);
    }

    // Get all repayments for a specific user
    public function getByUserId($userId)
    {
        $repayments = Repayment::where('user_id', $userId)
            ->with(['loanApplication', 'user'])
            ->get();

        return response()->json(['repayments' => $repayments]);
    }

    // Get all repayments for a specific employer
    public function getByEmployerId($employerId)
    {
        // Get employee IDs under this employer
        $employeeIds = User::where('employer_id', $employerId)->pluck('id');

        // Get repayments related to these employees
        $repayments = Repayment::whereIn('user_id', $employeeIds)
            ->with(['loanApplication', 'user'])
            ->get();

        return response()->json(['repayments' => $repayments]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Pending,Approved,Rejected'
        ]);

        $repayment = Repayment::findOrFail($id);

        $repayment->status = $request->status;
        $repayment->save();

        return response()->json([
            'message' => 'Repayment status updated successfully',
            'repayment' => $repayment
        ]);
    }
}
