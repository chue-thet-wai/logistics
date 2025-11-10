<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\User;
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
            'pageTitle' => 'Create Driver',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $lastDriver = Driver::orderBy('id', 'desc')->first();
        $nextNumber = $lastDriver ? intval(substr($lastDriver->driver_id, 3)) + 1 : 1;
        $driverId = 'DRV' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make('driver'),
            'created_by' => auth()->id(),
        ]);

        $user->assignRole('Driver');

        Driver::create([
            'user_id' => $user->id,
            'driver_id' => $driverId,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'zip_code' => $request->zip_code,
            'address' => $request->address,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('drivers.index')->with('success', 'Driver created successfully!');
    }


    public function edit(Driver $driver)
    {
        $driver->load('user');

        return Inertia::render('Drivers/Form', [
            'driver' => $driver,
            'pageTitle' => 'Edit Driver',
        ]);
    }

    public function update(Request $request, Driver $driver)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $driver->user_id,
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $user = $driver->user;
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'updated_by' => auth()->id(),
        ]);

        $driver->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'zip_code' => $request->zip_code,
            'address' => $request->address,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('drivers.index')->with('success', 'Driver updated successfully!');
    }

    public function destroy(Driver $driver)
    {
        $user = $driver->user;
        $driver->delete();
        if ($user) $user->delete();

        return redirect()->route('drivers.index')->with('success', 'Driver deleted successfully!');
    }
}
