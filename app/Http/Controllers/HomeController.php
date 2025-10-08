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
        // Get the 3 most recent published news posts
        $featuredNews = Post::with('user:id,name')
            ->where('is_published', true)
            ->where('category', ['news','announcements'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        // Get 6 most recent published posts (both news and announcements) for Latest News section
        $latestNews = Post::with('user:id,name')
            ->where('is_published', true)
            ->whereIn('category', ['news', 'announcements']) // Retrieve both news and announcements
            ->orderBy('created_at', 'desc') // Order by creation date (newest first)
            ->take(6)
            ->get();


        // Get published galleries with their featured items for gallery section
        $galleries = Gallery::published()
            ->with(['featuredItems' => function ($query) {
                $query->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->take(6)
            ->get();

        // Get extracurricular activities to display on landing page
        $extracurriculars = Extracurricular::select('id', 'name', 'description', 'photo')
            ->orderBy('name')
            ->take(6)
            ->get();

        return Inertia::render('home', [
            'featuredNews' => $featuredNews,
            'latestNews' => $latestNews,
            'galleries' => $galleries,
            'extracurriculars' => $extracurriculars,
        ]);
    }
}
