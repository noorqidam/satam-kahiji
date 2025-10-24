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
            // Check if status column exists before trying to drop it
            if (Schema::hasColumn('student_documents', 'status')) {
                // Drop indexes that reference the status column first
                $table->dropIndex(['document_type', 'status']); // student_documents_document_type_status_index
                $table->dropIndex(['status']); // student_documents_status_index
                
                // Now drop the status column
                $table->dropColumn('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected', 'archived'])->default('pending');
        });
    }
};
