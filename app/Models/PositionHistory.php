<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PositionHistory extends Model
{
    use HasFactory;

    protected $table = 'position_history';

    protected $fillable = [
        'staff_id',
        'title',
        'start_year',
        'end_year',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}