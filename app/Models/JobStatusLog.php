<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobStatusLog extends Model
{
    protected $guarded = [];
    
   public function expenses()
    {
        return $this->hasMany(JobExpense::class);
    }
}
