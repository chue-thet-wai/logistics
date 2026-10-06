<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Driver;
use App\Models\Truck;
use App\Models\Job;
use App\Models\Container;
use App\Models\Notification;
use App\Models\TripContainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $query = Trip::with([
            'driver:id,name',
            'truck:id,truck_number',
            'containers:id,container_no,status'
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
        $trips=$query->latest()->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('Trip/Index', [
            'trips' => $trips,
            'statuses'  => config('common.trip_statuses'),
            'pageTitle' => 'Truck Assign',
        ]);
    }

    public function create()
    {
        return Inertia::render('Trip/Form', [
            'drivers' => Driver::where('available', 1)->where('status',1)->get(),
            'trucks' => Truck::where('available', 1)->where('status',1)->get(),
            'jobContainers' => [],
            'uoms'            => config('common.uoms'),
            'container_types' => config('common.container_types'),
            'pageTitle' => 'Create Trip',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'truck_id' => 'required|exists:trucks,id',
            'driver_id' => 'required|exists:drivers,id',
            'remark' => 'nullable|string',
            'containers' => 'required|array|min:1',
            'containers.*' => 'exists:containers,id',
        ]);

        DB::transaction(function () use ($validated) {
            $this->validateAvailability($validated);

            $tripId = generateUniqueId('trips', 'trip_id');
            $trip = Trip::create([
                'trip_id' => $tripId,
                'truck_id' => $validated['truck_id'],
                'driver_id' => $validated['driver_id'],
                'remark' => $validated['remark'] ?? null,
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
            $trip->containers()->sync($containerData);

            // Update statuses
            Driver::where('id', $validated['driver_id'])->update(['available' => 0]);
            Truck::where('id', $validated['truck_id'])->update(['available' => 0]);
            Container::whereIn('id', $validated['containers'])->update(['status' => 1]);
            $trip->statusLogs()->create([
                'status' => 0,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            $truck = Truck::find($validated['truck_id']);
            $driverData = Driver::find($validated['driver_id']);
            Notification::create([
                'user_id' => $driverData->user_id,
                'title' => 'New Trip Assigned',
                'message' => "You are assigned a new trip {$trip->trip_id} with truck {$truck->truck_number}.",
            ]);
        });

        return redirect()->route('trips.index')
            ->with('success', 'Trip created successfully.');
    }

    public function edit(Trip $trip)
    {
        $trip->load('containers.job');

        return Inertia::render('Trip/Form', [
            'trip' => $trip,
            'drivers' => Driver::where('available', 1)
                ->where('status',1)
                ->orWhere('id', $trip->driver_id)
                ->get(),
            'trucks' => Truck::where('available', 1)
                ->where('status',1)
                ->orWhere('id', $trip->truck_id)
                ->get(),
            'jobContainers' => $trip->containers,
            'uoms'            => config('common.uoms'),
            'container_types' => config('common.container_types'),
            'pageTitle' => 'Edit Trip',
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'truck_id' => 'required|exists:trucks,id',
            'driver_id' => 'required|exists:drivers,id',
            'remark' => 'nullable|string',
            'containers' => 'required|array|min:1',
            'containers.*' => 'exists:containers,id',
        ]);

        DB::transaction(function () use ($trip, $validated) {

            $this->validateAvailabilityForUpdate($trip, $validated);

            // Reset old driver if changed
            if ($trip->driver_id != $validated['driver_id']) {
                Driver::where('id', $trip->driver_id)->update(['available' => 1]);
                $oldDriver = Driver::find($trip->driver_id);
                $newDriver = Driver::find($validated['driver_id']);
                Notification::create([
                    'user_id' => $newDriver->user_id,
                    'title' => 'Driver Change',
                    'message' => "Trip {$trip->trip_id} has been updated from old driver {$oldDriver->name} to {$newDriver->name}.",
                ]);
            }

            // Reset old truck if changed
            if ($trip->truck_id != $validated['truck_id']) {
                Truck::where('id', $trip->truck_id)->update(['available' => 1]);
                $oldtruck = Truck::find($trip->truck_id);
                $newtruck = Truck::find($validated['truck_id']);
                $driverData = Driver::find($validated['driver_id']);
                Notification::create([
                    'user_id' => $driverData->user_id,
                    'title' => 'Vehicle Change',
                    'message' => "Your truck {$oldtruck->truck_number} for Trip {$trip->trip_id} has been updated to {$newtruck->truck_number}.",
                ]);
            }

            $oldContainerIds = $trip->containers->pluck('id')->toArray();
            $newContainerIds = $validated['containers'];

            sort($oldContainerIds);
            sort($newContainerIds);

            $containersChanged = $oldContainerIds !== $newContainerIds;

            if (!empty($oldContainerIds)) {
                Container::whereIn('id', $oldContainerIds)->update(['status' => 0]);
            }
            if ($containersChanged) {
                $driverData = Driver::find($validated['driver_id']);
                Notification::create([
                    'user_id' => $driverData->user_id,
                    'title' => 'Trip Updated: Container',
                    'message' => "Containers updated for Trip {$trip->trip_id}.",
                ]);
            }

            // Update trip main info
            $trip->update([
                'truck_id' => $validated['truck_id'],
                'driver_id' => $validated['driver_id'],
                'remark' => $validated['remark'] ?? null,
                'updated_by' => auth()->id(),
            ]);

            // Update containers with pivot
            $containerData = [];
            foreach ($validated['containers'] as $containerId) {
                $containerData[$containerId] = [
                    'updated_by' => auth()->id()
                ];
            }
            
            $trip->containers()->sync($containerData);

            // Set new statuses
            Driver::where('id', $validated['driver_id'])->update(['available' => 0]);
            Truck::where('id', $validated['truck_id'])->update(['available' => 0]);
            Container::whereIn('id', $validated['containers'])->update(['status' => 1]);
        });

        return redirect()->route('trips.index')
            ->with('success', 'Trip updated successfully.');
    }

    public function destroy(Trip $trip)
    {
        DB::transaction(function () use ($trip) {
            Driver::where('id', $trip->driver_id)->update(['available' => 1]);
            Truck::where('id', $trip->truck_id)->update(['available' => 1]);

            $containerIds = $trip->containers->pluck('id')->toArray();
            if (!empty($containerIds)) {
                Container::whereIn('id', $containerIds)->update(['status' => 0]);
            }

            $trip->containers()->detach();
            $trip->delete();
        });

        return redirect()->route('trips.index')
            ->with('success', 'Trip deleted successfully.');
    }
   
    public function show(Trip $trip)
    {
        $trip->load([
            'driver.user',
            'truck',
            'containers.job',
            'createdByUser',
            'updatedByUser'
        ]);

        return inertia('Trip/Show', [
            'trip' => $trip,
            'pageTitle' => "Trip Detail",
            'uoms'            => config('common.uoms'),
            'container_types' => config('common.container_types'),
            'statuses'  => config('common.trip_statuses'),
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

    private function validateAvailabilityForUpdate($trip, $validated)
    {
        $errors = [];

        if ($trip->driver_id != $validated['driver_id'] &&
            Driver::where('id', $validated['driver_id'])->where('available', 0)->exists()) {
            $errors['driver_id'] = 'Driver already assigned.';
        }

        if ($trip->truck_id != $validated['truck_id'] &&
            Truck::where('id', $validated['truck_id'])->where('available', 0)->exists()) {
            $errors['truck_id'] = 'Truck already assigned.';
        }

        $currentContainerIds = $trip->containers->pluck('id')->toArray();
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