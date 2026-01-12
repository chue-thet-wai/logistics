<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Customer;
use App\Models\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class JobController extends Controller
{
    /**
     * Display a listing of jobs.
     */
    public function index()
    {
        $jobs = Job::with(['lead.customer', 'route'])
            ->where('status', 0) // pending
            ->orderBy('id', 'desc')
            ->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('Jobs/Index', [
            'jobs' => $jobs,
            'statuses' => config('common.job_statuses'),
            'categories' => config('common.categories'),
            'pageTitle' => 'Jobs',
        ]);
    }

    /**
     * Show the form for editing a job.
     */
    public function edit(Job $job)
    {
        $customers = Customer::all(['cus_id', 'name']);
        $routes = Route::all(['id', 'name', 'origin', 'destination']); 

        return Inertia::render('Jobs/Form', [
            'job' => $job,
            'customers' => $customers,
            'routes' => $routes,
            'categories' => config('common.categories'),
            'pageTitle' => 'Edit Job',
        ]);
    }

    
    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'cus_id' => 'required|string|exists:customers,cus_id',
            'mode' => 'nullable|string',
            'eta' => 'nullable|date',
            'category' => 'nullable|string',
            'containers' => 'nullable|integer',
            'bl_number' => 'nullable|string',
            'free_day' => 'nullable|integer',
            'route_id' => 'nullable|exists:routes,id',
            'origin' => 'nullable|string',
            'destination' => 'nullable|string',
            'operational_pickup_date' => 'nullable|string',
            'operational_container_info' => 'nullable|string',
            'operational_gatepass_info' => 'nullable|string',
            'operational_receiving_confirmation' => 'nullable|string',
            'detention_free_days' => 'nullable|integer',
            'detention_used_days' => 'nullable|integer',
            'detention_extra_days' => 'nullable|string',
            'detention_rate' => 'nullable|string',
            'detention_total' => 'nullable|string',
            'detention_remark' => 'nullable|string',
            'demurrage_free_days' => 'nullable|integer',
            'demurrage_used_days' => 'nullable|integer',
            'demurrage_extra_days' => 'nullable|string',
            'demurrage_rate' => 'nullable|string',
            'demurrage_total' => 'nullable|string',
            'demurrage_remark' => 'nullable|string',
        ]);

        /*if (!empty($validated['route_id'])) {
            $route = Route::find($validated['route_id']);
            $validated['origin'] = $route->origin;
            $validated['destination'] = $route->destination;
        }*/

        $validated['updated_by'] = Auth::id();

        $job->update($validated);

        $action = $request->submitType;

        if ($action === 'continue') {
            $job->update(['status' => 1]);
            return redirect()->route('assign-driver.index')
                ->with('success', 'Job saved and driver assigning started.');
        }

        return redirect()->route('jobs.index')
            ->with('success', 'Job Sheet updated successfully.');
    }

    /**
     * Show job details.
     */
    public function show(Job $job)
    {
        $job->load(['lead', 'route']);

        return Inertia::render('Jobs/Show', [
            'job' => $job,
            'pageTitle' => 'Job Details',
        ]);
    }

    public function destroy(Job $job)
    {
        $job->delete();

        return redirect()
            ->route('jobs.index')
            ->with('success', 'Job deleted successfully.');
    }

}
