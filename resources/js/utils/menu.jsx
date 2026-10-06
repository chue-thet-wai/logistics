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
            { name: 'Routes',  route: 'transport-routes', permission: 'View Routes' },
            { name: 'Drivers', route: 'drivers', permission: 'View Drivers' },
            { name: 'Truck', route: 'trucks', permission: 'View Trucks' },
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
    },
    {
        title: 'Truck Assign',
        icon: "/assets/images/menu/lead.png", 
        route: 'trips',
    },
    {
        title: 'Charges',
        icon: "/assets/images/menu/charges.png", 
        route: 'charges',
    },
    {
        title: 'Logs / Activity',
        icon: "/assets/images/menu/log.png", 
        route: 'activity-log',
    },
    {
        title: 'Trip Progress',
        icon: "/assets/images/menu/tripprogress.png", 
        route: 'trip-progress',
    },
    {
        title: 'POD & Document Upload',
        icon: "/assets/images/menu/podupload.png", 
        route: 'pod-upload',
    },
    {
        title: 'Incoming Shipment Tracking',
        icon: "/assets/images/menu/incoming-shipment-tracking.png", 
        route: 'incoming-shipment-tracking',
    }
];
