<?php

use App\Models\Agent;
use App\Models\Customer;
use App\Models\ShortUrl;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

function checkUserRole($roleName, $user = null)
{
    $user = $user ?? Auth::user();
    if (!$user) {
        return false;
    }
    $roleId = Role::where('name', $roleName)->pluck('id')->first();
    return $user->roles()->where('id', $roleId)->exists();
}

function generateCustomerID() 
{
    $characters = '1234567890';
    $length = 9;

    do {
        $randomNumber = '';
        for ($i = 0; $i < $length; $i++) {
            $randomNumber .= $characters[rand(0, strlen($characters) - 1)];
        }

        $customerID = 'C-' . $randomNumber;
        $exists = Customer::where('customer_id', $customerID)->exists();

    } while ($exists);

    return $customerID;
}

function generateAgentID() 
{
    $characters = '1234567890';
    $length = 6;

    do {
        $randomNumber = '';
        for ($i = 0; $i < $length; $i++) {
            $randomNumber .= $characters[rand(0, strlen($characters) - 1)];
        }

        $agentID = 'A-' . $randomNumber;
        $exists = Agent::where('agent_id', $agentID)->exists();

    } while ($exists);

    return $agentID;
}

function generateBitlyUrl($longUrl)
{
    //$bitlyToken = env('BITLY_TOKEN');  
    $bitlyToken="a546e1a83b4d845d5f9e5f357a93fab8f19b4dad";

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $bitlyToken,
        'Content-Type' => 'application/json',
    ])->post('https://api-ssl.bitly.com/v4/shorten', [
        'long_url' => $longUrl,
        'domain' => 'bit.ly',
    ]);

    if ($response->successful()) {
        return $response->json()['link'];  
    } else {
        Log::error('Bitly shortening failed: ' . $response->body());
        return null;
    }
}

function generateShortUrl(string $originalUrl): string
{
    $existing = ShortUrl::where('original_url', $originalUrl)->first();
    if ($existing) {
        return url($existing->code);
    }

    do {
        $code = Str::random(6);
    } while (ShortUrl::where('code', $code)->exists());

    $shortUrl = ShortUrl::create([
        'code' => $code,
        'original_url' => $originalUrl,
    ]);

    return url($code);
}
