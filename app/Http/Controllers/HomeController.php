<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Gallery;
use App\Models\Extracurricular;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        try {
            // Extended 10-minute cache for homepage data
            $data = cache()->remember('home_optimized', 600, function () {
                // Get the 3 most recent published news posts - optimized query
                $featuredNews = Post::with('user:id,name')
                    ->where('is_published', true)
                    ->where('category', ['news','announcements'])
                    ->orderBy('created_at', 'desc')
                    ->select(['id', 'title', 'slug', 'excerpt', 'image', 'created_at', 'user_id'])
                    ->take(3)
                    ->get();

                // Get 6 most recent published posts - optimized query
                $latestNews = Post::with('user:id,name')
                    ->where('is_published', true)
                    ->whereIn('category', ['news', 'announcements'])
                    ->orderBy('created_at', 'desc')
                    ->select(['id', 'title', 'slug', 'excerpt', 'image', 'created_at', 'user_id'])
                    ->take(6)
                    ->get();

                // Get published galleries - simplified query to avoid missing attributes
                $galleries = Gallery::published()
                    ->with(['featuredItems' => function ($query) {
                        $query->orderBy('sort_order');
                    }])
                    ->orderBy('sort_order')
                    ->take(6)
                    ->get();

                // Get extracurricular activities - already optimized
                $extracurriculars = Extracurricular::select('id', 'name', 'description', 'photo')
                    ->orderBy('name')
                    ->take(6)
                    ->get();

                return [
                    'featuredNews' => $featuredNews,
                    'latestNews' => $latestNews,
                    'galleries' => $galleries,
                    'extracurriculars' => $extracurriculars,
                ];
            });

            return Inertia::render('home', $data);
        } catch (\Exception $e) {
            // Fallback jika ada error
            logger('Homepage error: ' . $e->getMessage());
            return Inertia::render('home', [
                'featuredNews' => [],
                'latestNews' => [],
                'galleries' => [],
                'extracurriculars' => [],
            ]);
        }
    }
}
