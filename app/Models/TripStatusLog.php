<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class TripStatusLog extends Model
{
    protected $guarded = [];

    protected $appends = ['photo_url'];   

    public function getPhotoUrlAttribute()
    {
        if (!$this->photo || !Storage::disk('s3')->exists($this->photo)) {
            return null;
        }

        return Storage::disk('s3')->temporaryUrl(
            $this->photo,
            now()->addMinutes(10)
        );
    }
    
    public function costs()
    {
        return $this->hasMany(TripTransportCost::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}
