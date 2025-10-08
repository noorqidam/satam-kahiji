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
        $query = Gallery::with(['items' => function ($query) {
            $query->orderBy('sort_order');
        }])
            ->published()
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc');

        // Search functionality with case-insensitive matching
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
            });
        }

        $galleries = $query->paginate(12)->withQueryString();

        // Get contact info for footer
        $contact = Contact::orderBy('created_at', 'desc')->first();

        return Inertia::render('gallery', [
            'galleries' => $galleries,
            'filters' => $request->only(['search']),
            'contact' => $contact,
        ]);
    }

    public function show(string $slug): Response
    {
        $gallery = Gallery::where('slug', $slug)
            ->published()
            ->with(['items' => function ($query) {
                $query->orderBy('sort_order')->orderBy('created_at');
            }])
            ->firstOrFail();

        // Get contact info for footer
        $contact = Contact::orderBy('created_at', 'desc')->first();

        // Get other galleries for suggestions
        $otherGalleries = Gallery::where('id', '!=', $gallery->id)
            ->published()
            ->with(['items' => function ($query) {
                $query->orderBy('sort_order')->orderBy('created_at');
            }])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        return Inertia::render('gallery-detail', [
            'gallery' => $gallery,
            'otherGalleries' => $otherGalleries,
            'contact' => $contact,
        ]);
    }
}