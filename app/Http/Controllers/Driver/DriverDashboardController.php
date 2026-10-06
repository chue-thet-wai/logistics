<?php

namespace App\Http\Controllers\Driver;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class DriverDashboardController extends Controller
{
    public function dashboard()
    {
        $driver = Auth::user()->driver;

        $new = $driver->trips()
            ->where('status', 0)
            ->count();

        $active = $driver->trips()
            ->whereIn('status', [2, 3, 4, 5, 6,7,8])
            ->count();

        $done = $driver->trips()
            ->where('status', 9)
            ->count();

        // Latest upcoming trips
        $trips = $driver->trips()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('DriverApp/DriverDashboard', [
            'pageTitle' => 'Driver Dashboard',
            'new'       => $new,
            'active'    => $active,
            'done'      => $done,
            'statuses'  => config('common.trip_statuses'), 
            'trips'    => $trips, 
        ]);
    }
}
