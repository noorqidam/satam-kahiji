<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Contact;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug): Response
    {
        // Extended contact cache
        $contact = cache()->remember('contact_simple', 600, function () {
            return Contact::orderBy('created_at', 'desc')->first();
        });
        
        // For about-related pages, render the About component with database content
        if (in_array($slug, ['about', 'tentang-kami', 'about-us'])) {
            $page = Page::where('slug', $slug)->firstOrFail();
            
            return Inertia::render('about', [
                'page' => $page,
                'contact' => $contact
            ]);
        }

        // For other pages, find the page by slug and render generic page view
        $page = Page::where('slug', $slug)->firstOrFail();
        
        return Inertia::render('Page', [
            'page' => $page,
            'contact' => $contact
        ]);
    }
}