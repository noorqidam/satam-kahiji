<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();
        $route = match ($user->role ?? 'super_admin') {
            'super_admin' => route('admin.dashboard', absolute: false),
            'headmaster' => route('headmaster.dashboard', absolute: false),
            'teacher' => route('teacher.dashboard', absolute: false),
            'humas', 'tu', 'deputy_headmaster' => route('staff.dashboard', absolute: false),
            default => route('admin.dashboard', absolute: false),
        };

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended($route.'?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            event(new Verified($user));
        }

        return redirect()->intended($route.'?verified=1');
    }
}
