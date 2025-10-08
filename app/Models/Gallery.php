<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'featured_image',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the gallery items
     */
    public function items(): HasMany
    {
        return $this->hasMany(GalleryItem::class)->orderBy('sort_order');
    }

    /**
     * Get published gallery items
     */
    public function publishedItems(): HasMany
    {
        return $this->items()->where('is_featured', true);
    }

    /**
     * Get featured images for this gallery
     */
    public function featuredItems(): HasMany
    {
        return $this->items()->where('is_featured', true);
    }

    /**
     * Get images only
     */
    public function images(): HasMany
    {
        return $this->items()->where('type', 'image');
    }

    /**
     * Get videos only
     */
    public function videos(): HasMany
    {
        return $this->items()->where('type', 'video');
    }

    /**
     * Scope for published galleries
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }


    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($gallery) {
            if (empty($gallery->slug)) {
                $gallery->slug = Str::slug($gallery->title);
            }
        });

        static::updating(function ($gallery) {
            if ($gallery->isDirty('title') && empty($gallery->slug)) {
                $gallery->slug = Str::slug($gallery->title);
            }
        });
    }
}