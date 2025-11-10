<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class RoleController extends Controller
{
    
    public function index()
    {
        $roles = Role::where('name', '!=', 'Customer')->paginate(config('common.paginate_per_page')); 
        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'pageTitle' => 'Roles'
        ]);
    }

    
    public function create()
    {
        $permissions = Permission::all(); 
        return Inertia::render('Roles/Form', [
            'permissions' => $permissions,
            'pageTitle' => 'Create Role'
        ]);
    }

   
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'required|array',  
        ]);
       
        $permissions = array_map('intval', $request->permissions);

        // Create the role
        $role = Role::create(['name' => $request->name]);

        // Assign the selected permissions to the role
        $role->syncPermissions($permissions);

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    public function edit(Role $role)
    {        
        $permissions = Permission::all();  
        
        $role->permissions->pluck('id')->toArray(); 

        return Inertia::render('Roles/Form', [
            'role' => $role,
            'permissions' => $permissions,
            'pageTitle'   => 'Edit Role'
        ]);
    }


    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'required|array', 
        ]);

        $permissions = array_map('intval', $request->permissions);

        $role->update(['name' => $request->name]);

        $role->syncPermissions($request->permissions);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
