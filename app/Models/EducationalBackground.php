<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationalBackground extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'degree',
        'field_of_study',
        'institution',
        'graduation_year',
        'description',
    ];

    protected $casts = [
        'graduation_year' => 'integer',
    ];

    /**
     * Get the staff that owns the educational background.
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
