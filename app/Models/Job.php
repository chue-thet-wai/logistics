<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'shipment_id',
        'customer_id',
        'mode',
        'shipment_category',
        'port_loading',
        'port_discharge',
        'vessel_name',
        'voyage_no',
        'bl_number',
        'eta',
        'etd',
        'free_days',
        'ics',
        'remarks',
        'preloading_instruction',
        'container_instruction',
        'booking_confirmation',
        'customs_clearance',
        'delivery_order',
        'used_days_container',
        'free_days_container',
        'detention_status',
        'detention_remark',
        'used_days_demurrage',
        'free_days_demurrage',
        'demurrage_status',
        'demurrage_remark',
        'created_by',
        'updated_by',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'booking_id', 'booking_id');
    }
}
