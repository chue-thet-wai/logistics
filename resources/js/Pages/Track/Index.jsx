import React, { useState, useCallback, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { Link, Table, Modal, ButtonIcon, Button, Select, Input } from "../../components";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const TrackIndex = ({ tracks, statuses = [], pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const canCreate = userPermissions.includes("Create Tracks");
    const canEdit = userPermissions.includes("Edit Tracks");
    const canDelete = false;
    const canView = userPermissions.includes("View Tracks");

    const [isModalOpen, setModalOpen] = useState(false);
    const [trackToDelete, setTrackToDelete] = useState(null);

    // FILTER STATE
    const [filters, setFilters] = useState({
        track_id: "",
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
        Inertia.post("/tracks/filter", filters, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setFilters({
            track_id: "",
            truck_number:"",
            driver: "",
            status: ""
        });

        Inertia.get("/tracks");
    };

    const columns = useMemo(() => [
        { header: "Track ID", field: "track_id" },
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
        setTrackToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (trackToDelete) {
            Inertia.delete(`/tracks/${trackToDelete}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setTrackToDelete(null);
                },
            });
        }
    }, [trackToDelete]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canView && (
                <ButtonIcon
                    href={`/tracks/${rowId}`}
                    icon={<FaEye />}
                    tooltip="View"
                />
            )}
            {canEdit && (
                <ButtonIcon
                    href={`/tracks/${rowId}/edit`}
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
                    <Link href="/tracks/create">
                        + New Track
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="px-6 py-4 flex items-center gap-3 flex-wrap md:flex-nowrap">
                <Input
                    type="text"
                    name="track_id"
                    placeholder="Track ID"
                    value={filters.track_id}
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
                    tableData={tracks}
                    onPageChange={(page) =>
                        Inertia.get("/tracks", { ...filters, page }, { preserveState: true })
                    }
                    actions={(row) => <RowActions rowId={row.track_id} />}
                />
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this track?"
                buttonText="Delete"
            />
        </div>
    );
};

export default TrackIndex;