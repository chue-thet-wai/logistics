<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jobAssignments()
    {
        return $this->hasMany(JobDriver::class);
    }

    public function jobs()
    {
        return $this->belongsToMany(Job::class, 'job_drivers')
                    ->withTimestamps();
    }
}
