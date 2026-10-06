<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class TrackExpense extends Model
{
    protected $guarded = [];

    protected $appends = [
        'receipt_url',
        'receipt2_url',
        'receipt3_url'
    ];

    public function getReceiptUrlAttribute()
    {
        return $this->getTemporaryUrl($this->receipt);
    }

    public function getReceipt2UrlAttribute()
    {
        return $this->getTemporaryUrl($this->receipt_2);
    }

    public function getReceipt3UrlAttribute()
    {
        return $this->getTemporaryUrl($this->receipt_3);
    }

    private function getTemporaryUrl($path)
    {
        if (!$path || !Storage::disk('s3')->exists($path)) {
            return null;
        }

        return Storage::disk('s3')->temporaryUrl(
            $path,
            now()->addMinutes(10)
        );
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}