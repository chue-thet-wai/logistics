<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripIncome extends Model
{
    protected $guarded = [];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function container()
    {
        return $this->belongsTo(Container::class, 'container_id', 'container_id');
    }
}
