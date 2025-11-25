import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Link, Table, Modal, ButtonIcon } from '../../components';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { usePage } from '@inertiajs/inertia-react';

const Index = ({ drivers, pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const [isModalOpen, setModalOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);

    const canCreate = userPermissions.includes('Create Drivers');
    const canEdit = userPermissions.includes('Edit Drivers');
    const canDelete = userPermissions.includes('Delete Drivers');

    const columns = React.useMemo(() => [
        { header: "Driver ID", field: 'driver_id' },
        { header: "Name", field: 'name' },
        { header: "Email", field: 'email' },
        { header: "Phone", field: 'phone' },
    ], []);

    const handleDeleteClick = useCallback((id) => {
        setDriverToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (driverToDelete) {
            Inertia.delete(`/drivers/${driverToDelete}`, {
                onSuccess: () => { setModalOpen(false); setDriverToDelete(null); },
            });
        }
    }, [driverToDelete]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canEdit && (
                <ButtonIcon
                    href={`/drivers/${rowId}/edit`}
                    icon={<FaEdit />}
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon" 
                    tooltip="Edit"
                    size="lg"
                    shadow
                />
            )}
            {canDelete && (
                <ButtonIcon
                    onClick={() => handleDeleteClick(rowId)}
                    icon={<FaTrash />}
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon" 
                    tooltip="Delete"
                    size="lg"
                    shadow
                />
            )}
        </div>
    );

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
                {canCreate && (
                    <Link href="/drivers/create">+ New Driver</Link>
                )}
            </div>

            <div className='px-6'>
                <Table
                    columns={columns}
                    tableData={drivers}
                    onPageChange={(page) => { Inertia.get(`/drivers?page=${page}`, { preserveState: true }); }}
                    actions={(row) => <RowActions rowId={row.id} />}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this driver?"
                buttonText="Delete"
            />
        </div>
    );
};

export default Index;
