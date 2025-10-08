<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SystemActivityController extends Controller
{
    /**
     * Display system activities with pagination
     */
    public function index(Request $request): Response
    {
        $activities = UserActivity::with('user')
            ->whereIn('activity_type', ['login', 'logout', 'registration'])
            ->latest()
            ->get(); // Get all activities, pagination handled on frontend

        $activitiesData = $activities->map(function ($activity) {
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

        return Inertia::render('admin/system-activity', [
            'activities' => $activitiesData,
        ]);
    }

    /**
     * Remove multiple activities from storage.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'activity_ids' => 'required|array',
            'activity_ids.*' => 'integer',
        ]);

        try {
            // Only delete activities that actually exist
            $existingIds = UserActivity::whereIn('id', $request->activity_ids)->pluck('id');
            
            if ($existingIds->isEmpty()) {
                return redirect()->back()
                    ->with('error', 'No activities found to delete. They may have already been removed.');
            }
            
            $deletedCount = UserActivity::whereIn('id', $existingIds)->delete();

            return redirect()->back()
                ->with('success', "Successfully deleted {$deletedCount} system activities.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'An error occurred while deleting activities.');
        }
    }
}