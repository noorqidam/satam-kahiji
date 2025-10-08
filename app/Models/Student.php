<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'nisn',
        'name',
        'gender',
        'birth_date',
        'birthplace',
        'religion',
        'parent_name',
        'parent_phone',
        'parent_email',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'transportation_method',
        'distance_from_home_km',
        'travel_time_minutes',
        'pickup_location',
        'transportation_notes',
        'allergies',
        'medical_conditions',
        'dietary_restrictions',
        'blood_type',
        'emergency_medical_info',
        'class',
        'homeroom_teacher_id',
        'entry_year',
        'graduation_year',
        'status',
        'photo',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'entry_year' => 'integer',
        'graduation_year' => 'integer',
        'distance_from_home_km' => 'decimal:2',
        'travel_time_minutes' => 'integer',
    ];


    public function extracurriculars()
    {
        return $this->belongsToMany(Extracurricular::class, 'student_extracurricular')
                    ->withTimestamps()
                    ->withPivot('created_at', 'updated_at');
    }

    public function homeroomTeacher()
    {
        return $this->belongsTo(Staff::class, 'homeroom_teacher_id');
    }


    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class', 'name');
    }

    public function positiveNotes()
    {
        return $this->hasMany(StudentPositiveNote::class);
    }

    public function disciplinaryRecords()
    {
        return $this->hasMany(StudentDisciplinaryRecord::class);
    }

    public function academicYears()
    {
        return $this->hasMany(StudentAcademicYear::class);
    }

    public function achievements()
    {
        return $this->hasMany(StudentAchievement::class);
    }


    public function documents()
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function extracurricularHistory()
    {
        return $this->hasMany(StudentExtracurricularHistory::class);
    }

    public function currentAcademicYear()
    {
        return $this->hasOne(StudentAcademicYear::class)
                    ->where('status', 'active')
                    ->latest('academic_year');
    }

    public function semesterGrades()
    {
        return $this->hasManyThrough(
            StudentSemesterGrade::class,
            StudentAcademicYear::class,
            'student_id',
            'student_academic_year_id'
        );
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subject')
                    ->withTimestamps();
    }
}