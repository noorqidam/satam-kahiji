<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            $user = $request->user();
            $route = match ($user->role ?? 'super_admin') {
                'super_admin' => route('admin.dashboard', absolute: false),
                'headmaster' => route('headmaster.dashboard', absolute: false),
                'teacher' => route('teacher.dashboard', absolute: false),
                'humas', 'tu', 'deputy_headmaster' => route('staff.dashboard', absolute: false),
                default => route('admin.dashboard', absolute: false),
            };
            return redirect()->intended($route);
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
