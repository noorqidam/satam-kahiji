<?php

namespace App\Http\Controllers;

use App\Models\Extracurricular;
use App\Models\Contact;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class ExtracurricularController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Extracurricular::query()
            ->orderBy('name');

        // Search functionality with case-insensitive matching
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
            });
        }

        $extracurriculars = $query->paginate(12)->withQueryString();

        // Get contact info for footer
        $contact = Contact::orderBy('created_at', 'desc')->first();

        return Inertia::render('extracurricular', [
            'extracurriculars' => $extracurriculars,
            'filters' => $request->only(['search']),
            'contact' => $contact,
        ]);
    }
}