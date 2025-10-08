<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\UserActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('admin.password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Log the login activity
        UserActivity::log(
            $user, 
            'login', 
            "User logged in from {$request->ip()}"
        );

        return $this->redirectBasedOnRole($user);
    }

    /**
     * Redirect user based on their role after login.
     */
    protected function redirectBasedOnRole($user): RedirectResponse
    {
        return match ($user->role) {
            'super_admin' => redirect()->intended(route('admin.dashboard', absolute: false)),
            'headmaster' => redirect()->intended(route('headmaster.dashboard', absolute: false)),
            'teacher' => redirect()->intended(route('teacher.dashboard', absolute: false)),
            'humas', 'tu', 'deputy_headmaster' => redirect()->intended(route('staff.dashboard', absolute: false)),
            default => redirect()->intended(route('admin.dashboard', absolute: false)),
        };
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Log the logout activity before logging out
        if ($user) {
            UserActivity::log(
                $user, 
                'logout', 
                "User logged out from {$request->ip()}"
            );
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
