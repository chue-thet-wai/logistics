import React, { useState, useCallback } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { Link, Table, Modal, ButtonIcon, Input, Select, Button } from "../../components";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { formatDateDMY } from "@/utils/dateFormat";

const Index = ({ leads, modes=[],categories=[],statuses=[],pageTitle }) => {
    const { props } = usePage();
    const { flash } = props;
    const userPermissions = props.auth?.permissions || [];

    // Permissions
    const canCreate = userPermissions.includes("Create Leads");
    const canEdit = userPermissions.includes("Edit Leads");
    const canDelete = userPermissions.includes("Delete Leads");
    const canView = userPermissions.includes("View Leads");

    // Modal state
    const [isModalOpen, setModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        master_bl_number: "",
        house_bl_number: "",
        customer: "",
        status: "",
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleSearch = () => {
        Inertia.post("/leads/filter", filters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setFilters({ master_bl_number: "",house_bl_number: "", customer: "", status: "" });
        Inertia.get("/leads", {}, { preserveState: true, replace: true });
    };

    // Table columns
    const columns = React.useMemo(() => [
        { header: "Booking ID", field: "booking_id" },
        { header: "Customer Name", field: "customer.name" },
        { 
            header: "Mode", 
            field: 'mode', 
            render: (row) => { const mode = modes.find(s => s.value === row.mode); return mode ? mode.label : row.mode; 
            }, 
        }, 
        { 
            header: "Cagegory", 
            field: 'Cagegory', 
            render: (row) => { const category = categories.find(s => s.value === row.category); return category ? category.label : row.category; 
            }, 
        },
        { header: "ETA", field: "eta", render: (row) => formatDateDMY(row.eta) },
        { header: "Containers", field: "total_container" },
        { header: "Master BL", field: "master_bl_number" },
        { header: "House BL", field: "house_bl_number" },
        {
            header: "Status",
            field: "status",
            render: (row) => (row.status == 1 ? "Confirmed" : "Pending"),
        },
    ], []);

    // Delete logic
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
            {canView && (
                <ButtonIcon
                    href={`/leads/${rowId}`}
                    icon={<FaEye />}
                    tooltip="View"
                    variant="icon"
                />
            )}
            {canEdit && (
                <ButtonIcon
                    href={`/leads/${rowId}/edit`}
                    icon={<FaEdit />}
                    tooltip="Edit"
                    variant="icon"
                />
            )}
            {canDelete && (
                <ButtonIcon
                    onClick={() => handleDeleteClick(rowId)}
                    icon={<FaTrash />}
                    tooltip="Delete"
                    variant="icon"
                />
            )}
        </div>
    );

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
                {canCreate && <Link href="/leads/create">+ New Lead</Link>}
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
            <div className="px-6">
                <Table
                    columns={columns}
                    tableData={leads}
                    onPageChange={(page) =>
                        Inertia.get("/leads", { ...filters, page }, { preserveState: true })
                    }
                    actions={(row) => <RowActions rowId={row.booking_id} />}
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