<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Customer;
use App\Models\CustomerService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        $now = Carbon::now();
      
        return Inertia::render('Dashboard', [
            'user' => $user,
            'pageTitle' => 'Dashboard',
        ]);
    }


}
