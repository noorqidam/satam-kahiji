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
        Schema::create('student_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('document_category_id')->constrained('document_categories')->onDelete('cascade');
            $table->enum('document_type', [
                'achievement_certificate', 'sick_note', 'excuse_letter', 
                'medical_certificate', 'permission_slip', 'report', 
                'transcript', 'other'
            ]);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_name');
            $table->string('file_path', 500);
            $table->integer('file_size'); // in bytes
            $table->string('mime_type', 100);
            $table->foreignId('uploaded_by')->constrained('staff')->onDelete('cascade');
            $table->enum('uploaded_by_type', ['staff', 'student'])->default('staff');
            $table->timestamp('upload_date')->useCurrent();
            $table->enum('status', ['pending', 'approved', 'rejected', 'archived'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('staff')->onDelete('set null');
            $table->timestamp('approval_date')->nullable();
            $table->text('approval_notes')->nullable();
            $table->date('expiry_date')->nullable();
            $table->integer('download_count')->default(0);
            $table->boolean('is_public')->default(false);
            $table->timestamps();
            
            $table->index(['student_id', 'document_type']);
            $table->index(['document_type', 'status']);
            $table->index('status');
            $table->index('upload_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_documents');
    }
};
