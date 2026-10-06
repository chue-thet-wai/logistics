<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Container extends Model
{
    protected $guarded = [];

    public function job()
    {
        return $this->belongsTo(
            Job::class,
            'shipment_id',   
            'shipment_id'    
        );
    }

    public function files()
    {
        return $this->hasMany(ContainerFiles::class, 'container_id','container_id');
    }

    public function route()
    {
        return $this->belongsTo(Route::class, 'route_id');
    }
}
