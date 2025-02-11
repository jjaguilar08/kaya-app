<?php

use App\Http\Controllers\LoanApplicationController;
use App\Http\Controllers\RepaymentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/test', function () {
    return response()->json([
        'message' => 'This is a test API endpoint',
        'data' => ['foo' => 'bar']
    ]);
});

Route::post('/loan-application', [LoanApplicationController::class, 'store']);
Route::get('/loan-application/employee/{employeeId}', [LoanApplicationController::class, 'getByEmployeeId']);
Route::get('/loan-application/employer/{employerId}', [LoanApplicationController::class, 'getByEmployerId']);
Route::put('/loan-applications/{transactionId}/status', [LoanApplicationController::class, 'updateStatus']);
Route::post('/loan-applications/{transactionId}/repay', [LoanApplicationController::class, 'repayLoan']);
Route::get('/loan-applications/manual', [LoanApplicationController::class, 'getManualLoanApplications']);



Route::post('/repayments', [RepaymentController::class, 'store']);
Route::get('/repayments/user/{userId}', [RepaymentController::class, 'getByUserId']);
Route::get('/repayments/employer/{employerId}', [RepaymentController::class, 'getByEmployerId']);
Route::put('/repayments/{id}/status', [RepaymentController::class, 'updateStatus']);




Route::get('/users/employer/{employer_id}', [UserController::class, 'getUsersByEmployerId']);

