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

            ['name' => 'View Routes', 'route' => 'routes.index'],
            ['name' => 'Create Routes', 'route' => 'routes.create'],
            ['name' => 'Edit Routes', 'route' => 'routes.edit'],
            ['name' => 'Delete Routes', 'route' => 'routes.destroy'],

            ['name' => 'View Leads', 'route' => 'leads.index'],
            ['name' => 'Create Leads', 'route' => 'leads.create'],
            ['name' => 'Edit Leads', 'route' => 'leads.edit'],
            ['name' => 'Delete Leads', 'route' => 'leads.destroy'],

            ['name' => 'View Jobs', 'route' => 'jobs.index'],
            ['name' => 'Create Jobs', 'route' => 'jobs.create'],
            ['name' => 'Edit Jobs', 'route' => 'jobs.edit'],
            ['name' => 'Delete Jobs', 'route' => 'jobs.destroy'],

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
            'View Routes', 'Create Routes', 'Edit Routes', 'Delete Routes',
            'View Leads', 'Create Leads', 'Edit Leads', 'Delete Leads',
            'View Jobs', 'Create Jobs', 'Edit Jobs', 'Delete Jobs',
        ];
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->syncPermissions($adminPermissions);

        $customerRole = Role::firstOrCreate(['name' => 'Customer']);
        $driverRole = Role::firstOrCreate(['name' => 'Driver']);
    }
}
