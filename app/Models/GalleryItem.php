<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'gallery_id',
        'title',
        'caption',
        'mime_type',
        'file_path',
        'metadata',
        'sort_order',
        'is_featured',
    ];

    protected $casts = [
        'metadata' => 'array',
        'sort_order' => 'integer',
        'is_featured' => 'boolean',
    ];

    protected $appends = [
        'type',
        'file_url',
        'thumbnail_url',
    ];

    /**
     * Get the gallery that owns this item
     */
    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class);
    }

    /**
     * Scope for featured items
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for images only
     */
    public function scopeImages($query)
    {
        return $query->where('mime_type', 'LIKE', 'image/%');
    }

    /**
     * Scope for videos only
     */
    public function scopeVideos($query)
    {
        return $query->where('mime_type', 'LIKE', 'video/%');
    }

    /**
     * Get the optimized file URL for display
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        
        // If file_path is already an optimized lh3 URL, return as-is
        if (str_contains($this->file_path, 'lh3.googleusercontent.com')) {
            return $this->file_path;
        }
        
        // Extract file ID and convert to optimized URL
        $fileId = $this->extractFileId($this->file_path);
        if ($fileId) {
            return "https://lh3.googleusercontent.com/d/{$fileId}";
        }
        
        return $this->file_path;
    }

    /**
     * Get the optimized thumbnail URL (generated from file_path)
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        
        // Only generate thumbnails for images
        if (!str_starts_with($this->mime_type, 'image/')) {
            return null;
        }
        
        // Extract file ID and convert to optimized thumbnail URL with size parameters
        $fileId = $this->extractFileId($this->file_path);
        if ($fileId) {
            return "https://lh3.googleusercontent.com/d/{$fileId}=w600-h400-c";
        }
        
        // If we can't extract file ID, return the original file path
        return $this->file_path;
    }
    
    /**
     * Get Google Drive view URL for the file
     */
    public function getViewUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        
        $fileId = $this->extractFileId($this->file_path);
        if ($fileId) {
            return "https://drive.google.com/file/d/{$fileId}/view";
        }
        
        return $this->file_path;
    }
    
    /**
     * Get file type based on MIME type
     */
    public function getTypeAttribute(): string
    {
        if (!$this->mime_type) {
            return 'other';
        }
        
        if (str_starts_with($this->mime_type, 'image/')) {
            return 'image';
        } elseif (str_starts_with($this->mime_type, 'video/')) {
            return 'video';
        }
        
        return 'other';
    }
    
    /**
     * Extract Google Drive file ID from various URL formats
     */
    private function extractFileId(string $url): ?string
    {
        // Match lh3.googleusercontent.com format
        if (preg_match('/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9\-_]+)/', $url, $matches)) {
            return $matches[1];
        }
        
        // Match drive.google.com view URL format
        if (preg_match('/drive\.google\.com\/file\/d\/([a-zA-Z0-9\-_]+)/', $url, $matches)) {
            return $matches[1];
        }
        
        // Match drive.google.com thumbnail URL format
        if (preg_match('/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9\-_]+)/', $url, $matches)) {
            return $matches[1];
        }
        
        // If it looks like a direct file ID (fallback)
        if (preg_match('/^[a-zA-Z0-9\-_]{25,}$/', $url)) {
            return $url;
        }
        
        return null;
    }
}