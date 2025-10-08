<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RequiredPasswordResetController extends Controller
{
    /**
     * Show the required password reset form.
     */
    public function show(): Response
    {
        return Inertia::render('auth/required-password-reset');
    }

    /**
     * Handle the required password reset.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'The current password is incorrect.',
            ]);
        }

        // Update password and mark email as verified (completing the reset process)
        $user->update([
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
        ]);

        // Regenerate session
        $request->session()->regenerate();

        // Redirect based on user role after password reset
        return $this->redirectBasedOnRole($user)->with('success', 'Password has been updated successfully.');
    }

    /**
     * Redirect user based on their role after password reset.
     */
    protected function redirectBasedOnRole($user): RedirectResponse
    {
        return match ($user->role) {
            'super_admin' => redirect()->route('admin.dashboard'),
            'headmaster' => redirect()->route('headmaster.dashboard'),
            'teacher' => redirect()->route('teacher.dashboard'),
            'humas', 'tu', 'deputy_headmaster' => redirect()->route('staff.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }
}