<?php

namespace App\Http\Controllers\Admin;

use App\Events\ContentUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Models\Page;
use App\Services\PageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        private PageService $pageService
    ) {}

    /**
     * Display a listing of pages.
     */
    public function index(Request $request): Response
    {
        try {
            $filters = [
                'search' => $request->get('search', ''),
                'has_image' => $request->get('has_image', ''),
                'order' => $request->get('order', 'created_desc'),
            ];

            $pages = $this->pageService->getPaginatedPages($filters, 15);
            $stats = $this->pageService->getPageStats();

            return Inertia::render('admin/pages/index', [
                'pages' => $pages,
                'filters' => $filters,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load pages index', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return Inertia::render('admin/pages/index', [
                'pages' => [],
                'filters' => $request->only(['search']),
                'stats' => ['total_pages' => 0, 'pages_with_images' => 0],
            ])->with('error', 'Failed to load pages.');
        }
    }

    /**
     * Show the form for creating a new page.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('admin/pages/create');
        } catch (\Exception $e) {
            Log::error('Failed to load page creation form', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return redirect()->route('admin.pages.index')
                ->with('error', 'Failed to load page creation form.');
        }
    }

    /**
     * Store a newly created page.
     */
    public function store(StorePageRequest $request): RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            try {
                $validatedData = $request->validated();
                $image = $request->hasFile('image') ? $request->file('image') : null;
                
                $page = $this->pageService->createPage(
                    $validatedData,
                    $image,
                    $request->user()->getKey()
                );

                // Clear relevant caches
                $this->clearPageCaches();

                // Broadcast content update event
                ContentUpdated::dispatch('page', 'created', $page->id, $page->title);

                return redirect()->route('admin.pages.index')
                    ->with('success', 'Page created successfully.');
            } catch (\InvalidArgumentException $e) {
                return back()
                    ->withInput()
                    ->with('error', $e->getMessage());
            } catch (\Exception $e) {
                Log::error('Failed to create page', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => $request->user()->getKey(),
                ]);

                return back()
                    ->withInput()
                    ->with('error', 'Failed to create page. Please try again.');
            }
        });
    }

    /**
     * Display the specified page.
     */
    public function show(Page $page): Response|RedirectResponse
    {
        try {
            return Inertia::render('admin/pages/show', [
                'page' => $page,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to display page', [
                'page_id' => $page->getKey(),
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return redirect()->route('admin.pages.index')
                ->with('error', 'Failed to display page.');
        }
    }

    /**
     * Show the form for editing the specified page.
     */
    public function edit(Page $page): Response|RedirectResponse
    {
        try {
            return Inertia::render('admin/pages/edit', [
                'page' => $page,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load page edit form', [
                'page_id' => $page->getKey(),
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return redirect()->route('admin.pages.index')
                ->with('error', 'Failed to load page edit form.');
        }
    }

    /**
     * Update the specified page.
     */
    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        return DB::transaction(function () use ($request, $page) {
            try {
                $validatedData = $request->validated();
                $image = $request->hasFile('image') ? $request->file('image') : null;
                $removeImage = $request->boolean('remove_image');
                
                // Remove the remove_image flag from data to be saved
                unset($validatedData['remove_image']);
                
                $this->pageService->updatePage(
                    $page,
                    $validatedData,
                    $image,
                    $removeImage,
                    $request->user()->getKey()
                );

                // Clear relevant caches
                $this->clearPageCaches();

                // Broadcast content update event
                ContentUpdated::dispatch('page', 'updated', $page->id, $page->title);

                return redirect()->route('admin.pages.index')
                    ->with('success', 'Page updated successfully.');
            } catch (\InvalidArgumentException $e) {
                return back()
                    ->withInput()
                    ->with('error', $e->getMessage());
            } catch (\Exception $e) {
                Log::error('Failed to update page', [
                    'page_id' => $page->getKey(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => $request->user()->getKey(),
                ]);

                return back()
                    ->withInput()
                    ->with('error', 'Failed to update page. Please try again.');
            }
        });
    }

    /**
     * Remove the specified page.
     */
    public function destroy(Page $page): RedirectResponse
    {
        return DB::transaction(function () use ($page) {
            try {
                // Store page info before deletion
                $pageId = $page->id;
                $pageTitle = $page->title;
                
                $this->pageService->deletePage($page, Auth::id());

                // Clear relevant caches
                $this->clearPageCaches();

                // Broadcast content update event
                ContentUpdated::dispatch('page', 'deleted', $pageId, $pageTitle);

                return redirect()->route('admin.pages.index')
                    ->with('success', 'Page deleted successfully.');
            } catch (\Exception $e) {
                Log::error('Failed to delete page', [
                    'page_id' => $page->getKey(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                ]);

                return back()
                    ->with('error', 'Failed to delete page. Please try again.');
            }
        });
    }

    /**
     * Clear caches that depend on page data
     */
    private function clearPageCaches(): void
    {
        // Clear application caches that might contain page data
        Cache::forget('home_optimized');
        Cache::forget('pages_optimized');
        Cache::forget('contact_simple');
        Cache::forget('footer_contact');
        
        // Clear response cache for relevant routes
        $this->clearResponseCache([
            '/',
            '/about',
            '/contact',
            '/terms',
            '/privacy',
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