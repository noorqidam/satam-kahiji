<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetAssetMimeTypes
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Only apply to build assets
        if (str_starts_with($request->getPathInfo(), '/build/')) {
            $extension = pathinfo($request->getPathInfo(), PATHINFO_EXTENSION);
            
            switch ($extension) {
                case 'js':
                    $response->headers->set('Content-Type', 'application/javascript; charset=utf-8');
                    // Ensure proper module script handling
                    $response->headers->set('X-Content-Type-Options', 'nosniff');
                    break;
                case 'mjs':
                    $response->headers->set('Content-Type', 'application/javascript; charset=utf-8');
                    $response->headers->set('X-Content-Type-Options', 'nosniff');
                    break;
                case 'css':
                    $response->headers->set('Content-Type', 'text/css; charset=utf-8');
                    break;
                case 'wasm':
                    $response->headers->set('Content-Type', 'application/wasm');
                    break;
            }
            
            // Add cache headers for better performance
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
        }
        
        return $response;
    }
}
