<?php

use App\Http\Middleware\AddCacheHeaders;
use App\Http\Middleware\CompressResponse;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandleLargeUploads;
use App\Http\Middleware\RequirePasswordReset;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SetAssetMimeTypes;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Removed SetAssetMimeTypes middleware - handled via route now

        $middleware->web(append: [
            CompressResponse::class,
            AddCacheHeaders::class,
            HandleLargeUploads::class,
            HandleAppearance::class,
            SetLocale::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            RequirePasswordReset::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);

        $middleware->redirectGuestsTo(fn () => route('admin.login'));
        
        $middleware->redirectUsersTo(function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            
            // If user hasn't verified their email, redirect to verification notice
            if ($user && !$user->hasVerifiedEmail()) {
                return route('verification.notice');
            }
            
            return match ($user->role ?? 'super_admin') {
                'super_admin' => route('admin.dashboard'),
                'headmaster' => route('headmaster.dashboard'),
                'teacher' => route('teacher.dashboard'),
                'humas', 'tu', 'deputy_headmaster' => route('staff.dashboard'),
                default => route('admin.dashboard'),
            };
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
