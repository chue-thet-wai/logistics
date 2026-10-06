<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TrackContainerController extends Controller
{
    public function show($trackId, $containerId)
    {
        $driver = Auth::user()->driver;

        $track = $driver->tracks()
            ->where('track_id', $trackId)
            ->firstOrFail();

        $container = $track->containers()
            ->with('files')
            ->where('containers.container_id', $containerId)
            ->firstOrFail();

        return Inertia::render('DriverApp/Tracks/ContainerDetail', [
            'track'     => $track,
            'container' => $container,
        ]);
    }
}
