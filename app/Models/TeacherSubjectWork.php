<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherSubjectWork extends Model
{
    use HasFactory;

    protected $table = 'teacher_subject_work';

    protected $fillable = [
        'staff_id',
        'subject_id',
        'work_item_id',
        'folder_name',
        'gdrive_folder_id',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
    
    public function teacher()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function workItem()
    {
        return $this->belongsTo(WorkItem::class);
    }

    public function files()
    {
        return $this->hasMany(TeacherWorkFile::class);
    }
}