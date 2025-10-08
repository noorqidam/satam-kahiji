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
        Schema::table('galleries', function (Blueprint $table) {
            // Remove old single-item fields
            $table->dropColumn(['type', 'file_path']);
            
            // Add gallery collection fields
            $table->string('slug')->unique()->after('title');
            $table->text('description')->nullable()->after('slug');
            $table->string('featured_image')->nullable()->after('description');
            $table->boolean('is_published')->default(true)->after('featured_image');
            $table->integer('sort_order')->default(0)->after('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            // Remove new fields
            $table->dropColumn(['slug', 'description', 'featured_image', 'is_published', 'sort_order']);
            
            // Add back old fields
            $table->enum('type', ['image', 'video'])->after('title');
            $table->string('file_path')->after('type');
        });
    }
};