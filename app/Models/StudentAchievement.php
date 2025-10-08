<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentAchievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'achievement_type',
        'achievement_name',
        'description',
        'date_achieved',
        'criteria_met',
        'level',
        'score_value',
        'issuing_organization',
        'metadata',
    ];

    protected $casts = [
        'date_achieved' => 'date',
        'metadata' => 'array',
        'score_value' => 'decimal:2',
    ];

    /**
     * Achievement types available in the system
     */
    public const ACHIEVEMENT_TYPES = [
        'academic_excellence' => 'Academic Excellence',
        'perfect_attendance' => 'Perfect Attendance',
        'sports_achievement' => 'Sports Achievement',
        'arts_achievement' => 'Arts Achievement',
        'leadership' => 'Leadership',
        'community_service' => 'Community Service',
        'character_award' => 'Character Award',
        'improvement' => 'Improvement',
        'participation' => 'Participation',
        'graduation' => 'Graduation',
    ];

    /**
     * Achievement levels available in the system
     */
    public const LEVELS = [
        'school' => 'School Level',
        'district' => 'District Level',
        'regional' => 'Regional Level',
        'national' => 'National Level',
        'international' => 'International Level',
    ];


    /**
     * Get the student that owns this achievement
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }


    /**
     * Get the achievement certificates for this achievement
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(StudentAchievementCertificate::class, 'achievement_id');
    }

    /**
     * Scope to filter by achievement type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('achievement_type', $type);
    }

    /**
     * Scope to filter by achievement level
     */
    public function scopeOfLevel($query, string $level)
    {
        return $query->where('level', $level);
    }


    /**
     * Scope to filter by date range
     */
    public function scopeAchievedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('date_achieved', [$startDate, $endDate]);
    }

    /**
     * Get the formatted achievement type name
     */
    public function getAchievementTypeNameAttribute(): string
    {
        return self::ACHIEVEMENT_TYPES[$this->achievement_type] ?? $this->achievement_type;
    }

    /**
     * Get the formatted level name
     */
    public function getLevelNameAttribute(): string
    {
        return self::LEVELS[$this->level] ?? $this->level;
    }

}