<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CustomerController extends Controller
{

    public function index()
    {
        $customers = Customer::with('user')
            ->paginate(config('common.paginate_per_page'));

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'pageTitle' => 'Customers',
        ]);
    }

    
    public function create()
    {
        return Inertia::render('Customers/Form', [
            'pageTitle' => 'Create Customer',
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

       
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make('customer'),
            'created_by' => auth()->id(),
        ]);

        $user->assignRole('Customer');

        $lastCustomer = Customer::orderBy('id', 'desc')->first();
        $nextId = $lastCustomer ? $lastCustomer->id + 1 : 1;
        $cus_id = 'CUS-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);

        Customer::create([
            'user_id' => $user->id,
            'cus_id' => $cus_id,
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

        return redirect()->route('customers.index')->with('success', 'Customer created successfully!');
    }

    public function edit(Customer $customer)
    {
        $customer->load('user');

        return Inertia::render('Customers/Form', [
            'customer' => $customer,
            'pageTitle' => 'Edit Customer',
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $customer->user_id,
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $user = $customer->user;
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'updated_by' => auth()->id(),
        ]);

        $customer->update([
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

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully!');
    }

    public function destroy(Customer $customer)
    {
        $user = $customer->user;
        $customer->delete();

        if ($user) {
            $user->delete();
        }

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully!');
    }
}
