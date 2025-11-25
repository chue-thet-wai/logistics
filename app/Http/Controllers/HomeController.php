<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Customer;
use App\Models\CustomerService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return $this->dashboard(); 
    }

    public function dashboard()
    {
        $user = Auth::user();


        $activeCount     = 12;
        $completedCount  = 10;
        $delayCount      = 15;

        $driversOn       = 10;
        $totalDrivers    = 18;

        return Inertia::render('Dashboard', [
            'user' => $user,
            'pageTitle' => 'Dashboard',
            'stats' => [
                'activeCount'    => $activeCount,
                'completedCount' => $completedCount,
                'delayCount'     => $delayCount,
                'driversOn'      => $driversOn,
                'totalDrivers'   => $totalDrivers,
            ],
        ]);
    }
}
