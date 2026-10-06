<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TripProgressController extends Controller
{
   
    public function index(Request $request)
    {
        $query = Trip::with([
                'containers',
                'driver',
                'truck',
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

        $trips=$query->latest()
            ->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('TripProgress/Index', [
            'trips'    => $trips,
            'statuses'  => config('common.trip_statuses'), 
            'pageTitle' => 'Trip Progress',
        ]);
    }

    public function show(Trip $trip)
    {
        $trip->load([
            'containers.job.customer',
            'driver',
            'truck',
            'expenses',
            'incomes',
        ]);

        $statuses = collect(config('common.trip_statuses'))
            ->filter(function ($status) {
                return $status['value'] != 10;
            })
            ->values();

        return Inertia::render('TripProgress/Show', [
            'trip'     => $trip,
            'statuses'  => $statuses,
            'pageTitle' => 'Trip Progress Details',
        ]);
    }
}