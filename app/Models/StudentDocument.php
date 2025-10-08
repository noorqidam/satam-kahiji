<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'document_type',
        'title',
        'description',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'uploaded_by',
        'uploaded_by_type',
        'upload_date',
        'download_count',
        'is_public',
    ];

    protected $casts = [
        'upload_date' => 'datetime',
        'file_size' => 'integer',
        'download_count' => 'integer',
        'is_public' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }


    public function uploader()
    {
        return $this->belongsTo(Staff::class, 'uploaded_by');
    }

}
