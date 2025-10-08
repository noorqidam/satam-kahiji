<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Symfony\Component\HttpFoundation\Response;

class HandleLargeUploads
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Set PHP upload limits for file upload routes
        if ($request->is('admin/work-items/upload-file')) {
            ini_set('upload_max_filesize', '10M');
            ini_set('post_max_size', '15M');
            ini_set('max_execution_time', '300');
        }

        try {
            return $next($request);
        } catch (PostTooLargeException $e) {
            return response()->json([
                'error' => 'File too large. Maximum file size is 10MB.',
                'message' => 'The uploaded file exceeds the maximum allowed size.'
            ], 413);
        }
    }
}