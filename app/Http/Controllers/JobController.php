<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index()
    {

        $jobs = Job::with('lead')
            ->orderBy('id', 'desc')
            ->paginate(config('common.paginate_per_page', 10));


        return Inertia::render('Jobs/Index', [
            'jobs' => $jobs,
            'pageTitle' => 'Jobs'
        ]);
    }
    
}
