<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class TrackStatusLog extends Model
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
    
    public function expenses()
    {
        return $this->hasMany(TrackExpense::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
