<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;

class CheckPermission
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            abort(403, 'Unauthorized action.');
        }

        $routeName = $request->route()->getName();
        Log::info($routeName);

        $permission = Permission::where('route', $routeName)->first();

        if (!$permission) {
            if (str_ends_with($routeName, '.store')) {
                $permission = Permission::where('route', str_replace('.store', '.create', $routeName))->first();
            } elseif (str_ends_with($routeName, '.import') || str_ends_with($routeName, '.import_format')) {
                $permission = Permission::where('route', str_replace('.import', '.create', $routeName))->first();
            } elseif (str_ends_with($routeName, '.import-format')) {
                $permission = Permission::where('route', str_replace('.import-format', '.create', $routeName))->first();
            }elseif (str_ends_with($routeName, '.import_submit')) {
                $permission = Permission::where('route', str_replace('.import_submit', '.create', $routeName))->first();
            } elseif (str_ends_with($routeName, '.update')) {
                $permission = Permission::where('route', str_replace('.update', '.edit', $routeName))->first();
            } else if (str_ends_with($routeName,'.expiry')) {
                //$permission = Permission::where('route', str_replace('.expiry', '.index', $routeName))->first();
                return $next($request);
            } else if (str_ends_with($routeName,'.new')) {
                //$permission = Permission::where('route', str_replace('.new', '.index', $routeName))->first();
                return $next($request);
            }else if (str_ends_with($routeName,'.show')) {
                return $next($request);
            } else if (str_ends_with($routeName,'.filter')) {
                return $next($request);
            }
        }
        log::info($permission);

        if (!$permission || !Auth::user()->can($permission->name)) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
