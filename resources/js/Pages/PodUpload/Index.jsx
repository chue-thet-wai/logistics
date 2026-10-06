import React, { useState, useCallback, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { Link, Table, Modal, ButtonIcon, Input, Select, Button } from "../../components";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const JobIndex = ({ jobs, statuses = [], categories = [], modes = [], pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const canEdit = userPermissions.includes("Edit POD Upload");
    const canView = false;
    const canDelete = false;

    // Modal state
    const [isModalOpen, setModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);

    // FILTER STATE
    const [filters, setFilters] = useState({
        master_bl_number: "",
        house_bl_number: "",
        customer: "",
        status: ""
    });

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = () => {
        Inertia.post("pod-upload/filter", filters, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setFilters({
            master_bl_number: "",
            house_bl_number: "",
            customer: "",
            status: ""
        });
        Inertia.get("/pod-upload", {}, { preserveState: true });
    };

    // Table Columns
    const columns = useMemo(() => [
        { header: "Shipment ID", field: "shipment_id" },
        { header: "Booking ID", field: "booking_id" },
        { header: "Customer", field: "customer.name" },
        {
            header: "Mode",
            field: 'mode',
            render: (row) => {
                const mode = modes.find(s => s.value === row.mode);
                return mode ? mode.label : row.mode;
            },
        },
        { header: "ETA", field: "eta" },
        {
            header: "Category",
            field: 'category',
            render: (row) => {
                const category = categories.find(s => s.value === row.category);
                return category ? category.label : row.category;
            },
        },
        { header: "Master BL", field: "master_bl_number" },
        { header: "House BL", field: "house_bl_number" },
        {
            header: "Unassigned Containers",
            field: "pending_containers_count",
            render: (row) =>
                row.status === 0
                ? row.total_container
                : row.pending_containers_count,
        },
        {
            header: "Status",
            field: 'status',
            render: (row) => {
                const status = statuses.find(s => s.value === row.status);
                return status ? status.label : row.status;
            },
        },
    ], [categories, modes, statuses]);

    // Delete modal logic
    const handleDeleteClick = useCallback((id) => {
        setJobToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (jobToDelete) {
            Inertia.delete(`/pod-upload/${jobToDelete}`, {
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
                    href={`/pod-upload/${rowId}`}
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
                    href={`/pod-upload/${rowId}/edit`}
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
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 flex gap-3 items-center bg-white m-4 overflow-x-auto">
                <Input
                    type="text"
                    name="master_bl_number"
                    placeholder="Master BL Number"
                    value={filters.master_bl_number}
                    onChange={handleFilterChange}
                    className="w-56 flex-shrink-0 mt-4"
                />
                <Input
                    type="text"
                    name="house_bl_number"
                    placeholder="House BL Number"
                    value={filters.house_bl_number}
                    onChange={handleFilterChange}
                    className="w-56 flex-shrink-0 mt-4"
                />
                <Input
                    type="text"
                    name="customer"
                    placeholder="Customer"
                    value={filters.customer}
                    onChange={handleFilterChange}
                    className="w-56 flex-shrink-0 mt-4"
                />
                <div className="w-56">
                    <Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        options={[{ label: "All", value: "" }, ...statuses]}
                        placeholder="Status"
                        className="flex-shrink-0"
                    />
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-auto">
                    <Button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Search
                    </Button>
                    <Button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="px-6 mt-4">
                <Table
                    columns={columns}
                    tableData={jobs}
                    onPageChange={(page) =>
                        Inertia.get("/pod-upload", { ...filters, page }, { preserveState: true })
                    }
                    actions={(row) => <RowActions rowId={row.shipment_id} />}
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

export default JobIndex;