<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentDisciplinaryRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'staff_id',
        'incident_type',
        'description',
        'action_taken',
        'date',
        'severity',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
