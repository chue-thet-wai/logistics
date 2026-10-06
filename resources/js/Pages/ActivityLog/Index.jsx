import React, { useState, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { Table, ButtonIcon, Input, Select, Button } from "../../components";
import { FaEye } from "react-icons/fa";

const ActivityLogIndex = ({ trips, statuses = [], pageTitle }) => {
  const { props } = usePage();
  const userPermissions = props.auth?.permissions || [];
  const canView = userPermissions.includes("View Activity Log");

  // FILTER STATE
  const [filters, setFilters] = useState({
    trip_id: "",
    truck_number: "",
    driver: "",
    status: "",
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    Inertia.post("/activity-log/filter", filters, { preserveState: true, replace: true });
  };

  const handleReset = () => {
    setFilters({ trip_id: "",truck_number: "", driver: "", status: "" });
    Inertia.get("/activity-log", {}, { preserveState: true });
  };

  // COLUMNS
  const columns = useMemo(
    () => [
      { header: "Trip ID", field: "trip_id" },
      {
        header: "Driver",
        render: (row) => row.driver?.name || "-",
      },
      {
        header: "Truck",
        render: (row) => row.truck?.truck_number || "-",
      },
      {
        header: "Containers",
        render: (row) => row.containers?.length || 0,
      },
      {
        header: "Status",
        field: "status",
        render: (row) => {
          const status = statuses.find((s) => s.value === row.status);
          return status ? status.label : row.status;
        },
      },
    ],
    [statuses]
  );

  const RowActions = ({ rowId }) => (
    <div className="flex items-center space-x-2">
      {canView && (
        <ButtonIcon
          href={`/activity-log/${rowId}`}
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

      {/* Header */}
      <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
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
      <div className="px-6 mt-4">
        <Table
          columns={columns}
          tableData={trips}
          onPageChange={(page) =>
            Inertia.get("/activity-log", { ...filters, page }, { preserveState: true })
          }
          actions={(row) => <RowActions rowId={row.trip_id} />}
        />
      </div>
    </div>
  );
};

export default ActivityLogIndex;