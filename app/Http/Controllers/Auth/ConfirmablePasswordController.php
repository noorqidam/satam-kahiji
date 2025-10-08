<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ConfirmablePasswordController extends Controller
{
    /**
     * Show the confirm password page.
     */
    public function show(): Response
    {
        return Inertia::render('auth/confirm-password');
    }

    /**
     * Confirm the user's password.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        $request->session()->put('auth.password_confirmed_at', time());

        $user = Auth::user();
        $route = match ($user->role ?? 'super_admin') {
            'super_admin' => route('admin.dashboard', absolute: false),
            'headmaster' => route('headmaster.dashboard', absolute: false),
            'teacher' => route('teacher.dashboard', absolute: false),
            'humas', 'tu', 'deputy_headmaster' => route('staff.dashboard', absolute: false),
            default => route('admin.dashboard', absolute: false),
        };
        
        return redirect()->intended($route);
    }
}
