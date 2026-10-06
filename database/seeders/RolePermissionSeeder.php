<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [

            ['name' => 'View Roles', 'route' => 'roles.index'],
            ['name' => 'Create Roles', 'route' => 'roles.create'],
            ['name' => 'Edit Roles', 'route' => 'roles.edit'],
            ['name' => 'Delete Roles', 'route' => 'roles.destroy'],

            ['name' => 'View Users', 'route' => 'users.index'],
            ['name' => 'Create Users', 'route' => 'users.create'],
            ['name' => 'Edit Users', 'route' => 'users.edit'],
            ['name' => 'Delete Users', 'route' => 'users.destroy'],

            ['name' => 'View Customers', 'route' => 'customers.index'],
            ['name' => 'Create Customers', 'route' => 'customers.create'],
            ['name' => 'Edit Customers', 'route' => 'customers.edit'],
            ['name' => 'Delete Customers', 'route' => 'customers.destroy'],

            ['name' => 'View Drivers', 'route' => 'drivers.index'],
            ['name' => 'Create Drivers', 'route' => 'drivers.create'],
            ['name' => 'Edit Drivers', 'route' => 'drivers.edit'],
            ['name' => 'Delete Drivers', 'route' => 'drivers.destroy'],

            ['name' => 'View Trucks', 'route' => 'trucks.index'],
            ['name' => 'Create Trucks', 'route' => 'trucks.create'],
            ['name' => 'Edit Trucks', 'route' => 'trucks.edit'],
            ['name' => 'Delete Trucks', 'route' => 'trucks.destroy'],

            ['name' => 'View Routes', 'route' => 'transport-routes.index'],
            ['name' => 'Create Routes', 'route' => 'transport-routes.create'],
            ['name' => 'Edit Routes', 'route' => 'transport-routes.edit'],
            ['name' => 'Delete Routes', 'route' => 'transport-routes.destroy'],

            ['name' => 'View Leads', 'route' => 'leads.index'],
            ['name' => 'Create Leads', 'route' => 'leads.create'],
            ['name' => 'Edit Leads', 'route' => 'leads.edit'],
            ['name' => 'Delete Leads', 'route' => 'leads.destroy'],

            ['name' => 'View Jobs', 'route' => 'jobs.index'],
            ['name' => 'Create Jobs', 'route' => 'jobs.create'],
            ['name' => 'Edit Jobs', 'route' => 'jobs.edit'],
            ['name' => 'Delete Jobs', 'route' => 'jobs.destroy'],

            ['name' => 'View Trips', 'route' => 'trips.index'],
            ['name' => 'Create Trips', 'route' => 'trips.create'],
            ['name' => 'Edit Trips', 'route' => 'trips.edit'],
            ['name' => 'Delete Trips', 'route' => 'trips.destroy'],

            ['name' => 'View Charges', 'route' => 'charges.index'],
            ['name' => 'Create Charges', 'route' => 'charges.create'],
            ['name' => 'Edit Charges', 'route' => 'charges.edit'],
            ['name' => 'Delete Charges', 'route' => 'charges.destroy'],

            ['name' => 'View Activity Log', 'route' => 'activity-log.index'],
            ['name' => 'Create Activity Log', 'route' => 'activity-log.create'],
            ['name' => 'Edit Activity Log', 'route' => 'activity-log.edit'],
            ['name' => 'Delete Activity Log', 'route' => 'activity-log.destroy'],

            ['name' => 'View Trip Progress', 'route' => 'trip-progress.index'],
            ['name' => 'Create Trip Progress', 'route' => 'trip-progress.create'],
            ['name' => 'Edit Trip Progress', 'route' => 'trip-progress.edit'],
            ['name' => 'Delete Trip Progress', 'route' => 'trip-progress.destroy'],

            ['name' => 'View POD Upload', 'route' => 'pod-upload.index'],
            ['name' => 'Create POD Upload', 'route' => 'pod-upload.create'],
            ['name' => 'Edit POD Upload', 'route' => 'pod-upload.edit'],
            ['name' => 'Delete POD Upload', 'route' => 'pod-upload.destroy'],

            ['name' => 'View Incoming Shipment Tracking', 'route' => 'incoming-shipment-tracking.index'],
            ['name' => 'Export Incoming Shipment Tracking', 'route' => 'incoming-shipment-tracking.export'],

        ];

        
        foreach ($permissions as $perm) {
            Permission::firstOrCreate([
                'name' => $perm['name'],
                'guard_name' => 'web',
            ])->update(['route' => $perm['route']]);
        }

        // Assign specific permissions to the agent role
        $adminPermissions = [
            'View Roles', 'Create Roles', 'Edit Roles', 'Delete Roles',
            'View Users', 'Create Users', 'Edit Users', 'Delete Users',
            'View Customers', 'Create Customers', 'Edit Customers', 'Delete Customers',
            'View Drivers', 'Create Drivers', 'Edit Drivers', 'Delete Drivers',
            'View Trucks', 'Create Trucks', 'Edit Trucks', 'Delete Trucks',
            'View Routes', 'Create Routes', 'Edit Routes', 'Delete Routes',
            'View Leads', 'Create Leads', 'Edit Leads', 'Delete Leads',
            'View Jobs', 'Create Jobs', 'Edit Jobs', 'Delete Jobs',
            'View Trips', 'Create Trips', 'Edit Trips', 'Delete Trips',
            'View Charges', 'Create Charges', 'Edit Charges', 'Delete Charges',
            'View Activity Log', 'Create Activity Log', 'Edit Activity Log', 'Delete Activity Log',
            'View Trip Progress', 'Create Trip Progress', 'Edit Trip Progress', 'Delete Trip Progress',
            'View POD Upload', 'Create POD Upload', 'Edit POD Upload', 'Delete POD Upload',
            'View Incoming Shipment Tracking','Export Incoming Shipment Tracking'
        ];
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->syncPermissions($adminPermissions);

        $customerRole = Role::firstOrCreate(['name' => 'Customer']);
        $driverRole = Role::firstOrCreate(['name' => 'Driver']);
    }
}
