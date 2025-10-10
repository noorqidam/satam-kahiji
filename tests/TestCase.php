<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure Vite manifest exists for testing
        $this->ensureViteManifestExists();
        
        // For SQLite testing, create only essential tables manually
        if (DB::getDriverName() === 'sqlite') {
            $this->setupSQLiteTestDatabase();
        }
    }

    protected function tearDown(): void
    {
        // Clear authentication state between tests
        $this->app['auth']->forgetGuards();
        
        parent::tearDown();
    }

    /**
     * Ensure Vite manifest exists for testing
     */
    private function ensureViteManifestExists(): void
    {
        $manifestPath = public_path('build/manifest.json');
        
        if (!file_exists($manifestPath)) {
            // Create build directory if it doesn't exist
            $buildDir = dirname($manifestPath);
            if (!is_dir($buildDir)) {
                mkdir($buildDir, 0755, true);
            }
            
            // Create a minimal manifest for testing
            $minimalManifest = [
                'resources/css/app.css' => [
                    'file' => 'assets/app-test.css',
                    'isEntry' => true,
                    'src' => 'resources/css/app.css'
                ],
                'resources/js/app.tsx' => [
                    'file' => 'assets/app-test.js',
                    'isEntry' => true,
                    'src' => 'resources/js/app.tsx'
                ]
            ];
            
            file_put_contents($manifestPath, json_encode($minimalManifest, JSON_PRETTY_PRINT));
            
            // Create minimal CSS and JS files
            $cssPath = public_path('build/assets/app-test.css');
            $jsPath = public_path('build/assets/app-test.js');
            
            if (!file_exists(dirname($cssPath))) {
                mkdir(dirname($cssPath), 0755, true);
            }
            
            if (!file_exists($cssPath)) {
                file_put_contents($cssPath, '/* Test CSS */');
            }
            
            if (!file_exists($jsPath)) {
                file_put_contents($jsPath, '/* Test JS */');
            }
        }
    }

    private function setupSQLiteTestDatabase(): void
    {
        // Only drop specific tables, don't drop all tables
        $tablesToDrop = ['users', 'sessions', 'password_reset_tokens', 'cache', 'cache_locks', 'pages', 'contacts', 'staff', 'position_history', 'user_activities', 'facilities', 'teacher_subject_work', 'subjects', 'subject_staff', 'posts', 'galleries', 'extracurriculars'];
        
        foreach ($tablesToDrop as $table) {
            Schema::dropIfExists($table);
        }

        // Create essential tables for authentication tests
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['super_admin', 'headmaster', 'teacher', 'deputy_headmaster']);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Create cache table for sessions
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        // Create pages table for navigation
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        // Create contacts table for middleware
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->text('message');
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        // Create staff table for user relations
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('position');
            $table->string('division');
            $table->string('photo')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('homeroom_class')->nullable()->unique();
            $table->string('slug')->nullable()->unique();
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        // Create position_history table for UserObserver
        Schema::create('position_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->string('title');
            $table->year('start_year');
            $table->year('end_year')->nullable();
            $table->timestamps();
        });

        // Create user_activities table for activity logging
        Schema::create('user_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('activity_type');
            $table->text('description');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // Create facilities table for facility management tests
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('photo')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // Create teacher_subject_work table for middleware compatibility
        Schema::create('teacher_subject_work', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->string('subject_name');
            $table->string('work_title');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Create subjects table for profile/user management tests
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Create subject_staff pivot table for staff-subject relationships
        Schema::create('subject_staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->timestamps();
            
            $table->unique(['subject_id', 'staff_id']);
        });

        // Create posts table for news/content management
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('category')->default('news');
            $table->boolean('is_published')->default(false);
            $table->string('image')->nullable();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // Create galleries table for photo galleries
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->boolean('is_published')->default(false);
            $table->string('featured_image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->text('content')->nullable();
            $table->timestamps();
        });

        // Create extracurriculars table for extracurricular activities
        Schema::create('extracurriculars', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('photo')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }
}
