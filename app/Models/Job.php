<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'booking_id', 'booking_id');
    }

    public function attachments()
    {
        return $this->hasMany(JobAttachment::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class, 'route_id');
    }

    public function driverAssignment()
    {
        return $this->hasOne(JobDriver::class);
    }


}
