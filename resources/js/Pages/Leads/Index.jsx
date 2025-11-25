import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { Link, Table, Modal, ButtonIcon } from '../../components';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Index = ({ leads, statuses=[], pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const [isModalOpen, setModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);

    const canCreate = userPermissions.includes('Create Leads');
    const canEdit = userPermissions.includes('Edit Leads');
    const canDelete = userPermissions.includes('Delete Leads');

    const columns = React.useMemo(() => [
        {header: "Booking ID",field: "booking_id"},
        { header: "Customer Name", field: "customer.name" },
        {
            header: "Mode",
            field: "mode",
            render: row => (
                <span className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-600">
                    {row.mode}
                </span>
            )
        },
        { header: "ETA", field: "eta" },
        { header: "No. of Containers", field: "containers" },
        { header: "Free Days", field: "free_day" },
        {
            header: "Status",
            field: 'status',
            render: (row) => {
                const status = statuses.find(s => s.value === row.status);
                return status ? status.label : row.status;
            },
        },
    ], []);

    const handleDeleteClick = useCallback((id) => {
        setLeadToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (leadToDelete) {
            Inertia.delete(`/leads/${leadToDelete}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setLeadToDelete(null);
                },
            });
        }
    }, [leadToDelete]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canEdit && (
                <ButtonIcon
                    href={`/leads/${rowId}/edit`}
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
            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
                {canCreate && (
                    <Link href="/leads/create">+ New Lead</Link>
                )}
            </div>

            {/* Table */}
            <div className="px-6">
                <Table
                    columns={columns}
                    tableData={leads}
                    onPageChange={(page) =>
                        Inertia.get(`/leads?page=${page}`, { preserveState: true })
                    }
                    actions={(row) => <RowActions rowId={row.id} />}
                />
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this lead?"
                buttonText="Delete"
            />
        </div>
    );
};

export default Index;
