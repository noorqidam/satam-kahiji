<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentExtracurricularHistory extends Model
{
    use HasFactory;

    protected $table = 'student_extracurricular_history';

    protected $fillable = [
        'student_id',
        'extracurricular_id',
        'academic_year',
        'role',
        'start_date',
        'end_date',
        'performance_notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function extracurricular()
    {
        return $this->belongsTo(Extracurricular::class);
    }
}
