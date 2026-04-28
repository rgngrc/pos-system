<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('sales', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->decimal('subtotal', 10, 2);
    $table->string('discount_type')->default('none');
    $table->string('discount_id_number')->nullable();
    $table->decimal('discount_percentage', 5, 2)->default(0);
    $table->decimal('discount_amount', 10, 2)->default(0);
    $table->decimal('total', 10, 2);
    $table->string('paymentMethod');
    $table->decimal('cash_received', 10, 2)->default(0);
    $table->decimal('cash_change', 10, 2)->default(0);
    $table->json('items');
    $table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
