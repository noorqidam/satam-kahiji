<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get locale from session, falling back to app default
        $locale = Session::get('locale', config('app.locale', 'en'));
        
        // Validate that the locale is supported
        $supportedLocales = ['en', 'id'];
        if (!in_array($locale, $supportedLocales)) {
            $locale = config('app.locale', 'en');
        }
        
        // Set Laravel application locale
        App::setLocale($locale);
        
        // Debug logging for every request (you can remove this later)
        \Log::info('SetLocale middleware', [
            'session_locale' => Session::get('locale'),
            'resolved_locale' => $locale,
            'app_locale' => App::getLocale(),
            'url' => $request->url()
        ]);
        
        return $next($request);
    }
}