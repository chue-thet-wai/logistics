import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Link, Table, Modal, ButtonIcon } from '../../components';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { usePage } from '@inertiajs/inertia-react';
import { usePermissions } from '../../utils/usePermissions';

const RoutesIndex = ({ routes, statuses=[], pageTitle}) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const [isModalOpen, setModalOpen] = useState(false);
    const [routeToDelete, setRouteToDelete] = useState(null);

    const { checkMenuPermissions } = usePermissions(userPermissions);
    const { canCreate, canEdit, canDelete } = checkMenuPermissions('Customers');

    const handleDeleteClick = useCallback((id) => {
        setRouteToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (routeToDelete) {
            Inertia.delete(`/transport-routes/${routeToDelete}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setRouteToDelete(null);
                },
            });
        }
    }, [routeToDelete]);
   
    const columns = React.useMemo(() => [
        { header: "Name", field: 'name' },
        { header: "Total Distance", field: 'total_distance' },
        { header: "Estimate Duration", field: 'estimate_duration' },
        { header: "Checkpoints", field: 'checkpoints_count' },
        {
            header: "Status",
            field: 'status',
            render: (row) => {
                const status = statuses.find(s => s.value === row.status);
                return status ? status.label : row.status;
            },
        },
    ]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            <ButtonIcon
                href={`/transport-routes/${rowId}/edit`}
                icon={<FaEdit />}
                iconColor="text-gray-500"
                hoverColor="hover:text-gray-700"
                variant="icon" 
                tooltip="Edit"
                size="lg"
                shadow={true}
            />
            <ButtonIcon
                onClick={() => handleDeleteClick(rowId)}
                icon={<FaTrash />}
                iconColor="text-gray-500"
                hoverColor="hover:text-gray-700"
                variant="icon" 
                tooltip="Delete"
                size="lg"
                shadow={true}
            />
        </div>
    );

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
                {canCreate && (
                    <Link href="/transport-routes/create">+ New Route</Link>
                )}
            </div>

            <div className="px-6">
                <Table
                    columns={columns}
                    tableData={routes}
                    onPageChange={(page) => {
                        Inertia.get(`/transport-routes?page=${page}`, { preserveState: true });
                    }}
                    actions={(row) => <RowActions rowId={row.id} />}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this route?"
                buttonText="Delete"
            />
        </div>
    );
};

export default RoutesIndex;
