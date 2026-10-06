<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Truck extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function getRouteKeyName()
    {
        return 'truck_id';
    }

    public function containers()
    {
        return $this->belongsToMany(Container::class, 'trip_containers')
            ->withTimestamps()
            ->withPivot(['created_by', 'updated_by']);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

}
