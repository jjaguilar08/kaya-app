<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('loan_applications', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key
            $table->string('transaction_id')->unique(); // Unique transaction ID
            $table->unsignedBigInteger('employee_id'); // Foreign key (if needed)
            $table->decimal('loan_amount', 10, 2); // Loan amount with 2 decimal places
            $table->decimal('left_to_repay', 10, 2); // amount left to repay
            $table->integer('selected_plan'); // Number of months for installment
            $table->decimal('interest_rate', 5, 2); // Interest rate percentage
            $table->string('loan_purpose'); // Purpose of the loan
            $table->decimal('processing_fee', 10, 2); // Processing fee
            $table->decimal('total_amount_to_receive', 10, 2); // Amount after fees
            $table->enum('status', ['Manual', 'Pending', 'Active', 'Completed', 'Rejected'])
                ->default('Pending');
            $table->timestamps(); // Adds created_at and updated_at columns
        });
    }

    public function down()
    {
        Schema::dropIfExists('loan_applications');
    }
};
