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
            ->latest()
            ->paginate(config('common.paginate_per_page'));

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'statuses' => config('common.statuses'),
            'customer_types' => config('common.customer_types'),
            'pageTitle' => 'Customers',
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Form', [
            'statuses' => config('common.statuses'),
            'customer_types' => config('common.customer_types'),
            'pageTitle' => 'Create Customer',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            // Basic info
            'cus_id' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'customer_type' => 'integer',
            'status' => 'integer',

            // Contact details
            'contact_person' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'secondary_phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',

            // Billing
            'billing_address' => 'nullable|string|max:255',
            'billing_country' => 'nullable|string|max:100',
            'billing_state' => 'nullable|string|max:100',
            'billing_city' => 'nullable|string|max:100',
            'billing_zip' => 'nullable|string|max:20',

            // Shipping
            'shipping_address' => 'nullable|string|max:255',
            'shipping_country' => 'nullable|string|max:100',
            'shipping_state' => 'nullable|string|max:100',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_zip' => 'nullable|string|max:20',

            // Financial
            'credit_limit' => 'nullable|numeric',
            'currency' => 'nullable|string|max:10',
            'payment_terms' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:100',
            'invoice_email' => 'nullable|email',

            // Notes
            'notes' => 'nullable|string',
        ]);

        // Create linked user account
        $user = User::create([
            'name'  => $request->name,
            'email' => $request->email,
            'password' => Hash::make('customer'),
            'created_by' => auth()->id(),
        ]);

        $user->assignRole('Customer');

        $cus_id = generateUniqueId('customers', 'cus_id');

        // Create customer
        Customer::create(array_merge(
            $request->all(),
            [
                'user_id' => $user->id,
                'cus_id' => $cus_id,
                'created_by' => auth()->id(),
            ]
        ));

        return redirect()->route('customers.index')
            ->with('success', 'Customer created successfully!');
    }

    public function edit(Customer $customer)
    {
        $customer->load('user');

        return Inertia::render('Customers/Form', [
            'customer' => $customer,
            'statuses' => config('common.statuses'),
            'customer_types' => config('common.customer_types'),
            'pageTitle' => 'Edit Customer',
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $request->validate([
            // Basic info
            'name' => 'required|string|max:255',
            'customer_type' => 'integer',
            'status' => 'integer',

            // Contact
            'contact_person' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,' . $customer->user_id,
            'phone' => 'nullable|string|max:20',
            'secondary_phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',

            // Billing
            'billing_address' => 'nullable|string|max:255',
            'billing_country' => 'nullable|string|max:100',
            'billing_state' => 'nullable|string|max:100',
            'billing_city' => 'nullable|string|max:100',
            'billing_zip' => 'nullable|string|max:20',

            // Shipping
            'shipping_address' => 'nullable|string|max:255',
            'shipping_country' => 'nullable|string|max:100',
            'shipping_state' => 'nullable|string|max:100',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_zip' => 'nullable|string|max:20',

            // Financial
            'credit_limit' => 'nullable|numeric',
            'currency' => 'nullable|string|max:10',
            'payment_terms' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:100',
            'invoice_email' => 'nullable|email',

            // Notes
            'notes' => 'nullable|string',
        ]);

        // Update linked user
        $customer->user->update([
            'name' => $request->name,
            'email' => $request->email,
            'updated_by' => auth()->id(),
        ]);

        // Update customer
        $customer->update(array_merge(
            $request->all(),
            [
                'updated_by' => auth()->id(),
            ]
        ));

        return redirect()->route('customers.index')
            ->with('success', 'Customer updated successfully!');
    }

    public function destroy(Customer $customer)
    {
        if ($customer->leads()->exists()) {
            return back()->with('error', 'Cannot delete! Customer is used in leads.');
        }

        $user = $customer->user;

        $customer->forceDelete();

        if ($user) {
            $user->delete();
        }

        return back()->with('success', 'Customer deleted successfully!');
    }
}
