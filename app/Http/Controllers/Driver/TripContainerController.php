<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TripContainerController extends Controller
{
    public function show($tripId, $containerId)
    {
        $driver = Auth::user()->driver;

        $trip = $driver->trips()
            ->where('trip_id', $tripId)
            ->firstOrFail();

        $container = $trip->containers()
            ->with('files')
            ->where('containers.container_id', $containerId)
            ->firstOrFail();

        return Inertia::render('DriverApp/Trips/ContainerDetail', [
            'trip'     => $trip,
            'container' => $container,
        ]);
    }
}
