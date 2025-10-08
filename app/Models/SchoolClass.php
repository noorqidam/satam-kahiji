<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'grade_level',
        'class_section',
        'description',
        'capacity',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    /**
     * Get the students assigned to this class
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class', 'name');
    }

    /**
     * Get the homeroom teacher assigned to this class
     */
    public function homeroomTeacher()
    {
        return $this->hasOne(Staff::class, 'homeroom_class', 'name');
    }

    /**
     * Get the count of students in this class
     */
    public function getStudentCountAttribute(): int
    {
        return $this->students()->count();
    }

    /**
     * Get the available capacity
     */
    public function getAvailableCapacityAttribute(): int
    {
        return $this->capacity - $this->student_count;
    }

    /**
     * Check if class is full
     */
    public function getIsFullAttribute(): bool
    {
        return $this->student_count >= $this->capacity;
    }


    /**
     * Scope for specific grade level
     */
    public function scopeGrade($query, $gradeLevel)
    {
        return $query->where('grade_level', $gradeLevel);
    }

    /**
     * Get classes grouped by grade level
     */
    public static function getByGradeLevel(): array
    {
        return self::orderBy('grade_level')
            ->orderBy('class_section')
            ->get()
            ->groupBy('grade_level')
            ->toArray();
    }

    /**
     * Get all active class names for dropdown
     */
    public static function getActiveClassNames(): array
    {
        return self::orderBy('grade_level')
            ->orderBy('class_section')
            ->pluck('name', 'name')
            ->toArray();
    }
}