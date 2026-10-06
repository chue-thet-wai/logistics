import React, { useState, useCallback, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { Link, Table, Modal, ButtonIcon, Button, Select, Input } from "../../components";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const TripIndex = ({ trips, statuses = [], pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const canCreate = userPermissions.includes("Create Trips");
    const canEdit = userPermissions.includes("Edit Trips");
    const canDelete = false;
    const canView = userPermissions.includes("View Trips");

    const [isModalOpen, setModalOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState(null);

    // FILTER STATE
    const [filters, setFilters] = useState({
        trip_id: "",
        truck_number:"",
        driver: "",
        status: ""
    });

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = () => {
        Inertia.post("/trips/filter", filters, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setFilters({
            trip_id: "",
            truck_number:"",
            driver: "",
            status: ""
        });

        Inertia.get("/trips");
    };

    const columns = useMemo(() => [
        { header: "Trip ID", field: "trip_id" },
        { header: "Truck", field: "truck.truck_number" },
        { header: "Driver", field: "driver.name" },
        {
            header: "Total Container",
            render: (row) => row.containers?.length || 0
        },
        {
            header: "Status",
            field: "status",
            render: (row) => {
                const status = statuses.find(s => s.value === row.status);
                return status ? status.label : row.status;
            },
        },
    ], [statuses]);

    const handleDeleteClick = useCallback((id) => {
        setTripToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (tripToDelete) {
            Inertia.delete(`/trips/${tripToDelete}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setTripToDelete(null);
                },
            });
        }
    }, [tripToDelete]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canView && (
                <ButtonIcon
                    href={`/trips/${rowId}`}
                    icon={<FaEye />}
                    tooltip="View"
                />
            )}
            {canEdit && (
                <ButtonIcon
                    href={`/trips/${rowId}/edit`}
                    icon={<FaEdit />}
                    tooltip="Edit"
                />
            )}
            {canDelete && (
                <ButtonIcon
                    onClick={() => handleDeleteClick(rowId)}
                    icon={<FaTrash />}
                    tooltip="Delete"
                />
            )}
        </div>
    );

    return (
        <div className="container mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b">
                <h1 className="text-lg font-semibold">
                    {pageTitle}
                </h1>

                {canCreate && (
                    <Link href="/trips/create">
                        + New Trip
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="px-6 py-4 flex items-center gap-3 flex-wrap md:flex-nowrap">
                <Input
                    type="text"
                    name="trip_id"
                    placeholder="Trip ID"
                    value={filters.trip_id}
                    onChange={handleFilterChange}
                    className="w-56 mt-4"
                />

                <Input
                    type="text"
                    name="truck_number"
                    placeholder="Truck Number"
                    value={filters.truck_number}
                    onChange={handleFilterChange}
                    className="w-56 mt-4"
                />

                <Input
                    type="text"
                    name="driver"
                    placeholder="Driver"
                    value={filters.driver}
                    onChange={handleFilterChange}
                    className="w-56 mt-4"
                />

                <div className="w-56">
                    <Select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        options={[{ label: "All", value: "" }, ...statuses]}
                        placeholder="All"
                    />
                </div>

                <div className="flex gap-2 ml-auto">
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
                    tableData={trips}
                    onPageChange={(page) =>
                        Inertia.get("/trips", { ...filters, page }, { preserveState: true })
                    }
                    actions={(row) => <RowActions rowId={row.trip_id} />}
                />
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this trip?"
                buttonText="Delete"
            />
        </div>
    );
};

export default TripIndex;