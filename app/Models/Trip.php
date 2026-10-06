<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trip extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function getRouteKeyName()
    {
        return 'trip_id';
    }

    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function tripContainers()
    {
        return $this->hasMany(TripContainer::class);
    }

    public function containers()
    {
        return $this->belongsToMany(Container::class, 'trip_containers')
                    ->using(TripContainer::class)
                    ->withTimestamps()
                    ->withPivot(['created_by', 'updated_by']);
    }

    public function statusLogs()
    {
        return $this->hasMany(TripStatusLog::class);
    }

    public function incomes()
    {
        return $this->hasMany(TripIncome::class);
    }

    public function expenses()
    {
        return $this->hasMany(TripExpense::class);
    }

    public function costs()
    {
       return $this->hasManyThrough(
            TripTransportCost::class,
            TripStatusLog::class,
            'trip_id',              
            'trip_status_log_id',  
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
