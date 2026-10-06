import React, { useState, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { Table, ButtonIcon, Input, Button, Select } from "../../components";
import { FaEye } from "react-icons/fa";
import { formatDateDMY } from "@/utils/dateFormat";

const IncomingShipmentTrackingIndex = ({ containers,container_types,bl_statuses,free_day_types,incoming_report_calculated_by, pageTitle, filters: initialFilters = {} }) => {

    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const canView = userPermissions.includes("View Incoming Shipment Tracking");
    const canExport = userPermissions.includes("Export Incoming Shipment Tracking");

    const [filters, setFilters] = useState({
        master_bl_number: initialFilters.master_bl_number || "",
        house_bl_number: initialFilters.house_bl_number || "",
        customer: initialFilters.customer || "",

        demurrage_remain: initialFilters.demurrage_remain || "",
        demurrage_over: initialFilters.demurrage_over || "",
        detention_remain: initialFilters.detention_remain || "",
        detention_over: initialFilters.detention_over || "",

        calculated_by: initialFilters.calculated_by || "1",
    });

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = () => {
        Inertia.post("/incoming-shipment-tracking/filter", filters, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        const resetFilters = {
            master_bl_number: "",
            house_bl_number: "",
            customer: "",
            demurrage_remain: "",
            demurrage_over: "",
            detention_remain: "",
            detention_over: "",
            calculated_by:"1",
        };

        setFilters(resetFilters);

        Inertia.get("/incoming-shipment-tracking", {}, {
            preserveState: true
        });
    };

    const handleExport = () => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/incoming-shipment-tracking/export";

        const csrf = document.querySelector('meta[name="csrf-token"]').content;

        const token = document.createElement("input");
        token.type = "hidden";
        token.name = "_token";
        token.value = csrf;
        form.appendChild(token);

        Object.keys(filters).forEach(key => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = filters[key];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    };

    const columns = useMemo(() => [
        { header: "Customer Name", field: "job.customer.name" },
        { header: "Master BL No.", field: "job.master_bl_number" },
        { header: "House BL Number", field: "job.house_bl_number" },
        { header: "Container No.", field: "container_no" },
        { header: "Container Type", render: (row) => {
                const type = container_types.find(s => s.value === row.container_type);
                return type ? type.label : row.container_type;
            },
        },
        { header: "BL Status", render: (row) => {
                const status = bl_statuses.find(s => s.value === row.job.bl_status);
                return status ? status.label : row.job.bl_status;
            },
        },

        { header: "ATA", field: "arrival_date",render: row => formatDateDMY(row.arrival_date) },
        { header: "ETA", field: "job.eta",render: row => formatDateDMY(row.job.eta) },
        { header: "Approved Demurrage Free Days", field: "demurrage_free_day" },
        { header: "Approved Detention Free Days", field: "detention_free_day" },
        { header: "Free Day Type", render: (row) => {
                const status = free_day_types.find(s => s.value === row.job.free_day_type);
                return status ? status.label : row.job.free_day_type;
            },
        },

        { header: "Demurrage End Day", field: "cal_demurrage_last_date",render: row => formatDateDMY(row.cal_demurrage_last_date) },
        { header: "Detention End Day", field: "cal_detention_last_date",render: row => formatDateDMY(row.cal_detention_last_date) },
        {
            header: "Demurrage Remain Free day (Alert)",
            render: (row) => (
                row.demurrage_remain > 0
                    ? <span className="text-red-700 font-bold">{row.demurrage_remain} Days Remain</span>
                    : "-"
            )
        },
        {
            header: "Detention Remain Free day (Alert)",
            render: (row) => (
                row.detention_remain > 0
                    ? <span className="text-red-700 font-bold">{row.detention_remain} Days Remain</span>
                    : "-"
            )
        },
        {
            header: "Demurrage Over day (Alert)",
            render: (row) =>
                row.demurrage_over > 0
                    ? <span className="text-red-700 font-bold">{row.demurrage_over} Days Over</span>
                    : "-"
        },

        {
            header: "Detention Over day (Alert)",
            render: (row) =>
                row.detention_over > 0
                    ? <span className="text-red-700 font-bold">{row.detention_over} Days Over</span>
                    : "-"
        },

    ], []);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canView && (
                <ButtonIcon
                    href={`/incoming-shipment-tracking/${rowId}`}
                    icon={<FaEye />}
                    tooltip="View"
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

            {/* HEADER */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
            </div>

            {/* FILTER */}
            <div className="px-6">
                <div className="bg-white p-4 rounded shadow-sm space-y-4">

                    {/* ROW 1 */}
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Master BL
                            </label>
                            <Input
                                name="master_bl_number"
                                value={filters.master_bl_number}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                House BL
                            </label>
                            <Input
                                name="house_bl_number"
                                value={filters.house_bl_number}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Calculated By
                            </label>
                            <Select
                                name="calculated_by"
                                value={filters.calculated_by}
                                onChange={handleFilterChange}
                                options={incoming_report_calculated_by}
                                className="flex-shrink-0"
                            />
                        </div>
                    </div>

                    {/* ROW 2 */}
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Demurrage Remain Free day (Alert)
                            </label>
                            <Input
                                type="number"
                                name="demurrage_remain"
                                value={filters.demurrage_remain}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Demurrage Over day (Alert)
                            </label>
                            <Input
                                type="number"
                                name="demurrage_over"
                                value={filters.demurrage_over}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* ROW 3 */}
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Detention Remain Free day (Alert)
                            </label>
                            <Input
                                type="number"
                                name="detention_remain"
                                value={filters.detention_remain}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Detention Over day (Alert)
                            </label>
                            <Input
                                type="number"
                                name="detention_over"
                                value={filters.detention_over}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleSearch} className="bg-blue-600 text-white">
                            Search
                        </Button>

                        <Button onClick={handleReset} className="bg-gray-400 text-white">
                            Reset
                        </Button>

                        {canExport && (
                            <Button
                                onClick={handleExport}
                                className="bg-green-600 text-white"
                            >
                                Export Excel
                            </Button>
                        )}
                    </div>

                </div>
            </div>

            {/* TABLE */}
            <div className="px-6 mt-4">
                <Table
                    columns={columns}
                    tableData={containers} 
                    onPageChange={(page) =>
                        Inertia.get("/incoming-shipment-tracking", { ...filters, page }, {
                            preserveState: true
                        })
                    }
                    actions={(row) => <RowActions rowId={row.container_id} />} 
                />
            </div>
        </div>
    );
};

export default IncomingShipmentTrackingIndex;