<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('admin.login');
        }

        $allowedRoles = explode('|', $roles);
        
        // Debug logging
        Log::info('RoleMiddleware Debug', [
            'user_role' => $request->user()->role,
            'allowed_roles' => $allowedRoles,
            'role_in_allowed' => in_array($request->user()->role, $allowedRoles),
            'request_path' => $request->path()
        ]);
        
        if (!in_array($request->user()->role, $allowedRoles)) {
            abort(403, 'Access denied. You do not have the required role.');
        }

        return $next($request);
    }
}