<?php

namespace App\Http\Controllers;

use App\Models\LoanApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LoanApplicationController extends Controller
{
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'employee_id' => 'required|integer',
            'loanAmount' => 'required|numeric|min:1',
            'selectedPlan' => 'required|integer',
            'interestRate' => 'required|numeric|min:0',
            'loanPurpose' => 'required|string|max:255',
            'processingFee' => 'required|numeric|min:0',
            'totalAmountToReceive' => 'required|numeric|min:0',
        ]);

        // Generate a unique transaction ID
        $transactionId = strtoupper(Str::random(20));

        // Create a new loan application record
        $loanApplication = LoanApplication::create([
            'transaction_id' => $transactionId,
            'employee_id' => $validated['employee_id'],
            'loan_amount' => $validated['loanAmount'],
            'left_to_repay' => $validated['loanAmount'],
            'selected_plan' => $validated['selectedPlan'],
            'interest_rate' => $validated['interestRate'],
            'loan_purpose' => $validated['loanPurpose'],
            'processing_fee' => $validated['processingFee'],
            'total_amount_to_receive' => $validated['totalAmountToReceive'],
            'status' => 'Pending'
        ]);

        // Return a success response
        return response()->json([
            'message' => 'Loan application submitted successfully.',
            'transaction_id' => $transactionId,
            'loan_application' => $loanApplication
        ], 201);
    }

    // Fetch loan applications based on employee_id
    public function getByEmployeeId($employeeId)
    {
        $loanApplications = LoanApplication::where('employee_id', $employeeId)->get();

        return response()->json([
            'loan_applications' => $loanApplications
        ]);
    }

    // Fetch all loan applications for employees under an employer (based on employer_id)
    public function getByEmployerId($employerId)
    {
        // Get the employee IDs for this employer
        $employees = User::where('employer_id', $employerId)->pluck('id');

        // Fetch loan applications for these employees
        $loanApplications = LoanApplication::whereIn('employee_id', $employees)
            ->with(['employee'])
            ->get();

        return response()->json([
            'loan_applications' => $loanApplications
        ]);
    }

    public function updateStatus(Request $request, $transactionId)
    {
        // Validate request input
        $validated = $request->validate([
            'status' => 'required|in:Pending,Active,Completed,Rejected,Manual'
        ]);

        // Find the loan application by transaction ID
        $loanApplication = LoanApplication::where('transaction_id', $transactionId)->first();

        // If the loan application is not found, return an error response
        if (!$loanApplication) {
            return response()->json([
                'message' => 'Loan application not found.'
            ], 404);
        }

        // Update the loan status
        $loanApplication->update([
            'status' => $validated['status']
        ]);

        // Return success response
        return response()->json([
            'message' => 'Loan status updated successfully.',
            'loan_application' => $loanApplication
        ], 200);
    }

    public function repayLoan(Request $request, $transactionId)
    {
        // Validate request input
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1'
        ]);

        // Find the loan application by transaction ID
        $loanApplication = LoanApplication::where('transaction_id', $transactionId)->first();

        // If the loan application is not found, return an error response
        if (!$loanApplication) {
            return response()->json([
                'message' => 'Loan application not found.'
            ], 404);
        }

        // Ensure that the repayment amount is not greater than the amount left to repay
        if ($validated['amount'] > $loanApplication->left_to_repay) {
            return response()->json([
                'message' => 'Repayment amount exceeds the remaining balance.'
            ], 400);
        }

        // Deduct the repayment amount
        $loanApplication->left_to_repay -= $validated['amount'];

        // If left_to_repay is 0, update status to Completed
        if ($loanApplication->left_to_repay <= 0) {
            $loanApplication->left_to_repay = 0;
            $loanApplication->status = 'Completed';
        }

        // Save the changes
        $loanApplication->save();

        // Return success response
        return response()->json([
            'message' => 'Repayment successful.',
            'loan_application' => $loanApplication
        ], 200);
    }

    public function getManualLoanApplications()
{
    // Fetch loan applications with status 'Manual', including employee and employer details
    $loanApplications = LoanApplication::where('status', 'Manual')
        ->with(['employee' => function ($query) {
            $query->select('id', 'name', 'employer_id')->with(['employer' => function ($query) {
                $query->select('id', 'name');
            }]);
        }])
        ->get();

    // Format response
    $formattedApplications = $loanApplications->map(function ($loan) {
        return [
            'transaction_id' => $loan->transaction_id,
            'loan_amount' => $loan->loan_amount,
            'left_to_repay' => $loan->left_to_repay,
            'selected_plan' => $loan->selected_plan,
            'interest_rate' => $loan->interest_rate,
            'loan_purpose' => $loan->loan_purpose,
            'processing_fee' => $loan->processing_fee,
            'total_amount_to_receive' => $loan->total_amount_to_receive,
            'status' => $loan->status,
            'employee' => [
                'id' => $loan->employee->id ?? null,
                'name' => $loan->employee->name ?? 'Unknown',
            ],
            'employer' => [
                'id' => $loan->employee->employer->id ?? null,
                'name' => $loan->employee->employer->name ?? 'Unknown',
            ]
        ];
    });

    return response()->json([
        'loan_applications' => $formattedApplications
    ], 200);
}

}
