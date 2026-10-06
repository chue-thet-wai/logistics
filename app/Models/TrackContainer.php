<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Facades\Auth;

class TrackContainer extends Pivot
{
    protected $table = 'track_containers';

    protected $fillable = [
        'track_id', 'container_id', 'created_by', 'updated_by'
    ];

    public $timestamps = true; 

    protected static function boot()
    {
        parent::boot();

        // Automatically set created_by and updated_by on create
        static::creating(function ($pivot) {
            $pivot->created_by = Auth::id();
            $pivot->updated_by = Auth::id();
        });

        // Automatically update updated_by on update
        static::updating(function ($pivot) {
            $pivot->updated_by = Auth::id();
        });
    }
}