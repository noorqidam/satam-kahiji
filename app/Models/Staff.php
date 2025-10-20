<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'position',
        'division',
        'homeroom_class',
        'photo',
        'email',
        'phone',
        'bio',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function positionHistory()
    {
        return $this->hasMany(PositionHistory::class);
    }

    public function educationalBackgrounds()
    {
        return $this->hasMany(EducationalBackground::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'subject_staff')
                    ->withTimestamps();
    }


    public function teacherSubjectWorks()
    {
        return $this->hasMany(TeacherSubjectWork::class);
    }

    public function homeroomStudents()
    {
        return $this->hasMany(Student::class, 'homeroom_teacher_id');
    }

    public function homeroomClass()
    {
        return $this->belongsTo(SchoolClass::class, 'homeroom_class', 'name');
    }


    /**
     * Generate slug from name and save it
     */
    public function generateSlug(): void
    {
        $baseSlug = \Illuminate\Support\Str::slug($this->name);
        $slug = $baseSlug;
        $counter = 1;

        // Ensure uniqueness by appending numbers if necessary
        while (static::where('slug', $slug)->where('id', '!=', $this->id)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $this->slug = $slug;
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($staff) {
            if (empty($staff->slug)) {
                $staff->generateSlug();
            }
        });

        static::updating(function ($staff) {
            if ($staff->isDirty('name') || empty($staff->slug)) {
                $staff->generateSlug();
            }
        });
    }
}