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
        // Add indexes for Posts table performance
        Schema::table('posts', function (Blueprint $table) {
            $table->index(['is_published', 'category', 'created_at'], 'posts_published_category_created_idx');
            $table->index(['category', 'created_at'], 'posts_category_created_idx');
        });

        // Add indexes for Pages table performance
        Schema::table('pages', function (Blueprint $table) {
            $table->index('slug', 'pages_slug_idx');
        });

        // Add indexes for Galleries table performance
        Schema::table('galleries', function (Blueprint $table) {
            $table->index(['is_published', 'sort_order'], 'galleries_published_sort_idx');
        });

        // Add indexes for Gallery Items table performance
        if (Schema::hasTable('gallery_items')) {
            Schema::table('gallery_items', function (Blueprint $table) {
                $table->index(['gallery_id', 'sort_order'], 'gallery_items_gallery_sort_idx');
            });
        }

        // Add indexes for Contacts table performance
        Schema::table('contacts', function (Blueprint $table) {
            $table->index('created_at', 'contacts_created_idx');
        });

        // Add indexes for Extracurriculars table performance
        Schema::table('extracurriculars', function (Blueprint $table) {
            $table->index('name', 'extracurriculars_name_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes for Posts table
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('posts_published_category_created_idx');
            $table->dropIndex('posts_category_created_idx');
        });

        // Drop indexes for Pages table
        Schema::table('pages', function (Blueprint $table) {
            $table->dropIndex('pages_slug_idx');
        });

        // Drop indexes for Galleries table
        Schema::table('galleries', function (Blueprint $table) {
            $table->dropIndex('galleries_published_sort_idx');
        });

        // Drop indexes for Gallery Items table
        if (Schema::hasTable('gallery_items')) {
            Schema::table('gallery_items', function (Blueprint $table) {
                $table->dropIndex('gallery_items_gallery_sort_idx');
            });
        }

        // Drop indexes for Contacts table
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropIndex('contacts_created_idx');
        });

        // Drop indexes for Extracurriculars table
        Schema::table('extracurriculars', function (Blueprint $table) {
            $table->dropIndex('extracurriculars_name_idx');
        });
    }
};
