<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    /**
     * Display a listing of facilities for public view.
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search', '');
        
        $query = Facility::select(['id', 'name', 'description', 'photo', 'metadata']);
        
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }
        
        $facilities = $query->orderBy('name')->get();

        return Inertia::render('facilities', [
            'facilities' => $facilities,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}