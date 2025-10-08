<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentSemesterGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_academic_year_id',
        'subject_id',
        'subject_teacher_id',
        'semester',
        'mid_term_score',
        'final_score',
        'average_score',
        'grade',
        'notes',
    ];

    protected $casts = [
        'semester' => 'integer',
        'mid_term_score' => 'decimal:2',
        'final_score' => 'decimal:2',
        'average_score' => 'decimal:2',
    ];

    public function studentAcademicYear()
    {
        return $this->belongsTo(StudentAcademicYear::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Staff::class, 'subject_teacher_id');
    }

    public function student()
    {
        return $this->hasOneThrough(
            Student::class,
            StudentAcademicYear::class,
            'id',
            'id',
            'student_academic_year_id',
            'student_id'
        );
    }
}
