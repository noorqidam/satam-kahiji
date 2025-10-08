<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
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
        
        return Inertia::render('auth/verify-email', ['status' => $request->session()->get('status')]);
    }
}
