<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the admin dashboard.
     */
    public function index(): Response
    {
        try {
            $totalUsers = User::count();
            
            $usersByRole = User::selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->pluck('count', 'role')
                ->toArray();


            $activeUsers = User::whereNotNull('email_verified_at')
                ->count();

            $recentLoginCount = UserActivity::where('activity_type', 'login')
                ->where('created_at', '>=', now()->subDays(7))
                ->count();

            $metrics = [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'users_by_role' => $usersByRole,
                'recent_login_count' => $recentLoginCount,
            ];

            // Get recent activities (logins, registrations, etc.)
            $recentActivities = UserActivity::with('user')
                ->whereIn('activity_type', ['login', 'logout', 'registration'])
                ->latest()
                ->take(5)
                ->get();

            $recentActivity = $recentActivities->map(function ($activity) {
                $browser = $activity->metadata['browser'] ?? 'Unknown';
                $platform = $activity->metadata['platform'] ?? 'Unknown';
                
                $actionDescription = match($activity->activity_type) {
                    'login' => "Logged in via {$browser} on {$platform}",
                    'logout' => "Logged out from {$browser} on {$platform}",
                    'registration' => "Account created via {$browser} on {$platform}",
                    default => $activity->description,
                };

                return [
                    'id' => $activity->id,
                    'name' => $activity->user->name,
                    'email' => $activity->user->email,
                    'role' => $activity->user->role,
                    'action' => $actionDescription,
                    'activity_type' => $activity->activity_type,
                    'ip_address' => $activity->ip_address,
                    'created_at' => $activity->created_at->toISOString(),
                ];
            });

            // Debug: Log the data being passed
            Log::info('Dashboard metrics:', $metrics);
            Log::info('Dashboard recent activity:', $recentActivity->toArray());

            return Inertia::render('admin/dashboard', [
                'metrics' => $metrics,
                'recent_activity' => $recentActivity->toArray(),
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            
            // Return with fallback data
            return Inertia::render('admin/dashboard', [
                'metrics' => [
                    'total_users' => 0,
                    'active_users' => 0,
                    'users_by_role' => [],
                    'recent_login_count' => 0,
                ],
                'recent_activity' => [],
            ]);
        }
    }
}