<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only compress if client supports it
        $acceptEncoding = $request->header('Accept-Encoding', '');
        
        // Check if response is compressible
        $contentType = $response->headers->get('Content-Type', '');
        $compressibleTypes = [
            'text/html',
            'text/css',
            'text/javascript',
            'application/javascript',
            'application/json',
            'application/xml',
            'text/xml',
            'image/svg+xml'
        ];

        $isCompressible = false;
        foreach ($compressibleTypes as $type) {
            if (str_contains($contentType, $type)) {
                $isCompressible = true;
                break;
            }
        }

        // Don't compress if already compressed or not compressible
        if (!$isCompressible || 
            $response->headers->has('Content-Encoding') ||
            $response->getContent() === false ||
            strlen($response->getContent()) < 1024) {
            return $response;
        }

        // Prefer Brotli over Gzip
        if (str_contains($acceptEncoding, 'br') && function_exists('brotli_compress')) {
            $compressed = brotli_compress($response->getContent(), 11, BROTLI_TEXT);
            if ($compressed !== false) {
                $response->setContent($compressed);
                $response->headers->set('Content-Encoding', 'br');
                $response->headers->set('Vary', 'Accept-Encoding');
            }
        } elseif (str_contains($acceptEncoding, 'gzip')) {
            $compressed = gzencode($response->getContent(), 9);
            if ($compressed !== false) {
                $response->setContent($compressed);
                $response->headers->set('Content-Encoding', 'gzip');
                $response->headers->set('Vary', 'Accept-Encoding');
            }
        }

        return $response;
    }
}
