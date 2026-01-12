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

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'cus_id', 'cus_id');
    }

    public function attachments()
    {
        return $this->hasMany(JobAttachment::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class, 'route_id');
    }

    public function driverAssignments()
    {
        return $this->hasMany(JobDriver::class);
    }

    public function drivers()
    {
        return $this->belongsToMany(Driver::class, 'job_drivers')
                    ->withTimestamps();
    }

    public function statusLogs()
    {
        return $this->hasMany(JobStatusLog::class);
    }



}
