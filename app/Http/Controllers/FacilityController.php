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
        try {
            $search = $request->get('search', '');
            
            // For non-search requests, use aggressive cache
            if (empty($search)) {
                $facilities = cache()->remember('facilities_optimized', 600, function () {
                    return Facility::select(['id', 'name', 'description', 'photo', 'metadata'])
                        ->orderBy('name')
                        ->get();
                });
            } else {
                // For search requests, optimized query
                $facilities = Facility::select(['id', 'name', 'description', 'photo', 'metadata'])
                    ->where(function ($q) use ($search) {
                        $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%'])
                          ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($search) . '%']);
                    })
                    ->orderBy('name')
                    ->get();
            }

            return Inertia::render('facilities', [
                'facilities' => $facilities,
                'filters' => [
                    'search' => $search,
                ],
            ]);
        } catch (\Exception $e) {
            logger('Facilities error: ' . $e->getMessage());
            return Inertia::render('facilities', [
                'facilities' => [],
                'filters' => ['search' => $search ?? ''],
            ]);
        }
    }
}