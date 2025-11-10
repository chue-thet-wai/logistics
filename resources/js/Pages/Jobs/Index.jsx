import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { Link, Table, Modal, ButtonIcon } from '../../components';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Index = ({ jobs, pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const [isModalOpen, setModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);

    const canCreate = userPermissions.includes('Create Jobs');
    const canEdit = userPermissions.includes('Edit Jobs');
    const canDelete = userPermissions.includes('Delete Jobs');

    const columns = React.useMemo(() => [
        {header: "Booking ID",field: "booking_id"},
        { header: "Customer Name", field: "lead.customer.name" },
        {
            header: "Mode",
            field: "mode",
            render: row => (
                <span className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-600">
                    {row.mode}
                </span>
            )
        },
        { header: "ETA", field: "lead.eta" },
        { header: "No. of Containers", field: "lead.containers" },
        { header: "Free Days", field: "lead.free_day" },
    ], []);

    const handleDeleteClick = useCallback((id) => {
        setJobToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (jobToDelete) {
            Inertia.delete(`/jobs/${jobToDelete}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setJobToDelete(null);
                },
            });
        }
    }, [jobToDelete]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canEdit && (
                <ButtonIcon
                    href={`/jobs/${rowId}/edit`}
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
                    <Link href="/jobs/create">+ New Job</Link>
                )}
            </div>

            {/* Table */}
            <div className="px-6">
                <Table
                    columns={columns}
                    tableData={jobs}
                    onPageChange={(page) =>
                        Inertia.get(`/jobs?page=${page}`, { preserveState: true })
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
                message="Are you sure you want to delete this job?"
                buttonText="Delete"
            />
        </div>
    );
};

export default Index;
