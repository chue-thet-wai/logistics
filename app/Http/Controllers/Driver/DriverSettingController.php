<?php

namespace App\Http\Controllers\Driver;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Checkpoint;
use App\Models\Driver;
use App\Models\Route;
use Illuminate\Support\Facades\Auth;

class DriverSettingController extends Controller
{
    /**
     * Settings view
     */
    public function index()
    {
        $driver = Auth::user()->driver;

        return Inertia::render('DriverApp/Settings/Index', [
            'pageTitle' => 'Driver Settings',
            'driver'    => $driver,
        ]);
    }

    /**
     * Edit page
     */
    public function edit(Request $request)
    {
        $driver = Driver::where('user_id', $request->user()->id)->firstOrFail();

        return Inertia::render('DriverApp/Settings/Edit', [
            'pageTitle'  => 'Edit Driver Settings',
            'driver'     => $driver,
            'routes'     => Route::select('id', 'name')->get(),
            'checkpoints'=> Checkpoint::select('id', 'route_id', 'name')->get(),
            'statuses'   => config('common.statuses'),
        ]);
    }

    /**
     * Update driver data
     */
    public function update(Request $request)
    {
        $driver = Driver::where('user_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'phone'         => 'nullable|string|max:50',
            'truck_number'  => 'nullable|string|max:50',
            'vehicle_type'  => 'nullable|string|max:100',
            'status'        => 'nullable|string|max:50',
            'route'         => 'nullable|integer',
            'checkpoint'    => 'nullable|integer',
            'available'     => 'required|boolean',
            'remark'        => 'nullable|string',
        ]);

        $driver->update($validated);

        return redirect()
            ->route('driver.settings')
            ->with('success', 'Driver settings updated successfully.');
    }
}
