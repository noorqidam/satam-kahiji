<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:super_admin,headmaster,teacher,humas,tu,deputy_headmaster',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        event(new Registered($user));

        // Log the registration activity
        UserActivity::log(
            $user, 
            'registration', 
            "User account created from {$request->ip()}"
        );

        Auth::login($user);

        return $this->redirectBasedOnRole($user);
    }

    /**
     * Redirect user based on their role after registration.
     */
    protected function redirectBasedOnRole(User $user): RedirectResponse
    {
        return match ($user->role) {
            'super_admin' => redirect()->intended(route('admin.dashboard', absolute: false)),
            'headmaster' => redirect()->intended(route('headmaster.dashboard', absolute: false)),
            'teacher' => redirect()->intended(route('teacher.dashboard', absolute: false)),
            'humas', 'tu', 'deputy_headmaster' => redirect()->intended(route('staff.dashboard', absolute: false)),
            default => redirect()->intended(route('dashboard', absolute: false)),
        };
    }
}
