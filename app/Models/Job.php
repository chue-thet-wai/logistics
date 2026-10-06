<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function getRouteKeyName()
    {
        return 'shipment_id';
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'booking_id', 'booking_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'cus_id', 'cus_id');
    }

    public function containers()
    {
        return $this->hasMany(Container::class, 'shipment_id', 'shipment_id');
    }

    public function attachments()
    {
        return $this->hasMany(JobAttachment::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class, 'route_id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }


}
