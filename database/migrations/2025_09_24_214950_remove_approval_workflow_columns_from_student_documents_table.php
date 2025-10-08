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
        Schema::table('student_documents', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['approved_by']);
            
            // Drop the approval workflow columns
            $table->dropColumn([
                'approved_by',
                'approval_date', 
                'approval_notes',
                'expiry_date'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {
            // Recreate the approval workflow columns if rollback is needed
            $table->foreignId('approved_by')->nullable()->constrained('staff')->onDelete('set null');
            $table->timestamp('approval_date')->nullable();
            $table->text('approval_notes')->nullable();
            $table->date('expiry_date')->nullable();
        });
    }
};
