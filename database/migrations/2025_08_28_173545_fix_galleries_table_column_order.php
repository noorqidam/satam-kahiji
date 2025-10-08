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
        // Backup existing data
        $existingData = DB::table('galleries')->get();
        $existingGalleryItems = DB::table('gallery_items')->get();
        
        // Drop gallery_items table first (it depends on galleries)
        Schema::dropIfExists('gallery_items');
        
        // Now drop and recreate galleries table with proper column order
        Schema::dropIfExists('galleries');
        
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('featured_image')->nullable();
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps(); // This will be at the end
        });
        
        // Recreate gallery_items table
        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('caption')->nullable();
            $table->enum('type', ['image', 'video']);
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['gallery_id', 'sort_order']);
            $table->index(['gallery_id', 'is_featured']);
        });
        
        // Restore existing data
        if ($existingData->isNotEmpty()) {
            foreach ($existingData as $data) {
                DB::table('galleries')->insert((array) $data);
            }
        }
        
        if ($existingGalleryItems->isNotEmpty()) {
            foreach ($existingGalleryItems as $data) {
                DB::table('gallery_items')->insert((array) $data);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration fixes column order, so we don't really want to reverse it
        // But for completeness, we could recreate with the old order if needed
        // For now, we'll just leave it as is since the structure is correct
    }
};