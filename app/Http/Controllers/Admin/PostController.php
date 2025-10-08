<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\PhotoHandler;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(private PhotoHandler $photoHandler)
    {
    }

    public function index(Request $request): Response
    {
        $query = Post::with('user:id,name')
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

        // Filter by published status
        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->published();
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            }
        }

        $posts = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
            'filters' => $request->only(['category', 'search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/posts/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'category' => ['required', Rule::in(['news', 'announcements'])],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'created_at' => 'required|date',
            'is_published' => 'nullable',
        ]);

        // Generate slug from title
        $validated['slug'] = Str::slug($validated['title']);
        
        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Post::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $this->photoHandler->storePost($request->file('image'));
        }

        // Set user_id
        $validated['user_id'] = Auth::id();

        // Parse created_at datetime and save in Indonesian timezone format
        if ($request->filled('created_at')) {
            $validated['created_at'] = Carbon::parse($validated['created_at'], 'Asia/Jakarta')->format('Y-m-d H:i:s');
        }

        // Handle is_published boolean - convert string 'true'/'false' to actual boolean
        $isPublishedValue = $request->input('is_published', false);
        $validated['is_published'] = in_array($isPublishedValue, ['true', '1', 1, true], true);

        $post = Post::create($validated);

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post created successfully.');
    }

    public function show(Post $post): Response
    {
        $post->load('user:id,name');
        
        return Inertia::render('admin/posts/show', [
            'post' => $post,
        ]);
    }

    public function edit(Post $post): Response
    {
        $post->load('user:id,name');
        
        return Inertia::render('admin/posts/edit', [
            'post' => $post,
        ]);
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'category' => ['required', Rule::in(['news', 'announcements'])],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'created_at' => 'required|date',
            'is_published' => 'nullable',
            'remove_image' => 'boolean',
        ]);

        // Update slug if title changed
        if ($post->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']);
            
            // Ensure slug is unique (excluding current post)
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Post::where('slug', $validated['slug'])->where('id', '!=', $post->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle image removal
        if ($request->boolean('remove_image') && $post->image) {
            $this->photoHandler->deletePhoto($post->image, 'posts');
            $validated['image'] = null;
        }

        // Handle new image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($post->image) {
                $this->photoHandler->deletePhoto($post->image, 'posts');
            }
            
            $validated['image'] = $this->photoHandler->storePost($request->file('image'));
        }

        // Parse created_at datetime and save in Indonesian timezone format
        if ($request->filled('created_at')) {
            $validated['created_at'] = Carbon::parse($validated['created_at'], 'Asia/Jakarta')->format('Y-m-d H:i:s');
        }

        // Handle is_published boolean - convert string 'true'/'false' to actual boolean
        $isPublishedValue = $request->input('is_published', false);
        $validated['is_published'] = in_array($isPublishedValue, ['true', '1', 1, true], true);

        $post->update($validated);

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post updated successfully.');
    }

    public function destroy(Post $post)
    {
        // Delete image from storage
        if ($post->image) {
            $this->photoHandler->deletePhoto($post->image, 'posts');
        }

        $post->delete();

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post deleted successfully.');
    }

    public function togglePublish(Request $request, Post $post)
    {
        $validated = $request->validate([
            'is_published' => 'required|boolean',
        ]);

        $post->update([
            'is_published' => $validated['is_published']
        ]);

        return response()->json([
            'success' => true,
            'is_published' => $post->is_published,
            'message' => $post->is_published ? 'Post published successfully.' : 'Post unpublished successfully.'
        ]);
    }
}