<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobStatusLog extends Model
{
    protected $guarded = [];
    
    public function driverexpenses()
    {
        return $this->hasMany(JobDriverExpense::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
