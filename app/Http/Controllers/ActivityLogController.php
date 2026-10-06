<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
   
    public function index(Request $request)
    {
        $query = Trip::with([
                'driver',
                'truck',
                'containers'
            ]);
        if ($request->trip_id) {
            $query->where('trip_id','like','%'.$request->trip_id.'%');
        }

        if ($request->truck_number) {
            $query->whereHas('truck', function ($q) use ($request) {
                $q->where('truck_number','like','%'.$request->truck_number.'%');
            });
        }

        if ($request->driver) {
            $query->whereHas('driver', function ($q) use ($request) {
                $q->where('name','like','%'.$request->driver.'%');
            });
        }

        if ($request->status !== null && $request->status !== '') {
            $query->where('status',$request->status);
        }
        $trips =$query->orderBy('created_at', 'desc')
            ->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('ActivityLog/Index', [
            'trips'    => $trips,
            'statuses'  => config('common.trip_statuses'), 
            'pageTitle' => 'Activity Log',
        ]);
    }

    public function show(Trip $trip)
    {
        $trip->load([
            'statusLogs.user', 
            'statusLogs.costs',
            'statusLogs.truck',
            'driver',
            'truck',
            'containers.job.customer'
        ]);
        
        return Inertia::render('ActivityLog/Show', [
            'trip'     => $trip,
            'statuses'  => config('common.trip_statuses'),
            'expense_types'  => config('common.expense_types'),
            'pageTitle' => 'Activity Log Details',
        ]);
    }
}