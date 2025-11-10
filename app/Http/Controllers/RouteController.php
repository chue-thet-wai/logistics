<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RouteController extends Controller
{
    public function index()
    {
        $routes = Route::paginate(config('common.paginate_per_page'));

        return Inertia::render('Routes/Index', [
            'routes' => $routes,
            'pageTitle' => 'Routes',
        ]);
    }

    public function create()
    {
        return Inertia::render('Routes/Form', [
            'pageTitle' => 'Create Route',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $validated['created_by'] = auth()->id();

        Route::create($validated);

        return redirect()->route('routes.index')->with('success', 'Route created successfully!');
    }

    public function edit(Route $route)
    {
        return Inertia::render('Routes/Form', [
            'route' => $route,
            'pageTitle' => 'Edit Route',
        ]);
    }

    public function update(Request $request, Route $route)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $validated['updated_by'] = auth()->id();

        $route->update($validated);

        return redirect()->route('routes.index')->with('success', 'Route updated successfully!');
    }

    public function destroy(Route $route)
    {
        $route->delete();

        return redirect()->route('routes.index')->with('success', 'Route deleted successfully!');
    }
}
