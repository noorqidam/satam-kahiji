<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherWorkFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_subject_work_id',
        'file_name',
        'file_url',
        'file_path',
        'file_size',
        'mime_type',
        'uploaded_at',
        'last_accessed',
        'views',
        'downloads',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'last_accessed' => 'datetime',
        'views' => 'integer',
        'downloads' => 'integer',
        'file_size' => 'integer',
    ];

    public function teacherSubjectWork()
    {
        return $this->belongsTo(TeacherSubjectWork::class);
    }

    public function feedback()
    {
        return $this->hasMany(WorkItemFeedback::class);
    }
    
    public function latestFeedback()
    {
        return $this->hasOne(WorkItemFeedback::class)->latest();
    }
}