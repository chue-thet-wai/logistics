<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\User;
use App\Models\Route;
use App\Models\Checkpoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Imports\DriversImport;
use Maatwebsite\Excel\Facades\Excel;

class DriverController extends Controller
{
    public function index()
    {
        $drivers = Driver::with('user')
            ->latest()
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
            'password'      => 'required|min:6|confirmed',
            'phone'         => 'nullable|string',
            'status'        => 'nullable|string|max:50',
            'route'         => 'nullable|string|max:255',
            'checkpoint'    => 'nullable|string|max:255',
            'remark'        => 'nullable|string',
        ]);

        $driverId = generateUniqueId('drivers', 'driver_id');

        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'created_by' => auth()->id(),
        ]);
        $user->assignRole('Driver');

        Driver::create([
            'user_id'       => $user->id,
            'driver_id'     => $driverId,
            'name'          => $request->name,
            'email'         => $request->email,
            'phone'         => $request->phone,
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
            'password'      => 'nullable|min:6|confirmed',
            'phone'         => 'nullable|string',
            'status'        => 'nullable|string|max:50',
            'route'         => 'nullable|string|max:255',
            'checkpoint'    => 'nullable|string|max:255',
            'remark'        => 'nullable|string',
        ]);

        $data = [
            'name'       => $request->name,
            'email'      => $request->email,
            'updated_by' => auth()->id(),
        ];

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $driver->user->update($data);

        $driver->update([
            'name'          => $request->name,
            'email'         => $request->email,
            'phone'         => $request->phone,
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
        if ($driver->trips()->exists()) {
            return redirect()->route('drivers.index')
                ->with('error', 'Cannot delete! Driver is used in trips.');
        }

        $user = $driver->user;

        $driver->forceDelete(); 

        if ($user) {
            $user->delete();
        }

        return redirect()->route('drivers.index')
            ->with('success', 'Driver deleted successfully!');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls'
        ]);

        Excel::import(new DriversImport, $request->file('file'));

        return redirect()->route('drivers.index')
            ->with('success', 'Drivers imported successfully!');
    }
}
