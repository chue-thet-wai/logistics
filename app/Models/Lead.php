<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use SoftDeletes;
    protected $guarded = [];
    
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'cus_id', 'cus_id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function files()
    {
        return $this->hasMany(LeadFile::class, 'lead_id');
    }
}
