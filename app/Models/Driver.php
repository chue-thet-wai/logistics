<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'driver_id',
        'name',
        'email',
        'phone',
        'city',
        'state',
        'country',
        'zip_code',
        'address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
