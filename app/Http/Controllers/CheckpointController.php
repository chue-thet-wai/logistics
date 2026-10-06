<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Models\Checkpoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CheckpointController extends Controller
{
    public function index(Route $route)
    {
        $checkpoints = $route->checkpoints()
                        ->orderBy('created_at','desc')
                        ->paginate(config('common.paginate_per_page'));
        return Inertia::render('Checkpoints/Index', [
            'route' => $route,
            'checkpoints' => $checkpoints,
            'checkpoint_types' => config('common.checkpoint_types'),
            'pageTitle' => "Checkpoints for {$route->name}",
        ]);
    }

    public function create(Route $route)
    {
        return Inertia::render('Checkpoints/Form', [
            'checkpoint_types' => config('common.checkpoint_types'),
            'route' => $route,
            'pageTitle' => 'Add Checkpoint',
        ]);
    }

    public function store(Request $request, Route $route)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:50',
            'eta' => 'nullable|string|max:50',
            'latitude' => 'nullable|string|max:50',
            'longitude' => 'nullable|string|max:50',
            'remark' => 'nullable|string',
        ]);
        $checkpointId = generateUniqueId('checkpoints', 'checkpoint_id');
        $validated['checkpoint_id'] = $checkpointId;
        $validated['route_id'] = $route->id;
        $validated['created_by'] = auth()->id();

        Checkpoint::create($validated);

        return redirect()->route('checkpoints.index', $route->id)
            ->with('success', 'Checkpoint created!');
    }

    public function edit(Route $route, Checkpoint $checkpoint)
    {
       
        return Inertia::render('Checkpoints/Form', [
            'checkpoint' => $checkpoint,
            'route' => $route,
            'checkpoint_types' => config('common.checkpoint_types'),
            'pageTitle' => 'Edit Checkpoint',
        ]);
    }

    public function update(Request $request, Route $route, Checkpoint $checkpoint)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:50',
            'eta' => 'nullable|string|max:50',
            'latitude' => 'nullable|string|max:50',
            'longitude' => 'nullable|string|max:50',
            'remark' => 'nullable|string',
        ]);

        $validated['updated_by'] = auth()->id();

        $checkpoint->update($validated);

        return redirect()->route('checkpoints.index', $route->id)
            ->with('success', 'Checkpoint updated!');
    }

    public function destroy(Route $route, Checkpoint $checkpoint)
    {
        $checkpoint->delete();

        return redirect()->route('checkpoints.index', $route->id)
            ->with('success', 'Checkpoint deleted!');
    }
}
