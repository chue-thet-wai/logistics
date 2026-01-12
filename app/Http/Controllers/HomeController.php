<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Job;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class HomeController extends Controller
{
    public function index()
    {
        return $this->dashboard(); 
    }

    public function dashboard()
    {
        $user = Auth::user();

        $activeCount = Job::whereIn('status', [0,1,2,3,4,5,6])->count();
        $completedCount = Job::where('status', 7)->count();

        $delayCount = Job::where('status', 0)
                        ->where('created_at', '<', Carbon::now()->subDays(2))
                        ->count();

        $driversOn = User::whereHas('driver', function($q){
                        $q->where('available', 1);
                     })->count();

        $totalDrivers = User::whereHas('driver')->count();

        return Inertia::render('Dashboard', [
            'user' => $user,
            'stats' => [
                'activeCount'    => $activeCount,
                'completedCount' => $completedCount,
                'delayCount'     => $delayCount,
                'driversOn'      => $driversOn,
                'totalDrivers'   => $totalDrivers,
            ],
            'pageTitle' => 'Dashboard',
        ]);
    }
}
