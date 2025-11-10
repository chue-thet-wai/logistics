import React from 'react';
import AdminMain from './AdminMain';
import AdminGuest from './AdminGuest';
import { usePage } from '@inertiajs/inertia-react';

const AppLayout = ({ children }) => {
    const { auth } = usePage().props;

    if (!auth || !auth.user) {
        return <AdminGuest>{children}</AdminGuest>;
    }

    return <AdminMain>{children}</AdminMain>;
}

export default AppLayout;
