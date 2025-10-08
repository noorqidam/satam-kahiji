<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'academic_year',
        'grade_level',
        'class_id',
        'homeroom_teacher_id',
        'status',
        'final_grade_average',
        'attendance_percentage',
        'promotion_date',
        'notes',
    ];

    protected $casts = [
        'grade_level' => 'integer',
        'final_grade_average' => 'decimal:2',
        'attendance_percentage' => 'decimal:2',
        'promotion_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function homeroomTeacher()
    {
        return $this->belongsTo(Staff::class, 'homeroom_teacher_id');
    }

    public function semesterGrades()
    {
        return $this->hasMany(StudentSemesterGrade::class);
    }
}
