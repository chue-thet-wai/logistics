<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\JobDriver;

class AssignDriverController extends Controller
{
   
    public function index()
    {
        $jobs = Job::with(['lead.customer'])
            ->whereIn('status', [1, 2])  
            ->orderBy('id', 'desc')
            ->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('AssignDriver/Index', [
            'jobs'      => $jobs,
            'statuses' => config('common.job_statuses'),
            'pageTitle' => 'Assign Driver',
        ]);
    }

    
    public function edit(Job $job)
    {
        $job->load(['lead.customer']);

        $drivers = Driver::with('user')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('AssignDriver/Form', [
            'job'        => $job,
            'drivers'    => $drivers,
            'categories'  => config('common.categories'),
            'pageTitle'  => 'Assign Driver',
        ]);
    }

   
    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,id',
        ]);

        $newDriverId = $validated['driver_id'];

        // Find if job already assigned before
        $oldAssignment = JobDriver::where('job_id', $job->id)->first();

        // If previously assigned → make old driver available again
        if ($oldAssignment && $oldAssignment->driver_id != $newDriverId) {
            Driver::where('id', $oldAssignment->driver_id)->update([
                'available' => 1
            ]);
        }

        // Save or update job assignment
        JobDriver::updateOrCreate(
            ['job_id' => $job->id],
            [
                'driver_id'  => $newDriverId,
                'created_by' => Auth::id(),
            ]
        );

        // Set new driver to BUSY
        Driver::where('id', $newDriverId)->update([
            'available' => 0
        ]);

        // Update job status to driver assigned
        $job->update([
            'status'     => 2,
            'updated_by' => Auth::id(),
        ]);

        return redirect()
            ->route('assign-driver.index')
            ->with('success', 'Driver assigned successfully.');
    }

    public function show(Job $job)
    {
        $job->load(['lead.customer', 'driverAssignment.driver.user']);

        return Inertia::render('AssignDriver/Show', [
            'job'       => $job,
            'pageTitle' => 'Assigned Job Details',
        ]);
    }
}
