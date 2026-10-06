<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RouteController extends Controller
{
    public function index()
    {
        $routes = Route::withCount('checkpoints')
                    ->latest()
                    ->paginate(config('common.paginate_per_page'));

        return Inertia::render('Routes/Index', [
            'routes' => $routes,
            'statuses' => config('common.statuses'),
            'pageTitle' => 'Routes',
        ]);
    }

    public function create()
    {
        return Inertia::render('Routes/Form', [
            'statuses' => config('common.statuses'),
            'pageTitle' => 'Create Route',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'origin' => 'nullable|string|max:255',
            'destination' => 'nullable|string|max:255',
            'total_distance' => 'nullable|string|max:50',
            'estimate_duration' => 'nullable|string|max:50',
            'status' => 'required|integer|in:0,1',
            'remark' => 'nullable|string',
        ]);
        $routeId = generateUniqueId('routes', 'route_id');
        $validated['route_id'] = $routeId;
        $validated['created_by'] = auth()->id();

        Route::create($validated);

        return redirect()->route('transport-routes.index')->with('success', 'Route created successfully!');
    }

    public function edit(Route $routeModel)
    {
        return Inertia::render('Routes/Form', [
            'route' => $routeModel,
            'statuses' => config('common.statuses'),
            'pageTitle' => 'Edit Route',
        ]);
    }

    public function update(Request $request, Route $routeModel)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'origin' => 'nullable|string|max:255',
            'destination' => 'nullable|string|max:255',
            'total_distance' => 'nullable|string|max:50',
            'estimate_duration' => 'nullable|string|max:50',
            'status' => 'required|integer|in:0,1',
            'remark' => 'nullable|string',
        ]);

        $validated['updated_by'] = auth()->id();

        $routeModel->update($validated);

        return redirect()->route('transport-routes.index')->with('success', 'Route updated successfully!');
    }

    public function destroy(Route $routeModel)
    {
        $isUsedInDrivers = \App\Models\Driver::where('route', $routeModel->id)->exists();

        $isUsedInContainers = \App\Models\Container::where('route_id', $routeModel->id)->exists();

        if ($isUsedInDrivers || $isUsedInContainers) {
            return redirect()
                ->route('transport-routes.index')
                ->with('error', 'This route is already in use and cannot be deleted.');
        }

        $routeModel->delete();

        return redirect()
            ->route('transport-routes.index')
            ->with('success', 'Route deleted successfully!');
    }

}
