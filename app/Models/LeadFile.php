<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class LeadFile extends Model
{
    protected $guarded = [];

    protected $appends = ['file_url'];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function getFileUrlAttribute()
    {
       
        return Storage::disk('s3')->temporaryUrl(
            $this->file_path,
            now()->addMinutes(10)
        );

    }
}
