<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\User;
use App\Models\Route;
use App\Models\Checkpoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index()
    {
        $drivers = Driver::with('user')
            ->paginate(config('common.paginate_per_page'));

        return Inertia::render('Drivers/Index', [
            'drivers' => $drivers,
            'pageTitle' => 'Drivers',
        ]);
    }

    public function create()
    {
        return Inertia::render('Drivers/Form', [
            'routes' => Route::select('id', 'name')->get(),
            'checkpoints' => Checkpoint::select('id', 'route_id', 'name')->get(),
            'statuses'  => config('common.statuses'),
            'pageTitle' => 'Create Driver',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'phone'         => 'nullable|string|max:20',
            'truck_number'  => 'nullable|string|max:100',
            'vehicle_type'  => 'nullable|string|max:100',
            'status'        => 'nullable|string|max:50',
            'route'         => 'nullable|string|max:255',
            'checkpoint'    => 'nullable|string|max:255',
            'remark'        => 'nullable|string',
        ]);

        $lastDriver = Driver::orderBy('id', 'desc')->first();
        $nextNumber = $lastDriver ? intval(substr($lastDriver->driver_id, 3)) + 1 : 1;
        $driverId = 'DRV' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make('driver'),
            'created_by' => auth()->id(),
        ]);
        $user->assignRole('Driver');

        Driver::create([
            'user_id'       => $user->id,
            'driver_id'     => $driverId,
            'name'          => $request->name,
            'email'         => $request->email,
            'phone'         => $request->phone,
            'truck_number'  => $request->truck_number,
            'vehicle_type'  => $request->vehicle_type,
            'status'        => $request->status,
            'route'         => $request->route,
            'checkpoint'    => $request->checkpoint,
            'remark'        => $request->remark,
            'created_by'    => auth()->id(),
        ]);

        return redirect()->route('drivers.index')
            ->with('success', 'Driver created successfully!');
    }

    public function edit(Driver $driver)
    {
        return Inertia::render('Drivers/Form', [
            'driver' => $driver,
            'routes' => Route::select('id', 'name')->get(),
            'checkpoints' => Checkpoint::select('id', 'route_id', 'name')->get(),
            'statuses'  => config('common.statuses'),
            'pageTitle' => 'Edit Driver',
        ]);
    }

    public function update(Request $request, Driver $driver)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email,' . $driver->user_id,
            'phone'         => 'nullable|string|max:20',
            'truck_number'  => 'nullable|string|max:100',
            'vehicle_type'  => 'nullable|string|max:100',
            'status'        => 'nullable|string|max:50',
            'route'         => 'nullable|string|max:255',
            'checkpoint'    => 'nullable|string|max:255',
            'remark'        => 'nullable|string',
        ]);

        $driver->user->update([
            'name'       => $request->name,
            'email'      => $request->email,
            'updated_by' => auth()->id(),
        ]);

        $driver->update([
            'name'          => $request->name,
            'email'         => $request->email,
            'phone'         => $request->phone,
            'truck_number'  => $request->truck_number,
            'vehicle_type'  => $request->vehicle_type,
            'status'        => $request->status,
            'route'         => $request->route,
            'checkpoint'    => $request->checkpoint,
            'remark'        => $request->remark,
            'updated_by'    => auth()->id(),
        ]);

        return redirect()->route('drivers.index')
            ->with('success', 'Driver updated successfully!');
    }

    public function destroy(Driver $driver)
    {
        $user = $driver->user;
        $driver->delete();
        if ($user) $user->delete();

        return redirect()->route('drivers.index')
            ->with('success', 'Driver deleted successfully!');
    }
}
