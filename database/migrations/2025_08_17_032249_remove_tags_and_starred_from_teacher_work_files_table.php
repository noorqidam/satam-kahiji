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
            // Drop columns (indexes will be dropped automatically)
            $table->dropColumn(['tags', 'is_starred']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_work_files', function (Blueprint $table) {
            // Add columns back
            $table->json('tags')->nullable()->after('last_accessed');
            $table->boolean('is_starred')->default(false)->after('tags');
            
            // Add index back
            $table->index(['is_starred']);
        });
    }
};
