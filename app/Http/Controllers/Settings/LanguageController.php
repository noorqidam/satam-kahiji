<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class LanguageController extends Controller
{
    /**
     * Display the language settings form.
     */
    public function edit(Request $request): Response
    {
        $currentLanguage = Session::get('locale', config('app.locale', 'en'));

        return Inertia::render('settings/language', [
            'currentLanguage' => $currentLanguage,
        ]);
    }

    /**
     * Update the user's language preference.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'language' => ['required', 'string', 'in:en,id'],
        ]);

        // Store language preference in session
        Session::put('locale', $request->language);
        
        // Debug logging
        \Log::info('Language updated', [
            'language' => $request->language,
            'session_locale' => Session::get('locale'),
            'app_locale' => app()->getLocale()
        ]);

        return redirect()->back()->with('status', 'language-updated');
    }
}