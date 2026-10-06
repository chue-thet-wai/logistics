<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Track extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function getRouteKeyName()
    {
        return 'track_id';
    }

    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function trackContainers()
    {
        return $this->hasMany(TrackContainer::class);
    }

    public function containers()
    {
        return $this->belongsToMany(Container::class, 'track_containers')
                    ->using(TrackContainer::class)
                    ->withTimestamps()
                    ->withPivot(['created_by', 'updated_by']);
    }

    public function statusLogs()
    {
        return $this->hasMany(TrackStatusLog::class);
    }

    public function incomes()
    {
        return $this->hasMany(TrackIncome::class);
    }

    public function expenses()
    {
       return $this->hasManyThrough(
            TrackExpense::class,
            TrackStatusLog::class,
            'track_id',              
            'track_status_log_id',  
            'id',
            'id'
        );
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }


}
