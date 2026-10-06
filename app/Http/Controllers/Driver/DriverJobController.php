<?php

namespace App\Http\Controllers\Driver;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Notification;

class DriverJobController extends Controller
{
    /**
     * List jobs assigned to logged-in driver
     */
    public function index()
    {
        $user = Auth::user();

        abort_unless($user->hasRole('Driver'), 403);

        $driver = $user->driver;

        $jobs = $driver->jobs()
            ->orderBy('eta', 'asc')
            ->get();

        return Inertia::render('DriverApp/Jobs/Index', [
            'pageTitle' => 'Driver Jobs',
            'jobs' => $jobs,
        ]);
    }

    /**
     * Show job detail (only driver's job)
     */
    public function show($id)
    {
        $driver = Auth::user()->driver;

        $job = $driver->jobs()
            ->with(['route', 'attachments', 'lead','customer'])
            ->where('jobs.id', $id)
            ->firstOrFail();

        return Inertia::render('DriverApp/Jobs/Detail', [
            'job'            => $job,
            'job_statuses'   => config('common.job_statuses'),
        ]);
    }

    public function editStatus(Job $job)
    {
        $job = $job->load('customer', 'statusLogs');

        $latestLog = $job->statusLogs->sortByDesc('created_at')->first();

        return Inertia::render('DriverApp/Jobs/UpdateStatus', [
            'job'        => $job,
            'latestLog'  => $latestLog,
            'statuses'   => config('common.job_statuses'),
        ]);
    }


    public function updateStatus(Request $request, Job $job)
    {
        $request->validate([
            'status'    => 'required|integer',
            'latitude'  => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes'     => 'nullable|string',
            'photo'     => 'nullable|image|max:4096',

            'fuel.station' => 'nullable|string',
            'fuel.liter'   => 'nullable|numeric',
            'fuel.amount'  => 'nullable|numeric',
            'fuel.receipt' => 'nullable|file',

            'toll.gate'    => 'nullable|string',
            'toll.amount'  => 'nullable|numeric',
            'toll.receipt' => 'nullable|file',
        ]);

        $photoPath = $request->file('photo')
            ? $request->file('photo')->store('logistics/job-status', 's3')
            : null;

        $log = $job->statusLogs()->create([
            'status'    => $request->status,
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,
            'notes'     => $request->notes,
            'photo'     => $photoPath,
            'created_by' => Auth::user()->id,
            'updated_by' => Auth::user()->id,
        ]);

        $job->update(['status' => $request->status]);

        if ($request->fuel && ($request->fuel['station'] || $request->fuel['amount'])) {
            $fuelReceipt = $request->file('fuel.receipt')
                ? $request->file('fuel.receipt')->store('logistics/expenses-fuel', 's3')
                : null;

            $log->driverexpenses()->create([
                'type' => 'fuel',
                'station_name' => $request->fuel['station'],
                'liter' => $request->fuel['liter'],
                'amount' => $request->fuel['amount'] ?? 0,
                'receipt' => $fuelReceipt,
                'notes'     => $request->fuel['note'],
            ]);
        }

        if ($request->toll && ($request->toll['gate'] || $request->toll['amount'])) {
            $tollReceipt = $request->file('toll.receipt')
                ? $request->file('toll.receipt')->store('logistics/expenses-toll', 's3')
                : null;

            $log->driverexpenses()->create([
                'type' => 'toll',
                'gate_name' => $request->toll['gate'],
                'amount' => $request->toll['amount']?? 0,
                'receipt' => $tollReceipt,
                'notes'     => $request->toll['note'],
            ]);
        }

        $statusLabel = collect(config('common.job_statuses'))
            ->firstWhere('value', $request->status)['label'] ?? 'Updated';

        Notification::create([
            'user_id' => Auth::user()->id, 
            'title'   => 'Job Status Updated',
            'message' => "Job {$job->booking_id} status changed to {$statusLabel}",
        ]);

        return redirect()
            ->route('driver.jobs', $job->id)
            ->with('success', 'Status updated successfully');
    }



}
