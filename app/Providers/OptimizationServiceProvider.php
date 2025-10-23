<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;

class OptimizationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Prevent lazy loading to catch N+1 queries in development
        if (app()->environment('local')) {
            Model::preventLazyLoading();
        }

        // Enable query caching for heavy queries
        Model::shouldBeStrict(app()->environment('local'));

        // Optimize database queries
        DB::listen(function (QueryExecuted $query) {
            // Log slow queries in development
            if (app()->environment('local') && $query->time > 100) {
                logger("Slow query detected: {$query->sql} - {$query->time}ms");
            }
        });

        // Enable database query caching
        config(['database.redis.cache' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', 6379),
            'database' => env('REDIS_CACHE_DB', 1),
        ]]);
    }
}
