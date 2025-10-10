<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, skip this migration to avoid index issues
            // Just add the is_published column if needed
            if (!Schema::hasColumn('posts', 'is_published')) {
                Schema::table('posts', function (Blueprint $table) {
                    $table->boolean('is_published')->default(false);
                });
            }
            return;
        }
        
        Schema::table('posts', function (Blueprint $table) {
            // Convert existing published_at data to boolean and add new column
            $table->boolean('is_published')->default(false)->after('category');
        });

        // Update existing records: set is_published = true where published_at is not null
        DB::table('posts')->whereNotNull('published_at')->update(['is_published' => true]);

        Schema::table('posts', function (Blueprint $table) {
            // Remove the old published_at column only if it exists
            if (Schema::hasColumn('posts', 'published_at')) {
                $table->dropColumn('published_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Restore published_at column
            $table->timestamp('published_at')->nullable()->after('category');
        });

        // Convert boolean back to timestamp for published posts
        DB::table('posts')->where('is_published', true)->update(['published_at' => DB::raw('updated_at')]);

        Schema::table('posts', function (Blueprint $table) {
            // Remove is_published column
            $table->dropColumn('is_published');
        });
    }
};
