<?php

namespace App\Http\Controllers;

use App\Models\Track;
use App\Models\Driver;
use App\Models\Truck;
use App\Models\Job;
use App\Models\Container;
use App\Models\TrackContainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TrackController extends Controller
{
    public function index(Request $request)
    {
        $query = Track::with([
            'driver:id,name',
            'truck:id,truck_number',
            'containers:id,container_no,status'
        ]);
        if ($request->track_id) {
            $query->where('track_id','like','%'.$request->track_id.'%');
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
        $tracks=$query->latest()->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('Track/Index', [
            'tracks' => $tracks,
            'statuses'  => config('common.track_statuses'),
            'pageTitle' => 'Truck Assign',
        ]);
    }

    public function create()
    {
        return Inertia::render('Track/Form', [
            'drivers' => Driver::where('available', 1)->where('status',1)->get(),
            'trucks' => Truck::where('available', 1)->where('status',1)->get(),
            'jobContainers' => [],
            'container_types' => config('common.container_types'),
            'pageTitle' => 'Create Track',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'truck_id' => 'required|exists:trucks,id',
            'driver_id' => 'required|exists:drivers,id',
            'containers' => 'required|array|min:1',
            'containers.*' => 'exists:containers,id',
        ]);

        DB::transaction(function () use ($validated) {
            $this->validateAvailability($validated);

            $trackId = generateUniqueId('tracks', 'track_id', 'TRK-', 6);
            $track = Track::create([
                'track_id' => $trackId,
                'truck_id' => $validated['truck_id'],
                'driver_id' => $validated['driver_id'],
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            // Attach containers with pivot data
            $containerData = [];
            foreach ($validated['containers'] as $containerId) {
                $containerData[$containerId] = [
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id()
                ];
            }
            $track->containers()->sync($containerData);

            // Update statuses
            Driver::where('id', $validated['driver_id'])->update(['available' => 0]);
            Truck::where('id', $validated['truck_id'])->update(['available' => 0]);
            Container::whereIn('id', $validated['containers'])->update(['status' => 1]);
            $track->statusLogs()->create([
                'status' => 0,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
        });

        return redirect()->route('tracks.index')
            ->with('success', 'Track created successfully.');
    }

    public function edit(Track $track)
    {
        $track->load('containers.job');

        return Inertia::render('Track/Form', [
            'track' => $track,
            'drivers' => Driver::where('available', 1)
                ->where('status',1)
                ->orWhere('id', $track->driver_id)
                ->get(),
            'trucks' => Truck::where('available', 1)
                ->where('status',1)
                ->orWhere('id', $track->truck_id)
                ->get(),
            'jobContainers' => $track->containers,
            'container_types' => config('common.container_types'),
            'pageTitle' => 'Edit Track',
        ]);
    }

    public function update(Request $request, Track $track)
    {
        $validated = $request->validate([
            'truck_id' => 'required|exists:trucks,id',
            'driver_id' => 'required|exists:drivers,id',
            'containers' => 'required|array|min:1',
            'containers.*' => 'exists:containers,id',
        ]);

        DB::transaction(function () use ($track, $validated) {

            $this->validateAvailabilityForUpdate($track, $validated);

            // Reset old driver if changed
            if ($track->driver_id != $validated['driver_id']) {
                Driver::where('id', $track->driver_id)->update(['available' => 1]);
            }

            // Reset old truck if changed
            if ($track->truck_id != $validated['truck_id']) {
                Truck::where('id', $track->truck_id)->update(['available' => 1]);
            }

            // Reset old containers
            $oldContainerIds = $track->containers->pluck('id')->toArray();
            if (!empty($oldContainerIds)) {
                Container::whereIn('id', $oldContainerIds)->update(['status' => 0]);
            }

            // Update track main info
            $track->update([
                'truck_id' => $validated['truck_id'],
                'driver_id' => $validated['driver_id'],
                'updated_by' => auth()->id(),
            ]);

            // Update containers with pivot
            $containerData = [];
            foreach ($validated['containers'] as $containerId) {
                $containerData[$containerId] = [
                    'updated_by' => auth()->id()
                ];
            }
            $track->containers()->sync($containerData);

            // Set new statuses
            Driver::where('id', $validated['driver_id'])->update(['available' => 0]);
            Truck::where('id', $validated['truck_id'])->update(['available' => 0]);
            Container::whereIn('id', $validated['containers'])->update(['status' => 1]);
        });

        return redirect()->route('tracks.index')
            ->with('success', 'Track updated successfully.');
    }

    public function destroy(Track $track)
    {
        DB::transaction(function () use ($track) {
            Driver::where('id', $track->driver_id)->update(['available' => 1]);
            Truck::where('id', $track->truck_id)->update(['available' => 1]);

            $containerIds = $track->containers->pluck('id')->toArray();
            if (!empty($containerIds)) {
                Container::whereIn('id', $containerIds)->update(['status' => 0]);
            }

            $track->containers()->detach();
            $track->delete();
        });

        return redirect()->route('tracks.index')
            ->with('success', 'Track deleted successfully.');
    }
   
    public function show(Track $track)
    {
        $track->load([
            'driver.user',
            'truck',
            'containers.job',
            'createdByUser',
            'updatedByUser'
        ]);

        return inertia('Track/Show', [
            'track' => $track,
            'pageTitle' => "Track Detail",
            'container_types' => config('common.container_types'),
            'statuses'  => config('common.track_statuses'),
        ]);
    }


    public function searchJob(Request $request)
    {
        $containers = Container::with('job')
            ->whereHas('job', function ($q) {
                $q->where('status', 1);
            })
            ->where('status', 0)
            ->when($request->bl_number, function ($q) use ($request) {
                $q->whereHas('job', function ($q2) use ($request) {
                    $q2->where('master_bl_number', $request->bl_number)
                    ->orWhere('house_bl_number', $request->bl_number);
                });
            })
            ->paginate(config('common.paginate_per_page', 10));

        return response()->json([
            'jobContainers' => $containers
        ]);
    }

    private function validateAvailability($validated)
    {
        $errors = [];

        if (Driver::where('id', $validated['driver_id'])->where('available', 0)->exists()) {
            $errors['driver_id'] = 'Driver already assigned.';
        }

        if (Truck::where('id', $validated['truck_id'])->where('available', 0)->exists()) {
            $errors['truck_id'] = 'Truck already assigned.';
        }

        if (Container::whereIn('id', $validated['containers'])->where('status', 1)->exists()) {
            $errors['containers'] = 'One or more containers already assigned.';
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function validateAvailabilityForUpdate($track, $validated)
    {
        $errors = [];

        if ($track->driver_id != $validated['driver_id'] &&
            Driver::where('id', $validated['driver_id'])->where('available', 0)->exists()) {
            $errors['driver_id'] = 'Driver already assigned.';
        }

        if ($track->truck_id != $validated['truck_id'] &&
            Truck::where('id', $validated['truck_id'])->where('available', 0)->exists()) {
            $errors['truck_id'] = 'Truck already assigned.';
        }

        $currentContainerIds = $track->containers->pluck('id')->toArray();
        $conflictContainers = Container::whereIn('id', $validated['containers'])
            ->where('status', 1)
            ->whereNotIn('id', $currentContainerIds)
            ->exists();

        if ($conflictContainers) {
            $errors['containers'] = 'One or more containers already assigned.';
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}