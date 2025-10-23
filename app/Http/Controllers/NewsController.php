<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Contact;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Post::with('user:id,name')
            ->published()
            ->orderBy('created_at', 'desc');

        // Filter by category if specified
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $posts = $query->paginate(12)->withQueryString();

        // Extended contact cache
        $contact = cache()->remember('contact_simple', 600, function () {
            return Contact::orderBy('created_at', 'desc')->first();
        });

        return Inertia::render('news', [
            'posts' => $posts,
            'filters' => $request->only(['category', 'search']),
            'contact' => $contact,
        ]);
    }

    public function show(string $slug): Response
    {
        $post = Post::where('slug', $slug)
            ->published()
            ->with('user:id,name')
            ->firstOrFail();

        // Extended contact cache
        $contact = cache()->remember('contact_simple', 600, function () {
            return Contact::orderBy('created_at', 'desc')->first();
        });

        // Get related posts (same category, excluding current post)
        $relatedPosts = Post::where('category', $post->category)
            ->where('id', '!=', $post->id)
            ->published()
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        return Inertia::render('news-detail', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
            'contact' => $contact,
        ]);
    }
}