<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkItemFeedback extends Model
{
    use HasFactory;

    protected $table = 'work_item_feedback';

    protected $fillable = [
        'teacher_work_file_id',
        'reviewer_id', 
        'feedback',
        'status',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the teacher work file that owns the feedback.
     */
    public function teacherWorkFile(): BelongsTo
    {
        return $this->belongsTo(TeacherWorkFile::class);
    }

    /**
     * Get the reviewer (user) that owns the feedback.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}