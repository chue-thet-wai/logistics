import React, { useState, useCallback } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Table, Modal, ButtonIcon } from "../../components";
import { FaEdit, FaTrash } from "react-icons/fa";

const CheckpointIndex = ({ route, checkpoints, checkpoint_types, pageTitle }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setModalOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            Inertia.delete(`/transport-routes/${route.id}/checkpoints/${deleteId}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setDeleteId(null);
                },
            });
        }
    };

    const columns = [
        { header: "Name", field: "name" },
        {
            header: "Type",
            field: 'type',
            render: (row) => {
                const type = checkpoint_types.find(s => s.value === row.type);
                return type ? type.label : row.type;
            },
        },
        { header: "ETA", field: "eta" },
        { header: "Latitude", field: "latitude" },
        { header: "Longitude", field: "longitude" },
    ];

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">

            <ButtonIcon
                href={`/transport-routes/${route.id}/checkpoints/${rowId}/edit`}
                icon={<FaEdit />}
                tooltip="Edit"
                variant="icon"
                iconColor="text-gray-500"
                hoverColor="hover:text-gray-700"
                size="lg"
            />

            <ButtonIcon
                onClick={() => handleDeleteClick(rowId)}
                icon={<FaTrash />}
                tooltip="Delete"
                variant="icon"
                iconColor="text-gray-500"
                hoverColor="hover:text-gray-700"
                size="lg"
            />
        </div>
    );

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold">{pageTitle}</h1>
                <div>
                    <Link href={`/transport-routes/${route.id}/edit`} className="mx-4">
                        Rotue Detail
                    </Link>
                    <Link href={`/transport-routes/${route.id}/checkpoints/create`}>
                        + Add Checkpoint
                    </Link>
                </div>
            </div>

            <div className="px-6">
                <Table
                    columns={columns}
                    tableData={checkpoints}
                    actions={(row) => <RowActions rowId={row.id} />}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this checkpoint?"
                buttonText="Delete"
            />
        </div>
    );
};

export default CheckpointIndex;
