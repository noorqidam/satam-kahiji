<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class ResponseCache
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only cache GET requests for public routes
        if ($request->method() !== 'GET' || $request->user()) {
            return $next($request);
        }

        // Skip caching for requests with query parameters (search, filters, etc.)
        if (!empty($request->query())) {
            return $next($request);
        }

        // Create cache key based on URL
        $cacheKey = 'response_cache:' . md5($request->getRequestUri());

        // Try to get cached response
        $cachedResponse = Cache::get($cacheKey);
        if ($cachedResponse) {
            return response($cachedResponse['content'])
                ->header('Content-Type', $cachedResponse['content_type'])
                ->header('X-Cache', 'HIT');
        }

        // Process request
        $response = $next($request);

        // Cache successful responses for public pages
        if ($response->getStatusCode() === 200 && $this->shouldCache($request)) {
            $content = $response->getContent();
            $contentType = $response->headers->get('Content-Type', 'text/html');
            
            Cache::put($cacheKey, [
                'content' => $content,
                'content_type' => $contentType,
            ], 300); // Cache for 5 minutes
            
            $response->header('X-Cache', 'MISS');
        }

        return $response;
    }

    /**
     * Determine if the request should be cached
     */
    private function shouldCache(Request $request): bool
    {
        $cacheable_routes = [
            '/',
            '/news',
            '/gallery',
            '/facilities', 
            '/teachers',
            '/principal',
            '/about'
        ];

        return in_array($request->getPathInfo(), $cacheable_routes);
    }
}
