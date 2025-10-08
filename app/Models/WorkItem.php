<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_required',
        'created_by_role',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function teacherSubjectWorks()
    {
        return $this->hasMany(TeacherSubjectWork::class);
    }
}