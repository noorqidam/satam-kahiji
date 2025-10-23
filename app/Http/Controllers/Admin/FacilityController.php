<?php

namespace App\Http\Controllers\Admin;

use App\Events\ContentUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFacilityRequest;
use App\Http\Requests\Admin\UpdateFacilityRequest;
use App\Models\Facility;
use App\Services\FacilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function __construct(
        private FacilityService $facilityService
    ) {}

    /**
     * Display a listing of facilities.
     */
    public function index(Request $request): Response
    {
        try {
            $filters = [
                'search' => $request->get('search', ''),
                'has_photo' => $request->get('has_photo', ''),
                'order' => $request->get('order', 'name_asc'),
            ];

            $facilities = $this->facilityService->getPaginatedFacilities($filters, 15);
            $stats = $this->facilityService->getFacilityStats();

            return Inertia::render('admin/facilities/index', [
                'facilities' => $facilities,
                'filters' => $filters,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load facilities index', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return Inertia::render('admin/facilities/index', [
                'facilities' => [],
                'filters' => $request->only(['search']),
                'stats' => ['total_facilities' => 0, 'facilities_with_photos' => 0],
            ])->with('error', 'Failed to load facilities.');
        }
    }

    /**
     * Show the form for creating a new facility.
     */
    public function create(): Response
    {
        try {
            return Inertia::render('admin/facilities/create');
        } catch (\Exception $e) {
            Log::error('Failed to load facility creation form', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return Inertia::render('admin/facilities/create')
                ->with('error', 'Failed to load facility creation form.');
        }
    }

    /**
     * Store a newly created facility.
     */
    public function store(StoreFacilityRequest $request): RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            try {
                $validatedData = $request->validated();
                $image = $request->hasFile('image') ? $request->file('image') : null;
                
                $facility = $this->facilityService->createFacility(
                    $validatedData, 
                    $image, 
                    $request->user()->getKey()
                );

                // Clear relevant caches
                $this->clearFacilityCaches();

                // Broadcast content update event
                ContentUpdated::dispatch('facility', 'created', $facility->id, $facility->name);

                return redirect()->route('admin.facilities.index')
                    ->with('success', 'Facility created successfully.');
            } catch (\Exception $e) {
                Log::error('Failed to create facility', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => $request->user()->getKey(),
                ]);

                return back()
                    ->withInput()
                    ->with('error', 'Failed to create facility. Please try again.');
            }
        });
    }

    /**
     * Display the specified facility.
     */
    public function show(Facility $facility): Response
    {
        try {
            return Inertia::render('admin/facilities/show', [
                'facility' => $facility,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to display facility', [
                'facility_id' => $facility->getKey(),
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return Inertia::render('admin/facilities/show', [
                'facility' => $facility,
            ])->with('error', 'Failed to display facility.');
        }
    }

    /**
     * Show the form for editing the specified facility.
     */
    public function edit(Facility $facility): Response
    {
        try {
            return Inertia::render('admin/facilities/edit', [
                'facility' => $facility,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load facility edit form', [
                'facility_id' => $facility->getKey(),
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return Inertia::render('admin/facilities/edit', [
                'facility' => $facility,
            ])->with('error', 'Failed to load facility edit form.');
        }
    }

    /**
     * Update the specified facility.
     */
    public function update(UpdateFacilityRequest $request, Facility $facility): RedirectResponse
    {
        return DB::transaction(function () use ($request, $facility) {
            try {
                $validatedData = $request->validated();
                $image = $request->hasFile('image') ? $request->file('image') : null;
                $removeImage = $request->boolean('remove_image');
                
                $this->facilityService->updateFacility(
                    $facility,
                    $validatedData,
                    $image,
                    $removeImage,
                    $request->user()->getKey()
                );

                // Clear relevant caches
                $this->clearFacilityCaches();

                // Broadcast content update event
                ContentUpdated::dispatch('facility', 'updated', $facility->id, $facility->name);

                return redirect()->route('admin.facilities.index')
                    ->with('success', 'Facility updated successfully.');
            } catch (\Exception $e) {
                Log::error('Failed to update facility', [
                    'facility_id' => $facility->getKey(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => $request->user()->getKey(),
                ]);

                return back()
                    ->withInput()
                    ->with('error', 'Failed to update facility. Please try again.');
            }
        });
    }

    /**
     * Remove the specified facility.
     */
    public function destroy(Facility $facility): RedirectResponse
    {
        return DB::transaction(function () use ($facility) {
            try {
                // Store facility info before deletion
                $facilityId = $facility->id;
                $facilityName = $facility->name;
                
                $this->facilityService->deleteFacility($facility, Auth::id());

                // Clear relevant caches
                $this->clearFacilityCaches();

                // Broadcast content update event
                ContentUpdated::dispatch('facility', 'deleted', $facilityId, $facilityName);

                return redirect()->route('admin.facilities.index')
                    ->with('success', 'Facility deleted successfully.');
            } catch (\Exception $e) {
                Log::error('Failed to delete facility', [
                    'facility_id' => $facility->getKey(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                ]);

                return back()
                    ->with('error', 'Failed to delete facility. Please try again.');
            }
        });
    }

    /**
     * Clear caches that depend on facility data
     */
    private function clearFacilityCaches(): void
    {
        // Clear application caches that might contain facility data
        Cache::forget('home_optimized');
        Cache::forget('facilities_optimized');
        Cache::forget('contact_simple');
        Cache::forget('footer_contact');
        
        // Clear response cache for relevant routes
        $this->clearResponseCache([
            '/',
            '/facilities',
            '/about',
        ]);
    }

    /**
     * Clear response cache for specific routes
     */
    private function clearResponseCache(array $routes): void
    {
        // The ResponseCache middleware uses cache keys based on request URI
        // We need to clear the cache for each route
        foreach ($routes as $route) {
            $cacheKey = 'response_cache:' . md5($route);
            Cache::forget($cacheKey);
        }
    }
}