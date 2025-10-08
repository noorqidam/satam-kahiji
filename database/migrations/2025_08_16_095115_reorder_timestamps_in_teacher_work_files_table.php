<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Since PostgreSQL doesn't support column reordering directly,
        // we need to recreate the table with the desired column order
        
        // First, create a temporary table with the new structure
        Schema::create('teacher_work_files_temp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_subject_work_id')->constrained('teacher_subject_work')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_url');
            $table->string('file_path')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamp('last_accessed')->nullable();
            $table->boolean('is_starred')->default(false);
            $table->json('tags')->nullable();
            $table->integer('views')->default(0);
            $table->integer('downloads')->default(0);
            
            // Timestamps at the end
            $table->timestamps();
            
            // Add indexes
            $table->index(['is_starred']);
            $table->index(['views']);
            $table->index(['downloads']);
            $table->index(['last_accessed']);
        });

        // Copy data from the original table to the temporary table
        DB::statement('
            INSERT INTO teacher_work_files_temp (
                id, teacher_subject_work_id, file_name, file_url, file_path, 
                file_size, mime_type, uploaded_at, last_accessed, is_starred, 
                tags, views, downloads, created_at, updated_at
            )
            SELECT 
                id, teacher_subject_work_id, file_name, file_url, file_path,
                file_size, mime_type, uploaded_at, last_accessed, is_starred,
                tags, views, downloads, created_at, updated_at
            FROM teacher_work_files
        ');

        // Drop foreign key constraints first
        Schema::table('work_item_feedback', function (Blueprint $table) {
            $table->dropForeign('work_item_feedback_teacher_work_file_id_foreign');
        });

        // Drop the original table
        Schema::dropIfExists('teacher_work_files');

        // Rename the temporary table to the original name
        Schema::rename('teacher_work_files_temp', 'teacher_work_files');

        // Recreate the foreign key constraint
        Schema::table('work_item_feedback', function (Blueprint $table) {
            $table->foreign('teacher_work_file_id')->references('id')->on('teacher_work_files')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // For the down migration, we'll recreate the original structure
        // This is complex to implement perfectly, so we'll just ensure the table exists
        
        if (!Schema::hasTable('teacher_work_files')) {
            Schema::create('teacher_work_files', function (Blueprint $table) {
                $table->id();
                $table->foreignId('teacher_subject_work_id')->constrained('teacher_subject_work')->cascadeOnDelete();
                $table->string('file_name');
                $table->string('file_url');
                $table->timestamps();
                $table->string('file_path')->nullable();
                $table->bigInteger('file_size')->nullable();
                $table->string('mime_type')->nullable();
                $table->timestamp('uploaded_at')->nullable();
                $table->timestamp('last_accessed')->nullable();
                $table->boolean('is_starred')->default(false);
                $table->json('tags')->nullable();
                $table->integer('views')->default(0);
                $table->integer('downloads')->default(0);
                
                // Add indexes
                $table->index(['is_starred']);
                $table->index(['views']);
                $table->index(['downloads']);
                $table->index(['last_accessed']);
            });
        }
    }
};
