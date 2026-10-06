<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
 
    public function index()
    {
        $users = User::whereHas('roles', function ($query) {
            $query->whereNotIn('name', ['Customer', 'Driver']);
        })->with('roles')->paginate(config('common.paginate_per_page'));
    
        foreach ($users as $user) {
            $user->role = $user->roles->first()->name ?? null;
        }
    
        return Inertia::render('Users/Index', [
            'users' => $users,
            'pageTitle' => 'Users'
        ]);
    }


    public function create()
    {
        return Inertia::render('Users/Form',[
            'roles' => $this->getAvailableRoles(),
            'pageTitle' => 'Create User'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed', 
            'role' => 'required|string|in:' . implode(',', $this->getAvailableRoles()),

        ]);

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'created_by' => auth()->id(),
        ]);

        $user->syncRoles([$request->role]); 

        return redirect()->route('users.index')->with('success', 'User created successfully!');
    }

    public function edit(User $user)
    {
        $user->load('roles');
        $user->role = $user->roles->first()->name ?? null; 

        return Inertia::render('Users/Form', [
            'user' => $user,
            'roles' => $this->getAvailableRoles(),
            'pageTitle' => 'Edit User'
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|string|in:' . implode(',', $this->getAvailableRoles()),
        ]);

        // Update the user details
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'updated_by' => auth()->id(),
        ]);

        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        $user->syncRoles([$request->role]); 

        return redirect()->route('users.index')->with('success', 'User updated successfully!');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully!');
    }

    private function getAvailableRoles()
    {
        return Role::whereNotIn('name', ['Customer', 'Driver'])
            ->pluck('name')
            ->toArray();
    }

}
