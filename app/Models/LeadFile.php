<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadFile extends Model
{
    protected $fillable = [
        'lead_id',
        'file_path',
        'file_type',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
