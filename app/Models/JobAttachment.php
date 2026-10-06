<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class JobAttachment extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['file_url'];   

    public function getFileUrlAttribute()
    {
       if (!$this->file_path) {
            return null;
        }   
        return Storage::disk('s3')->temporaryUrl(
            $this->file_path,
            now()->addMinutes(10)
        );

    }

    public function job() {
        return $this->belongsTo(Job::class);
    }

    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }
}
