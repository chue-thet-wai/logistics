<?php

namespace App\Http\Controllers;

use App\Models\Truck;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TruckController extends Controller
{
    public function index()
    {
        $trucks = Truck::latest()
            ->paginate(config('common.paginate_per_page'));

        return Inertia::render('Trucks/Index', [
            'trucks' => $trucks,
            'statuses'  => config('common.statuses'),
            'pageTitle' => 'Trucks',
        ]);
    }

    public function create()
    {
        return Inertia::render('Trucks/Form', [
            'statuses'  => config('common.statuses'),
            'pageTitle' => 'Create Truck',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'truck_number'  => 'required|string|max:100|unique:trucks,truck_number',
            'vehicle_type'  => 'nullable|string|max:100',
            'status'        => 'nullable|string|max:50',
            'remark'        => 'nullable|string',
        ]);

        $truckId = generateUniqueId('trucks', 'truck_id');

        Truck::create([
            'truck_id'      => $truckId,
            'truck_number'  => $request->truck_number,
            'vehicle_type'  => $request->vehicle_type,
            'status'        => $request->status,
            'remark'        => $request->remark,
            'available'     => 1,
            'created_by'    => auth()->id(),
        ]);

        return redirect()
            ->route('trucks.index')
            ->with('success', 'Truck created successfully!');
    }

    public function edit(Truck $truck)
    {
        return Inertia::render('Trucks/Form', [
            'truck' => $truck,
            'statuses'  => config('common.statuses'),
            'pageTitle' => 'Edit Truck',
        ]);
    }

    public function update(Request $request, Truck $truck)
    {
        $request->validate([
            'truck_number'  => 'required|string|max:100|unique:trucks,truck_number,' . $truck->id,
            'vehicle_type'  => 'nullable|string|max:100',
            'status'        => 'nullable|string|max:50',
            'remark'        => 'nullable|string',
        ]);

        $truck->update([
            'truck_number'  => $request->truck_number,
            'vehicle_type'  => $request->vehicle_type,
            'status'        => $request->status,
            'remark'        => $request->remark,
            'updated_by'    => auth()->id(),
        ]);

        return redirect()
            ->route('trucks.index')
            ->with('success', 'Truck updated successfully!');
    }

    public function destroy(Truck $truck)
    {
        if ($truck->trips()->exists()) {
            return redirect()->route('trucks.index')
                ->with('error', 'Cannot delete! Truck is used in trips.');
        }
        $truck->delete();

        return redirect()
            ->route('trucks.index')
            ->with('success', 'Truck deleted successfully!');
    }
}
