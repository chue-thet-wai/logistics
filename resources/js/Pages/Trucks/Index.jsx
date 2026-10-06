import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Link, Table, Modal, ButtonIcon } from '../../components';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { usePage } from '@inertiajs/inertia-react';

const Index = ({ trucks, statuses=[], pageTitle }) => {
    const { props } = usePage();
    const { flash } = props;
    const userPermissions = props.auth?.permissions || [];

    const [isModalOpen, setModalOpen] = useState(false);
    const [truckToDelete, setTruckToDelete] = useState(null);

    const canCreate = userPermissions.includes('Create Trucks');
    const canEdit = userPermissions.includes('Edit Trucks');
    const canDelete = userPermissions.includes('Delete Trucks');

    const columns = React.useMemo(() => [
        { header: "Truck Number", field: 'truck_number' },
        { header: "Vehicle Type", field: 'vehicle_type' },
        {
            header: "Status",
            field: 'status',
            render: (row) => {
                const status = statuses.find(s => String(s.value) === String(row.status));
                return status ? status.label : row.status;
            },

        },
    ], []);

    const handleDeleteClick = useCallback((id) => {
        setTruckToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (truckToDelete) {
            Inertia.delete(`/trucks/${truckToDelete}`, {
                onSuccess: () => { setModalOpen(false); setTruckToDelete(null); },
            });
        }
    }, [truckToDelete]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canEdit && (
                <ButtonIcon
                    href={`/trucks/${rowId}/edit`}
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
                    <Link href="/trucks/create">+ New Truck</Link>
                )}
            </div>

            {/* 
            {flash?.success && (
                <div className="mx-6 mt-4 p-3 bg-green-100 text-green-800 rounded">
                    {flash.success}
                </div>
            )}
            */}

            {flash?.error && (
                <div className="mx-6 mt-4 p-3 bg-red-100 text-red-800 rounded">
                    {flash.error}
                </div>
            )}

            <div className='px-6'>
                <Table
                    columns={columns}
                    tableData={trucks}
                    onPageChange={(page) => { Inertia.get(`/trucks?page=${page}`, { preserveState: true }); }}
                    actions={(row) => <RowActions rowId={row.truck_id} />}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this truck?"
                buttonText="Delete"
            />
        </div>
    );
};

export default Index;
