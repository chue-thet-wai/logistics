import React, { useState, useCallback } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { Link, Table, Modal, ButtonIcon } from "../../components";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const AssignDriverIndex = ({ jobs, statuses=[], categories=[], pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    // Permission checks
    const canCreate = userPermissions.includes("Create Jobs");
    const canEdit = userPermissions.includes("Edit Jobs");
    const canDelete = userPermissions.includes("Delete Jobs");
    const canView = userPermissions.includes("View Jobs");

    // Modal state
    const [isModalOpen, setModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);

    // Table Columns
    const columns = React.useMemo(() => [
        { header: "Shipment ID", field: "shipment_id" },
        { header: "Booking ID", field: "booking_id" },
        { header: "Customer", field: "lead.customer.name" },
        { header: "Mode", field: "mode" },
        { header: "ETA", field: "eta" },
        {
            header: "Category",
            field: 'category',
            render: (row) => {
                const category = categories.find(s => s.value === row.category);
                return category ? category.label : row.category;
            },
        },
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

    // Delete modal logic
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

    // Row Actions
    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canView && (
                <ButtonIcon
                    href={`/assign-driver/${rowId}`}
                    icon={<FaEye />}
                    tooltip="View"
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon"
                    size="lg"
                    shadow
                />
            )}
            {canEdit && (
                <ButtonIcon
                    href={`/assign-driver/${rowId}/edit`}
                    icon={<FaEdit />}
                    tooltip="Edit"
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon"
                    size="lg"
                    shadow
                />
            )}
            {canDelete && (
                <ButtonIcon
                    onClick={() => handleDeleteClick(rowId)}
                    icon={<FaTrash />}
                    tooltip="Delete"
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon"
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

export default AssignDriverIndex;
