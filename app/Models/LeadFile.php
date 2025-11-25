<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadFile extends Model
{
    protected $guarded = [];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
