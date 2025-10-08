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
        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('caption')->nullable();
            $table->enum('type', ['image', 'video']);
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable(); // For video thumbnails
            $table->json('metadata')->nullable(); // File size, dimensions, etc.
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['gallery_id', 'sort_order']);
            $table->index(['gallery_id', 'is_featured']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gallery_items');
    }
};