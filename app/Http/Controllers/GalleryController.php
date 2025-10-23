<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\Contact;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index(Request $request): Response
    {
        try {
            // Extended contact cache
            $contact = cache()->remember('contact_simple', 600, function () {
                return Contact::orderBy('created_at', 'desc')->first();
            });

            // For non-search requests, use aggressive cache
            if (!$request->filled('search') && (!$request->filled('page') || $request->page == 1)) {
                $galleries = cache()->remember('gallery_optimized', 600, function () {
                    return Gallery::with(['items' => function ($query) {
                        $query->orderBy('sort_order');
                    }])
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('created_at', 'desc')
                        ->paginate(12);
                });
            } else {
                // For search requests, simplified query
                $query = Gallery::with(['items' => function ($query) {
                    $query->orderBy('sort_order');
                }])
                    ->published()
                    ->orderBy('sort_order')
                    ->orderBy('created_at', 'desc');

                if ($request->filled('search')) {
                    $search = strtolower($request->search);
                    $query->where(function ($q) use ($search) {
                        $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                          ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
                    });
                }

                $galleries = $query->paginate(12)->withQueryString();
            }

            return Inertia::render('gallery', [
                'galleries' => $galleries,
                'filters' => $request->only(['search']),
                'contact' => $contact,
            ]);
        } catch (\Exception $e) {
            logger('Gallery error: ' . $e->getMessage());
            return Inertia::render('gallery', [
                'galleries' => [],
                'filters' => $request->only(['search']),
                'contact' => null,
            ]);
        }
    }

    public function show(string $slug): Response
    {
        // Cache gallery data
        $gallery = cache()->remember("gallery_{$slug}", 600, function () use ($slug) {
            return Gallery::where('slug', $slug)
                ->published()
                ->with(['items' => function ($query) {
                    $query->orderBy('sort_order')->orderBy('created_at');
                }])
                ->firstOrFail();
        });

        // Cache contact data
        $contact = cache()->remember('footer_contact', 600, function () {
            return Contact::orderBy('created_at', 'desc')->first();
        });

        // Cache other galleries
        $otherGalleries = cache()->remember("gallery_others_{$gallery->id}", 600, function () use ($gallery) {
            return Gallery::where('id', '!=', $gallery->id)
                ->published()
                ->with(['items' => function ($query) {
                    $query->orderBy('sort_order')->orderBy('created_at');
                }])
                ->orderBy('created_at', 'desc')
                ->limit(6)
                ->get();
        });

        return Inertia::render('gallery-detail', [
            'gallery' => $gallery,
            'otherGalleries' => $otherGalleries,
            'contact' => $contact,
        ]);
    }
}