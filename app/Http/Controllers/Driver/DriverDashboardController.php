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

        $new = $driver->jobs()
            ->where('status', 2)
            ->count();

        $active = $driver->jobs()
            ->whereIn('status', [3, 4, 5, 6])
            ->count();

        $done = $driver->jobs()
            ->where('status', 7)
            ->count();

        // Latest upcoming jobs
        $jobs = $driver->jobs()
            ->orderBy('eta', 'asc')
            ->limit(5)
            ->get();

        return Inertia::render('DriverApp/DriverDashboard', [
            'pageTitle' => 'Driver Dashboard',
            'new'       => $new,
            'active'    => $active,
            'done'      => $done,
            'statuses'  => config('common.job_statuses'),
            'jobs'      => $jobs,
        ]);
    }
}
