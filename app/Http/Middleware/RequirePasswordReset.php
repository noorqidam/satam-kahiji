<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePasswordReset
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only check authenticated users accessing admin panel routes
        if ($user && $this->requiresPasswordReset($user)) {
            $currentRoute = $request->route()->getName();
            
            // Allow access to public routes and specific admin routes
            $allowedRoutes = [
                'home',
                'admin.login',
                'admin.password.request',
                'admin.password.email', 
                'admin.password.reset.required',
                'admin.password.reset.update',
                'verification.notice',
                'verification.verify',
                'verification.send',
                'logout',
            ];

            // Allow access to public routes (home, login, etc.) and admin password reset
            if (!in_array($currentRoute, $allowedRoutes)) {
                // Only redirect if user is trying to access admin panel or dashboard routes
                $adminPanelRoutes = ['admin.', 'dashboard', 'headmaster.', 'teacher.', 'staff.'];
                $isAdminPanelRoute = false;
                
                foreach ($adminPanelRoutes as $prefix) {
                    if (str_starts_with($currentRoute, $prefix)) {
                        $isAdminPanelRoute = true;
                        break;
                    }
                }
                
                if ($isAdminPanelRoute) {
                    return redirect()->route('admin.password.reset.required');
                }
            }
        }

        return $next($request);
    }

    /**
     * Determine if the user requires a password reset
     * 
     * @param \App\Models\User $user
     * @return bool
     */
    private function requiresPasswordReset($user): bool
    {
        // Add your specific logic here for when a user should be forced to reset their password
        // For example: password is too old, account was compromised, etc.
        // Currently returning false to not force password resets unless specifically required
        
        // You can add conditions like:
        // - Check if user has a password_reset_required flag
        // - Check if password is older than X days
        // - Check if account was flagged for security reasons
        
        return false;
    }
}