<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobDriver extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

}
