<?php

namespace App\Http\Controllers;

use App\Exports\JobsExport;
use App\Models\Job;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

class JobController extends Controller
{
    /**
     * Display a listing of jobs.
     */
    public function index(Request $request)
    {
        $query = Job::with(['customer'])
            ->withCount([
                'containers as pending_containers_count' => function ($query) {
                    $query->where('status', 0);
                }
            ]);
        if ($request->filled('master_bl_number')) {
            $query->where('master_bl_number', 'like', '%' . $request->master_bl_number . '%');
        }
        if ($request->filled('house_bl_number')) {
            $query->where('house_bl_number', 'like', '%' . $request->house_bl_number . '%');
        }
        if ($request->filled('customer')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->customer . '%');
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }        
        $jobs=$query->orderBy('created_at', 'desc')
            ->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('Jobs/Index', [
            'jobs' => $jobs,
            'categories' => config('common.categories'),
            'modes' => config('common.modes'),
            'statuses' => config('common.job_statuses'),
            'pageTitle' => 'Jobs',
        ]);
    }

    /**
     * Show the form for editing a job.
     */
    public function edit(Job $job)
    {
        $customers = Customer::select('cus_id', 'name')->get();

        return Inertia::render('Jobs/Form', [
            'job' => $job,
            'customers' => $customers,
            'categories' => config('common.categories'),
            'modes' => config('common.modes'),
            'loading_ports' => config('common.loading_ports'),
            'discharge_ports' => config('common.discharge_ports'),
            'carriers' => config('common.cariers'),
            'consignees' => config('common.consignee_names'),
            'shipment_types' => config('common.shipment_types'),
            'bl_statuses' => config('common.bl_statuses'),
            'free_day_types' => config('common.free_day_types'),
            'pageTitle' => 'Edit Job',
        ]);
    }

    /**
     * Update the specified job.
     */
    public function update(Request $request, Job $job)
    {
        
        $validated = $request->validate([
            'shipment_id' => 'nullable|string|max:255',
            'booking_id' => 'nullable|string|max:255',

            'cus_id' => 'required|exists:customers,cus_id',

            'mode' => 'required|integer',
            'category' => 'required|integer',

            'eta' => 'nullable|date',
            'si_number' => 'nullable',

            'loading_port' => 'nullable|integer',
            'discharge_port' => 'nullable|integer',

            'master_bl_number' => ['nullable','string','max:255',Rule::unique('jobs')->ignore($job->id)->whereNull('deleted_at'),],
            'house_bl_number' => ['nullable','string','max:255',Rule::unique('jobs')->ignore($job->id)->whereNull('deleted_at'),],

            'forwarder' => 'nullable|string|max:255',
            'carrier' => 'nullable|integer',
            'shipper_name' => 'nullable|string|max:255',

            'consignee' => 'required|integer',
            'type' => 'required|integer',
            'bl_status' => 'required|integer',
            'free_day_type' => 'required|integer',
            'surrendered_date' => 'nullable',
        ]);

        $validated['updated_by'] = Auth::id();

        $job->update($validated);

        if ($request->submitType === 'continue') {
            $containerCount = $job->containers()->count();

            if ($containerCount < $job->total_container) {
                return back()->with('error', 'Please fill container data first.');
            }

            $job->update(['status' => 1]);

            return redirect()
                ->route('jobs.index')
                ->with('success', 'Job is ready to assign.');
        }   

        return redirect()->route('jobs.index')
            ->with('success', 'Job updated successfully.');
    }

    /**
     * Show job details.
     */
    public function show(Job $job)
    {
        $job->load([
            'customer',
            'containers.route',
            'containers.files',
            'createdByUser',
            'updatedByUser'
        ]);

        return Inertia::render('Jobs/Show', [
            'job' => $job,
            'categories' => config('common.categories'),
            'modes' => config('common.modes'),
            'loading_ports' => config('common.loading_ports'),
            'discharge_ports' => config('common.discharge_ports'),
            'carriers' => config('common.cariers'),
            'consignees' => config('common.consignee_names'),
            'shipment_types' => config('common.shipment_types'),
            'bl_statuses' => config('common.bl_statuses'),
            'free_day_types' => config('common.free_day_types'),
            'statuses' => config('common.job_statuses'),
            'container_statuses' => config('common.container_statuses'),
            'container_types' => config('common.container_types'),
            'uoms'            => config('common.uoms'),
            'fz_options'      => config('common.fz_options'),
            'pageTitle' => 'Job Details'
        ]);
    }

    /**
     * Delete job.
     */
    public function destroy(Job $job)
    {
        $job->delete();

        return redirect()
            ->route('jobs.index')
            ->with('success', 'Job deleted successfully.');
    }

    /**
 * Export jobs to Excel.
 */
    public function export(Request $request)
    {
        $filters = [
            'master_bl_number' => $request->master_bl_number,
            'house_bl_number' => $request->house_bl_number,
            'customer' => $request->customer,
            'status' => $request->status,
        ];

        return Excel::download(
            new JobsExport($filters),
            'jobs-' . now()->format('Y-m-d') . '.xlsx'
        );
    }
}