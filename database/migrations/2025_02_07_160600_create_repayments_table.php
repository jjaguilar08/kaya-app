<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('repayments', function (Blueprint $table) {
            $table->id();
            $table->integer('loan_id');
            $table->string('transaction_id');
            $table->foreignId('user_id');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending'); 
            $table->timestamps(); // Adds created_at and updated_at columns
        });
    }

    public function down()
    {
        Schema::dropIfExists('repayments');
    }
};
