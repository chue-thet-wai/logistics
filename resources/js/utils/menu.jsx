import React from 'react';

export const links = [
    {
        title: 'Dashboard',
        icon: "/assets/images/menu/dashboard.png",
        route: 'dashboard',
    },
    {
        title: 'Management',
        icon: "/assets/images/menu/setting.png", 
        links: [
            { name: 'Roles',  route: 'roles', permission: 'View Roles' },
            { name: 'Users',  route: 'users', permission: 'View Users' },
            { name: 'Customers',  route: 'customers', permission: 'View Customers' },
            { name: 'Drivers', route: 'drivers', permission: 'View Drivers' },
            { name: 'Routes',  route: 'routes', permission: 'View Routes' },
        ],
    },
    {
        title: 'New Lead Creation',
        icon: "/assets/images/menu/lead.png", 
        route: 'leads',
    },
    {
        title: 'Job Sheet Creation',
        icon: "/assets/images/menu/lead.png", 
        route: 'jobs',
    }
];
