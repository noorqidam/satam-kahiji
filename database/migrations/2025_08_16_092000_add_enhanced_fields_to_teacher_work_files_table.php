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
        Schema::table('teacher_work_files', function (Blueprint $table) {
            // File storage and metadata
            $table->string('file_path')->nullable()->after('file_url');
            $table->bigInteger('file_size')->nullable()->after('file_path');
            $table->string('mime_type')->nullable()->after('file_size');
            
            // Analytics and engagement
            $table->timestamp('last_accessed')->nullable()->after('uploaded_at');
            $table->boolean('is_starred')->default(false)->after('last_accessed');
            $table->json('tags')->nullable()->after('is_starred');
            $table->integer('views')->default(0)->after('tags');
            $table->integer('downloads')->default(0)->after('views');
            
            // Add indexes for performance
            $table->index(['is_starred']);
            $table->index(['views']);
            $table->index(['downloads']);
            $table->index(['last_accessed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_work_files', function (Blueprint $table) {
            $table->dropIndex(['is_starred']);
            $table->dropIndex(['views']);
            $table->dropIndex(['downloads']);
            $table->dropIndex(['last_accessed']);
            
            $table->dropColumn([
                'file_path',
                'file_size',
                'mime_type',
                'last_accessed',
                'is_starred',
                'tags',
                'views',
                'downloads'
            ]);
        });
    }
};