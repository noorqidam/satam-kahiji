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
        Schema::table('student_achievements', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['student_id', 'status']);
            $table->dropIndex(['verified_by']);
            
            // Drop foreign key constraints
            $table->dropForeign(['verified_by']);
            
            // Drop verification-related columns
            $table->dropColumn([
                'verified_by',
                'verified_at', 
                'status',
                'verification_notes'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_achievements', function (Blueprint $table) {
            // Add back verification columns
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null')
                  ->comment('Staff member who verified this achievement');
            $table->timestamp('verified_at')->nullable()->comment('When the achievement was verified');
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending')
                  ->comment('Status of the achievement verification');
            $table->text('verification_notes')->nullable()->comment('Notes from the verifier');
            
            // Add back indexes
            $table->index(['student_id', 'status']);
            $table->index('verified_by');
        });
    }
};