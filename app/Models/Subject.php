<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    public function staff()
    {
        return $this->belongsToMany(Staff::class, 'subject_staff')
                    ->withTimestamps();
    }


    public function teacherSubjectWorks()
    {
        return $this->hasMany(TeacherSubjectWork::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_subject')
                    ->withTimestamps();
    }

}