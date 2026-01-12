import React from 'react';
import AdminMain from './AdminMain';
import AdminGuest from './AdminGuest';
import { usePage } from '@inertiajs/inertia-react';
import DriverMain from './DriverMain';

const AppLayout = ({ children }) => {
    const { auth } = usePage().props;

    if (!auth || !auth.user) {
        return <AdminGuest>{children}</AdminGuest>;
    }

    const user = auth.user;
    console.log(user);

    if (user.role === 'Driver') {
        return <DriverMain>{children}</DriverMain>;
    }


    return <AdminMain>{children}</AdminMain>;
}

export default AppLayout;
