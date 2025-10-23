<?php

namespace App\Http\Controllers\Admin;

use App\Events\ContentUpdated;
use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Services\GalleryDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    protected $galleryDriveService;

    public function __construct(GalleryDriveService $galleryDriveService)
    {
        $this->galleryDriveService = $galleryDriveService;
    }
    public function index(Request $request): Response
    {
        $query = Gallery::withCount('items')
            ->orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'desc');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by published status
        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->where('is_published', true);
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            }
        }

        $galleries = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/galleries/index', [
            'galleries' => $galleries,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/galleries/create');
    }

    public function store(Request $request)
    {
        // Log incoming request data for debugging
        Log::info('Gallery store request received', [
            'request_data' => $request->all(),
            'has_items' => $request->has('items'),
            'items_count' => is_array($request->input('items')) ? count($request->input('items')) : 0,
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'featured_image' => 'nullable|string|max:500', // Google Drive URL
            'is_published' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
            'items' => 'nullable|array',
            'items.*.id' => 'nullable|string', // Allow ID for existing items (used in updates)
            'items.*.title' => 'nullable|string|max:255',
            'items.*.caption' => 'nullable|string',
            'items.*.mime_type' => 'nullable|string',
            'items.*.file_path' => 'nullable|string|max:500',
            'items.*.is_featured' => 'boolean',
            'items.*.sort_order' => 'nullable|integer|min:0',
            'items.*.metadata' => 'nullable|array',
            'items.*.old_file_path' => 'nullable|string|max:500', // For tracking replaced images
        ]);

        // Generate slug from title
        $validated['slug'] = Str::slug($validated['title']);
        
        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Gallery::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Set default sort order if not provided
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = Gallery::max('sort_order') + 1 ?? 0;
        }

        // Create gallery
        $galleryData = collect($validated)->except(['items'])->toArray();
        $gallery = Gallery::create($galleryData);

        // Clear relevant caches
        $this->clearGalleryCaches();

        // Broadcast content update event
        ContentUpdated::dispatch('gallery', 'created', $gallery->id, $gallery->title);

        // Note: Google Drive folder creation is handled dynamically by PhotoHandler when needed

        // Create gallery items if provided
        if (!empty($validated['items'])) {
            Log::info('Creating gallery items', [
                'gallery_id' => $gallery->id,
                'items_count' => count($validated['items']),
                'items_data' => $validated['items'],
            ]);

            foreach ($validated['items'] as $index => $itemData) {
                $itemData['gallery_id'] = $gallery->id;
                
                // Validate that we're not saving blob URLs to database
                $filePath = $itemData['file_path'] ?? null;
                if ($filePath && str_starts_with($filePath, 'blob:')) {
                    Log::error('Attempted to create gallery item with blob URL in store method', [
                        'gallery_id' => $gallery->id,
                        'blob_url' => $filePath,
                        'item_data' => $itemData
                    ]);
                    throw new \InvalidArgumentException('Cannot save blob URLs to database. File must be uploaded to Google Drive first.');
                }
                
                // Set default sort order for item if not provided
                if (!isset($itemData['sort_order'])) {
                    $itemData['sort_order'] = $gallery->items()->max('sort_order') + 1 ?? 0;
                }
                
                Log::info("Creating gallery item {$index}", $itemData);
                
                $createdItem = $gallery->items()->create(collect($itemData)->except(['old_file_path'])->toArray());
                
                Log::info("Gallery item created", [
                    'item_id' => $createdItem->id,
                    'title' => $createdItem->title,
                    'file_path' => $createdItem->file_path,
                ]);
            }
        } else {
            Log::info('No gallery items to create', [
                'gallery_id' => $gallery->id,
                'validated_items' => $validated['items'] ?? 'not_set',
            ]);
        }

        $itemCount = count($validated['items'] ?? []);
        $message = $itemCount > 0 
            ? "Gallery created successfully with {$itemCount} items."
            : 'Gallery created successfully.';

        // Return JSON for AJAX requests with gallery data, otherwise redirect
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'gallery' => $gallery->fresh(), // Fresh instance with all data
            ]);
        }

        // Redirect to edit page so user can easily add featured image and manage items
        return redirect()->route('admin.galleries.edit', $gallery->id)
            ->with('success', $message);
    }

    public function show(Gallery $gallery): Response
    {
        $gallery->load(['items' => function ($query) {
            $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'asc');
        }]);
        
        return Inertia::render('admin/galleries/show', [
            'gallery' => $gallery,
        ]);
    }

    public function edit(Gallery $gallery): Response
    {
        // Load gallery with its items, ordered by sort_order
        $gallery->load(['items' => function ($query) {
            $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'asc');
        }]);

        Log::info('Gallery edit page loaded', [
            'gallery_id' => $gallery->id,
            'gallery_title' => $gallery->title,
            'items_count' => $gallery->items->count(),
        ]);
        
        return Inertia::render('admin/galleries/edit', [
            'gallery' => $gallery,
        ]);
    }

    public function update(Request $request, Gallery $gallery)
    {
        // Log incoming request data for debugging
        Log::info('Gallery update request received', [
            'gallery_id' => $gallery->id,
            'request_data' => $request->all(),
            'has_items' => $request->has('items'),
            'items_count' => is_array($request->input('items')) ? count($request->input('items')) : 0,
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'featured_image' => 'nullable|string|max:500', // Google Drive URL
            'is_published' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
            'items' => 'nullable|array',
            'items.*.id' => 'nullable|string', // Allow ID for existing items
            'items.*.title' => 'nullable|string|max:255',
            'items.*.caption' => 'nullable|string',
            'items.*.mime_type' => 'nullable|string',
            'items.*.file_path' => 'nullable|string|max:500',
            'items.*.is_featured' => 'boolean',
            'items.*.sort_order' => 'nullable|integer|min:0',
            'items.*.metadata' => 'nullable|array',
            'items.*.old_file_path' => 'nullable|string|max:500', // For tracking replaced images
        ]);

        // Check if featured image was changed or removed
        $oldFeaturedImage = $gallery->featured_image;
        $newFeaturedImage = $validated['featured_image'] ?? null;
        
        // Check if title changed and handle Google Drive folder rename
        $titleChanged = false;
        $oldTitle = $gallery->title;
        if ($gallery->title !== $validated['title']) {
            $titleChanged = true;
            $validated['slug'] = Str::slug($validated['title']);
            
            // Ensure slug is unique (excluding current gallery)
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Gallery::where('slug', $validated['slug'])->where('id', '!=', $gallery->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Get items data before updating (exclude it from gallery update)
        $galleryData = collect($validated)->except(['items'])->toArray();
        $gallery->update($galleryData);

        // Clear relevant caches
        $this->clearGalleryCaches();

        // Broadcast content update event
        ContentUpdated::dispatch('gallery', 'updated', $gallery->id, $gallery->title);

        // Handle Google Drive folder rename if title changed
        if ($titleChanged) {
            try {
                $photoHandler = new \App\Services\PhotoHandler();
                $renameSuccess = $photoHandler->renameGalleryFolder($oldTitle, $validated['title'], $gallery->id);
                if ($renameSuccess) {
                    Log::info('Successfully renamed Google Drive folder for gallery', [
                        'gallery_id' => $gallery->id,
                        'old_title' => $oldTitle,
                        'new_title' => $validated['title']
                    ]);
                } else {
                    Log::warning('Failed to rename Google Drive folder for gallery', [
                        'gallery_id' => $gallery->id,
                        'old_title' => $oldTitle,
                        'new_title' => $validated['title']
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Exception while renaming Google Drive folder: ' . $e->getMessage(), [
                    'gallery_id' => $gallery->id,
                    'old_title' => $oldTitle,
                    'new_title' => $validated['title']
                ]);
            }
        }

        // Handle gallery items updates
        if (isset($validated['items'])) {
            Log::info('Updating gallery items', [
                'gallery_id' => $gallery->id,
                'items_count' => count($validated['items']),
                'items_data' => $validated['items'],
            ]);

            // Get current items for comparison
            $existingItems = $gallery->items()->get()->keyBy('id');
            $submittedItemIds = [];

            foreach ($validated['items'] as $index => $itemData) {
                $itemData['gallery_id'] = $gallery->id;
                
                // Set default sort order for item if not provided
                if (!isset($itemData['sort_order'])) {
                    $itemData['sort_order'] = $index;
                }

                // Check if this is an existing item (has numeric ID) or new item (has string ID like "item_123")
                $itemId = $itemData['id'] ?? null;
                
                if ($itemId && is_numeric($itemId) && $existingItems->has($itemId)) {
                    // This is an existing item - update it
                    $existingItem = $existingItems->get($itemId);
                    
                    // Store original file path before any updates
                    $originalFilePath = $existingItem->file_path;
                    
                    // Check if file_path has changed (image replacement)
                    $newFilePath = $itemData['file_path'] ?? null;
                    $oldFilePathFromFrontend = $itemData['old_file_path'] ?? null;
                    
                    Log::info('Checking for image replacement', [
                        'item_id' => $existingItem->id,
                        'original_file_path' => $originalFilePath,
                        'new_file_path' => $newFilePath,
                        'old_file_path_from_frontend' => $oldFilePathFromFrontend,
                        'paths_different' => $originalFilePath !== $newFilePath,
                        'original_is_google_drive' => $originalFilePath ? (str_contains($originalFilePath, 'googleusercontent.com') || str_contains($originalFilePath, 'drive.google.com')) : false,
                        'new_is_google_drive' => $newFilePath ? (str_contains($newFilePath, 'googleusercontent.com') || str_contains($newFilePath, 'drive.google.com')) : false,
                        'new_is_not_blob' => $newFilePath ? !str_starts_with($newFilePath, 'blob:') : false,
                        'has_old_file_path' => !empty($oldFilePathFromFrontend),
                    ]);
                    
                    // Determine which old file path to use for deletion
                    $filePathToDelete = $oldFilePathFromFrontend ?: $originalFilePath;
                    
                    // Delete old Google Drive file if:
                    // 1. We have an old file path to delete
                    // 2. We have a new file path that's different
                    // 3. The old file is a Google Drive URL 
                    // 4. New is a Google Drive URL (not blob URL)
                    if ($filePathToDelete && $newFilePath && 
                        $filePathToDelete !== $newFilePath &&
                        (str_contains($filePathToDelete, 'googleusercontent.com') || str_contains($filePathToDelete, 'drive.google.com')) &&
                        (str_contains($newFilePath, 'googleusercontent.com') || str_contains($newFilePath, 'drive.google.com')) &&
                        !str_starts_with($newFilePath, 'blob:')) {
                        
                        // Image has been replaced with a new Google Drive file - delete old one
                        try {
                            $photoHandler = new \App\Services\PhotoHandler();
                            $deleteResult = $photoHandler->deletePhoto($filePathToDelete, 'gallery-item');
                            
                            Log::info('Old gallery item image deleted during replacement', [
                                'item_id' => $existingItem->id,
                                'deleted_file_path' => $filePathToDelete,
                                'original_file_path' => $originalFilePath,
                                'old_file_path_from_frontend' => $oldFilePathFromFrontend,
                                'new_file_path' => $newFilePath,
                                'delete_success' => $deleteResult
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Failed to delete old gallery item image during replacement: ' . $e->getMessage(), [
                                'item_id' => $existingItem->id,
                                'deleted_file_path' => $filePathToDelete,
                                'original_file_path' => $originalFilePath,
                                'old_file_path_from_frontend' => $oldFilePathFromFrontend,
                                'new_file_path' => $newFilePath,
                                'exception_trace' => $e->getTraceAsString()
                            ]);
                        }
                    }
                    
                    // Validate that we're not saving blob URLs to database
                    if ($newFilePath && str_starts_with($newFilePath, 'blob:')) {
                        Log::error('Attempted to save blob URL to database', [
                            'item_id' => $existingItem->id,
                            'blob_url' => $newFilePath,
                            'item_data' => $itemData
                        ]);
                        throw new \InvalidArgumentException('Cannot save blob URLs to database. File must be uploaded to Google Drive first.');
                    }
                    
                    // Generate metadata if missing and we have a file_path
                    if (empty($existingItem->metadata) && !empty($existingItem->file_path)) {
                        $metadata = $this->generateMetadataFromUrl($existingItem->file_path, $existingItem->mime_type);
                        $itemData['metadata'] = $metadata;
                    }
                    
                    $existingItem->update(collect($itemData)->except(['id', 'old_file_path'])->toArray());
                    
                    Log::info("Updated existing gallery item", [
                        'item_id' => $existingItem->id,
                        'title' => $existingItem->title,
                        'metadata_added' => !empty($metadata ?? []),
                    ]);
                    
                    $submittedItemIds[] = $itemId;
                } else {
                    // This is a new item - only create if it has a valid file_path and doesn't match existing items
                    $newFilePath = $itemData['file_path'] ?? null;
                    
                    // Skip creating if no file_path or if it's a blob URL (blob URLs should never be saved to database)
                    if (!$newFilePath) {
                        Log::warning("Skipping creation of item without file_path", [
                            'item_data' => $itemData,
                        ]);
                        continue;
                    }
                    
                    if (str_starts_with($newFilePath, 'blob:')) {
                        Log::error("Attempted to create new gallery item with blob URL", [
                            'item_data' => $itemData,
                            'blob_url' => $newFilePath,
                        ]);
                        throw new \InvalidArgumentException('Cannot save blob URLs to database. File must be uploaded to Google Drive first.');
                    }
                    
                    // Check if an item with this exact file_path already exists to prevent duplicates
                    $duplicateExists = $gallery->items()->where('file_path', $newFilePath)->exists();
                    if ($duplicateExists) {
                        Log::warning("Skipping creation of duplicate item", [
                            'file_path' => $newFilePath,
                            'gallery_id' => $gallery->id,
                        ]);
                        continue;
                    }
                    
                    // This is a genuinely new item - create it
                    $createdItem = $gallery->items()->create(collect($itemData)->except(['id'])->toArray());
                    
                    Log::info("Created new gallery item", [
                        'item_id' => $createdItem->id,
                        'title' => $createdItem->title,
                        'file_path' => $createdItem->file_path,
                    ]);
                    
                    $submittedItemIds[] = $createdItem->id;
                }
            }

            // Delete items that were not submitted (removed from the form)
            $itemsToDelete = $existingItems->keys()->diff($submittedItemIds);
            if ($itemsToDelete->count() > 0) {
                // Get the items to delete so we can delete their Google Drive files
                $itemsToDeleteData = $gallery->items()->whereIn('id', $itemsToDelete)->get();
                
                // Delete Google Drive files for each removed item
                $photoHandler = new \App\Services\PhotoHandler();
                foreach ($itemsToDeleteData as $itemToDelete) {
                    try {
                        if ($itemToDelete->file_path) {
                            $photoHandler->deletePhoto($itemToDelete->file_path, 'gallery-item');
                            Log::info("Deleted Google Drive file for gallery item", [
                                'item_id' => $itemToDelete->id,
                                'file_path' => $itemToDelete->file_path,
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::warning("Failed to delete Google Drive file for gallery item {$itemToDelete->id}: " . $e->getMessage());
                    }
                }
                
                // Delete the database records
                $gallery->items()->whereIn('id', $itemsToDelete)->delete();
                Log::info("Deleted removed gallery items", [
                    'deleted_items' => $itemsToDelete->toArray(),
                ]);
            }
        } else {
            Log::info('No gallery items to update', [
                'gallery_id' => $gallery->id,
                'validated_items' => $validated['items'] ?? 'not_set',
            ]);
        }

        // Delete old featured image from Google Drive if it was changed or removed
        if ($oldFeaturedImage && $oldFeaturedImage !== $newFeaturedImage) {
            try {
                $photoHandler = new \App\Services\PhotoHandler();
                $photoHandler->deletePhoto($oldFeaturedImage, 'gallery-featured');
            } catch (\Exception $e) {
                // Log the error but don't fail the update
                Log::warning('Failed to delete old featured image during update: ' . $e->getMessage());
            }
        }

        // Prepare success message
        $itemCount = count($validated['items'] ?? []);
        $message = $itemCount > 0 
            ? "Gallery updated successfully with {$itemCount} items."
            : 'Gallery updated successfully.';

        // Return JSON for AJAX requests, otherwise redirect
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        }
        
        return redirect()->route('admin.galleries.index')
            ->with('success', $message);
    }

    public function destroy(Gallery $gallery)
    {
        $photoHandler = new \App\Services\PhotoHandler();
        
        // Try to delete entire gallery folder from Google Drive first (new structure)
        $folderDeleted = false;
        try {
            $folderDeleted = $photoHandler->deleteGalleryFolder($gallery->title, $gallery->id);
            if ($folderDeleted) {
                Log::info("Successfully deleted entire gallery folder from Google Drive", [
                    'gallery_id' => $gallery->id,
                    'gallery_title' => $gallery->title,
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to delete gallery folder during gallery deletion: ' . $e->getMessage());
        }
        
        // If folder deletion failed or gallery uses old structure, delete individual files
        if (!$folderDeleted) {
            Log::info('Falling back to individual file deletion', [
                'gallery_id' => $gallery->id,
                'gallery_title' => $gallery->title,
            ]);
            
            // Delete featured image from Google Drive if it exists
            if ($gallery->featured_image) {
                try {
                    Log::info("Attempting to delete featured image", [
                        'gallery_id' => $gallery->id,
                        'featured_image_url' => $gallery->featured_image,
                    ]);
                    $result = $photoHandler->deletePhoto($gallery->featured_image, 'gallery-featured');
                    if ($result) {
                        Log::info("Successfully deleted gallery featured image from Google Drive", [
                            'gallery_id' => $gallery->id,
                            'featured_image' => $gallery->featured_image,
                        ]);
                    } else {
                        Log::warning("deletePhoto returned false for featured image", [
                            'gallery_id' => $gallery->id,
                            'featured_image' => $gallery->featured_image,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Exception while deleting featured image: ' . $e->getMessage(), [
                        'gallery_id' => $gallery->id,
                        'featured_image' => $gallery->featured_image,
                        'exception_trace' => $e->getTraceAsString()
                    ]);
                }
            }
            
            // Delete all gallery item files from Google Drive
            $galleryItems = $gallery->items()->get();
            Log::info("Processing gallery items for deletion", [
                'gallery_id' => $gallery->id,
                'items_count' => $galleryItems->count()
            ]);
            
            foreach ($galleryItems as $item) {
                try {
                    if ($item->file_path) {
                        Log::info("Attempting to delete gallery item file", [
                            'gallery_id' => $gallery->id,
                            'item_id' => $item->id,
                            'file_path' => $item->file_path,
                        ]);
                        $result = $photoHandler->deletePhoto($item->file_path, 'gallery-item');
                        if ($result) {
                            Log::info("Successfully deleted gallery item file from Google Drive", [
                                'gallery_id' => $gallery->id,
                                'item_id' => $item->id,
                                'file_path' => $item->file_path,
                            ]);
                        } else {
                            Log::warning("deletePhoto returned false for gallery item", [
                                'gallery_id' => $gallery->id,
                                'item_id' => $item->id,
                                'file_path' => $item->file_path,
                            ]);
                        }
                    } else {
                        Log::info("Gallery item has no file_path, skipping", [
                            'gallery_id' => $gallery->id,
                            'item_id' => $item->id,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error("Exception while deleting gallery item {$item->id}: " . $e->getMessage(), [
                        'gallery_id' => $gallery->id,
                        'item_id' => $item->id,
                        'file_path' => $item->file_path,
                        'exception_trace' => $e->getTraceAsString()
                    ]);
                }
            }
        }
        
        // Delete all gallery items from database
        $gallery->items()->delete();
        
        // Store gallery info before deletion
        $galleryId = $gallery->id;
        $galleryTitle = $gallery->title;
        
        // Delete the gallery itself
        $gallery->delete();

        // Clear relevant caches
        $this->clearGalleryCaches();

        // Broadcast content update event
        ContentUpdated::dispatch('gallery', 'deleted', $galleryId, $galleryTitle);

        return redirect()->route('admin.galleries.index')
            ->with('success', 'Gallery and all its items deleted successfully.');
    }

    public function togglePublish(Gallery $gallery)
    {
        $gallery->update([
            'is_published' => !$gallery->is_published,
        ]);

        // Clear relevant caches
        $this->clearGalleryCaches();

        // Broadcast content update event
        $action = $gallery->is_published ? 'published' : 'unpublished';
        ContentUpdated::dispatch('gallery', $action, $gallery->id, $gallery->title);

        $status = $gallery->is_published ? 'published' : 'unpublished';

        return back()->with('success', "Gallery {$status} successfully.");
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'galleries' => 'required|array',
            'galleries.*.id' => 'required|integer|exists:galleries,id',
            'galleries.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['galleries'] as $galleryData) {
            Gallery::where('id', $galleryData['id'])
                ->update(['sort_order' => $galleryData['sort_order']]);
        }

        return back()->with('success', 'Gallery order updated successfully.');
    }

    /**
     * Get files in a gallery's Google Drive folder
     */
    public function getFiles(Gallery $gallery)
    {
        try {
            $files = $this->galleryDriveService->getGalleryFiles($gallery);
            
            return response()->json([
                'success' => true,
                'files' => $files,
                'gallery_id' => $gallery->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch gallery files',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload a file to gallery's Google Drive folder
     */
    public function uploadFile(Request $request, Gallery $gallery)
    {
        $request->validate([
            'file' => 'required|file|max:20480|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,mkv,webm',
            'custom_name' => 'nullable|string|max:255',
        ]);

        try {
            $file = $request->file('file');
            $customName = $request->get('custom_name');
            
            $result = $this->galleryDriveService->uploadToGallery($gallery, $file, $customName);
            
            return response()->json([
                'success' => true,
                'file' => $result,
                'message' => 'File uploaded successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to upload file',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a file from gallery's Google Drive folder
     */
    public function deleteFile(Request $request, Gallery $gallery)
    {
        $request->validate([
            'file_name' => 'required|string',
        ]);

        try {
            $fileName = $request->get('file_name');
            $success = $this->galleryDriveService->deleteFromGallery($gallery, $fileName);
            
            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'File deleted successfully',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'File not found or could not be deleted',
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete file',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload featured image to gallery's Google Drive folder
     */
    public function uploadFeaturedImage(Request $request, Gallery $gallery)
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:jpeg,png,jpg,gif,webp',
        ]);

        try {
            $file = $request->file('file');
            $photoHandler = new \App\Services\PhotoHandler();
            
            Log::info('Featured image upload started', [
                'gallery_id' => $gallery->id,
                'gallery_title' => $gallery->title,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]);
            
            // Store the old featured image URL before replacing it
            $oldFeaturedImage = $gallery->featured_image;
            
            // Upload new featured image to Google Drive with proper folder structure
            $context = [
                'gallery_title' => $gallery->title,
                'gallery_id' => $gallery->id
            ];
            $imageUrl = $photoHandler->handlePhotoUpload($file, 'gallery-featured', $context);
            
            // Update gallery with new featured image URL
            $gallery->update(['featured_image' => $imageUrl]);
            
            Log::info('Featured image upload completed successfully', [
                'gallery_id' => $gallery->id,
                'old_featured_image' => $oldFeaturedImage,
                'new_featured_image_url' => $imageUrl
            ]);
            
            // Delete old featured image from Google Drive if it exists
            if ($oldFeaturedImage) {
                try {
                    $photoHandler->deletePhoto($oldFeaturedImage, 'gallery-featured');
                } catch (\Exception $e) {
                    // Log the error but don't fail the upload
                    Log::warning('Failed to delete old featured image: ' . $e->getMessage());
                }
            }
            
            return response()->json([
                'success' => true,
                'featured_image_url' => $imageUrl,
                'message' => 'Featured image uploaded successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to upload featured image',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove featured image from gallery
     */
    public function removeFeaturedImage(Gallery $gallery)
    {
        try {
            // Store the current featured image URL
            $currentFeaturedImage = $gallery->featured_image;
            
            if ($currentFeaturedImage) {
                // Remove featured image URL from gallery
                $gallery->update(['featured_image' => null]);
                
                // Delete the image from Google Drive
                try {
                    $photoHandler = new \App\Services\PhotoHandler();
                    $photoHandler->deletePhoto($currentFeaturedImage, 'gallery-featured');
                } catch (\Exception $e) {
                    // Log the error but still report success since the DB was updated
                    Log::warning('Failed to delete featured image from Google Drive: ' . $e->getMessage());
                }
                
                return response()->json([
                    'success' => true,
                    'message' => 'Featured image removed successfully',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No featured image to remove',
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to remove featured image',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Initialize Google Drive folder for existing gallery
     */
    public function initializeFolder(Gallery $gallery)
    {
        // Google Drive folders are now created dynamically by PhotoHandler when needed
        return response()->json([
            'success' => true,
            'message' => 'Gallery folders are created automatically when files are uploaded',
        ]);
    }

    /**
     * Upload item file directly to Google Drive with proper folder structure
     */
    public function uploadItemFile(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:jpeg,jpg,png,gif,webp,mp4,mov,avi,mkv,webm|max:51200', // 50MB
                'gallery_name' => 'required|string|max:255',
                'item_id' => 'required|string',
                'gallery_id' => 'nullable|integer|exists:galleries,id', // Optional gallery ID for better folder structure
            ]);

            $file = $request->file('file');
            $galleryName = $request->input('gallery_name');
            $galleryId = $request->input('gallery_id');

            // Log the upload attempt
            Log::info('Gallery item upload', [
                'gallery_name' => $galleryName,
                'gallery_id' => $galleryId,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            // Use PhotoHandler service with proper gallery folder structure
            $photoHandler = new \App\Services\PhotoHandler();
            
            // If we have gallery_id, use the new structured approach
            if ($galleryId) {
                $context = [
                    'gallery_title' => $galleryName,
                    'gallery_id' => $galleryId
                ];
                $fileUrl = $photoHandler->handlePhotoUpload($file, 'gallery-item', $context);
            } else {
                // Fallback to legacy method for backward compatibility
                Log::warning('Gallery item upload without gallery_id, using legacy method', [
                    'gallery_name' => $galleryName
                ]);
                $fileUrl = $photoHandler->handlePhotoUpload($file, 'galleries');
            }
            
            if (!$fileUrl) {
                throw new \Exception('PhotoHandler failed to upload file to Google Drive');
            }

            // Extract file metadata
            $metadata = $this->extractFileMetadata($file);

            Log::info('File uploaded successfully', [
                'file_url' => $fileUrl,
                'gallery_name' => $galleryName,
                'gallery_id' => $galleryId,
                'using_new_structure' => !empty($galleryId),
                'metadata' => $metadata
            ]);

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'file_url' => $fileUrl,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'metadata' => $metadata,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Gallery item file upload validation failed', [
                'validation_errors' => $e->errors(),
                'request_data' => $request->all(),
                'has_file' => $request->hasFile('file'),
                'file_info' => $request->file('file') ? [
                    'name' => $request->file('file')->getClientOriginalName(),
                    'size' => $request->file('file')->getSize(),
                    'mime' => $request->file('file')->getMimeType(),
                    'is_valid' => $request->file('file')->isValid(),
                ] : 'no_file',
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'message' => 'File validation failed: ' . json_encode($e->errors()),
                'details' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Gallery item file upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $request->file('file')?->getClientOriginalName(),
                'gallery_name' => $request->input('gallery_name'),
                'gallery_id' => $request->input('gallery_id'),
                'has_file' => $request->hasFile('file'),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to upload file',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a gallery item and its Google Drive file
     */
    public function destroyItem(Gallery $gallery, $itemId)
    {
        $item = $gallery->items()->findOrFail($itemId);
        
        // Delete the file from Google Drive first
        if ($item->file_path) {
            try {
                $photoHandler = new \App\Services\PhotoHandler();
                $photoHandler->deletePhoto($item->file_path, 'gallery-item');
                Log::info("Deleted Google Drive file for gallery item", [
                    'gallery_id' => $gallery->id,
                    'item_id' => $item->id,
                    'file_path' => $item->file_path,
                ]);
            } catch (\Exception $e) {
                Log::warning("Failed to delete Google Drive file for gallery item {$item->id}: " . $e->getMessage());
                // Continue with database deletion even if Google Drive deletion fails
            }
        }
        
        // Delete the database record
        $item->delete();

        return back()->with('success', 'Gallery item and its file deleted successfully.');
    }

    /**
     * Clear image from gallery item (delete from Google Drive and clear database fields)
     */
    public function clearItemImage(Gallery $gallery, $itemId)
    {
        $item = $gallery->items()->findOrFail($itemId);
        
        Log::info("Clearing image for gallery item", [
            'gallery_id' => $gallery->id,
            'item_id' => $item->id,
            'file_path' => $item->file_path,
        ]);
        
        // Delete from Google Drive if file exists
        if ($item->file_path) {
            try {
                $photoHandler = new \App\Services\PhotoHandler();
                $photoHandler->deletePhoto($item->file_path, 'gallery-item');
                Log::info("Deleted Google Drive file for gallery item", [
                    'gallery_id' => $gallery->id,
                    'item_id' => $item->id,
                    'file_path' => $item->file_path,
                ]);
            } catch (\Exception $e) {
                Log::warning("Failed to delete Google Drive file for gallery item {$item->id}: " . $e->getMessage());
                // Continue with clearing even if Google Drive deletion fails
            }
        }
        
        // Clear file-related fields in database but keep the item
        $item->update([
            'file_path' => null,
            'mime_type' => null,
        ]);

        Log::info("Cleared image fields for gallery item", [
            'gallery_id' => $gallery->id,
            'item_id' => $item->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image cleared successfully'
        ]);
    }

    /**
     * Toggle featured status of a gallery item
     */
    public function toggleItemFeatured(Gallery $gallery, $itemId)
    {
        $item = $gallery->items()->findOrFail($itemId);
        $item->update(['is_featured' => !$item->is_featured]);

        $status = $item->is_featured ? 'featured' : 'unfeatured';
        return back()->with('success', "Gallery item marked as {$status}.");
    }

    /**
     * Extract metadata from uploaded file
     */
    private function extractFileMetadata(\Illuminate\Http\UploadedFile $file): array
    {
        $metadata = [
            'file_size' => $file->getSize(),
            'file_size_human' => $this->formatFileSize($file->getSize()),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
        ];

        // Extract dimensions for images
        if (str_starts_with($file->getMimeType(), 'image/')) {
            try {
                $imageInfo = getimagesize($file->getPathname());
                if ($imageInfo !== false) {
                    $metadata['width'] = $imageInfo[0];
                    $metadata['height'] = $imageInfo[1];
                    $metadata['dimensions'] = "{$imageInfo[0]}x{$imageInfo[1]}";
                    $metadata['aspect_ratio'] = round($imageInfo[0] / $imageInfo[1], 2);

                    // Extract EXIF data if available (JPEG)
                    if (function_exists('exif_read_data') && $file->getMimeType() === 'image/jpeg') {
                        try {
                            $exif = exif_read_data($file->getPathname());
                            if ($exif !== false) {
                                $metadata['exif'] = [
                                    'camera_make' => $exif['Make'] ?? null,
                                    'camera_model' => $exif['Model'] ?? null,
                                    'date_taken' => $exif['DateTime'] ?? null,
                                    'orientation' => $exif['Orientation'] ?? null,
                                ];
                                // Remove empty EXIF values
                                $metadata['exif'] = array_filter($metadata['exif']);
                            }
                        } catch (\Exception $e) {
                            // EXIF extraction failed, continue without it
                            Log::debug('EXIF extraction failed: ' . $e->getMessage());
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to extract image dimensions: ' . $e->getMessage());
            }
        }

        // Extract video metadata if available
        if (str_starts_with($file->getMimeType(), 'video/')) {
            try {
                // Basic video metadata - duration would require ffmpeg or similar
                $metadata['video_type'] = 'video';
                
                // If ffmpeg is available, we could extract more metadata
                // For now, we'll store basic information
                $metadata['duration'] = null; // Could be implemented with ffmpeg
            } catch (\Exception $e) {
                Log::warning('Failed to extract video metadata: ' . $e->getMessage());
            }
        }

        return $metadata;
    }

    /**
     * Format file size in human readable format
     */
    private function formatFileSize(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }

    /**
     * Generate metadata from existing Google Drive URL (for items without metadata)
     */
    private function generateMetadataFromUrl(string $fileUrl, ?string $mimeType): array
    {
        $metadata = [
            'mime_type' => $mimeType,
            'source' => 'google_drive_url',
            'generated_at' => now()->toISOString(),
        ];

        // Extract file extension from MIME type or URL
        if ($mimeType) {
            $extension = match($mimeType) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                'video/mp4' => 'mp4',
                'video/quicktime' => 'mov',
                'video/x-msvideo' => 'avi',
                default => null
            };
            
            if ($extension) {
                $metadata['extension'] = $extension;
            }
        }

        // For Google Drive files, we can try to get some basic info
        if (str_contains($fileUrl, 'googleusercontent.com') || str_contains($fileUrl, 'drive.google.com')) {
            $metadata['storage'] = 'google_drive';
            
            // If it's an image, we could potentially fetch it and analyze
            // For now, we'll just mark it as needing metadata extraction
            if ($mimeType && str_starts_with($mimeType, 'image/')) {
                try {
                    // Attempt to get image dimensions from Google Drive URL
                    $imageInfo = @getimagesize($fileUrl);
                    if ($imageInfo !== false) {
                        $metadata['width'] = $imageInfo[0];
                        $metadata['height'] = $imageInfo[1];
                        $metadata['dimensions'] = "{$imageInfo[0]}x{$imageInfo[1]}";
                        $metadata['aspect_ratio'] = round($imageInfo[0] / $imageInfo[1], 2);
                    }
                } catch (\Exception $e) {
                    // If we can't fetch the image, that's okay
                    Log::debug('Could not extract dimensions from Google Drive URL: ' . $e->getMessage());
                }
            }
        }

        // Note that file was processed for metadata
        $metadata['note'] = 'Metadata generated from existing file URL';

        return $metadata;
    }

    /**
     * Clear caches that depend on gallery data
     */
    private function clearGalleryCaches(): void
    {
        // Clear application caches
        Cache::forget('home_optimized');
        Cache::forget('gallery_optimized');
        Cache::forget('contact_simple');
        Cache::forget('footer_contact');
        
        // Clear individual gallery caches (we can't know all slugs, so we'll rely on TTL)
        // In a production system, you might want to track gallery slugs in cache
        
        // Clear response cache for relevant routes
        $this->clearResponseCache([
            '/',
            '/gallery',
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