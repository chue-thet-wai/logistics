import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Button } from "../../components";

const AssignDriverEdit = ({ job, drivers, categories = [], pageTitle }) => {
    const [driverId, setDriverId] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        Inertia.post(`/assign-driver/${job.id}`, {
            driver_id: driverId,
            _method: "PUT"
        });
    };

    const getCategoryLabel = (value) => {
        const found = categories.find((c) => c.value === Number(value));
        return found ? found.label : "-";
    };

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <p className="text-sm">
                    <strong>Shipment ID:</strong> {job.shipment_id} |
                    <strong> Customer:</strong> {job.lead?.customer?.name} |
                    <strong> Category:</strong> {getCategoryLabel(job.category)}
                </p>
                <Link href="/assign-driver">Back to List</Link>
            </div>

            {/* Driver Table */}
            <div className="bg-white rounded-xl shadow p-5 m-6">
                <h2 className="font-semibold text-lg mb-4">Select Driver</h2>

                {/* FORM STARTS HERE */}
                <form onSubmit={handleSubmit}>
                    <div className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-6 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">
                            <div>Driver</div>
                            <div>Truck No</div>
                            <div>Vehicle Type</div>
                            <div>Availability</div>
                            <div>Last Trip</div>
                            <div>Action</div>
                        </div>

                        {drivers.map((d) => {
                            const isSelected = driverId === d.id;

                            const statusLabel = d.available ? "Available" : "Busy";
                            const statusColor = d.available
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-red-100 text-red-700 border-red-300";

                            return (
                                <div
                                    key={d.id}
                                    className="grid grid-cols-6 px-4 py-3 border-b items-center text-sm"
                                >
                                    <div>{d.user?.name}</div>
                                    <div>{d.truck_number ?? "-"}</div>
                                    <div>{d.vehicle_type ?? "-"}</div>

                                    {/* Availability */}
                                    <div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs border ${statusColor}`}
                                        >
                                            {statusLabel}
                                        </span>
                                    </div>

                                    <div>{d.last_trip ?? "-"}</div>

                                    <div>
                                        <Button
                                            type="button"
                                            onClick={() => setDriverId(d.id)}
                                            className={`
                                                px-4 py-1 rounded-lg text-white 
                                                ${isSelected ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"}
                                            `}
                                            disabled={!d.available}
                                        >
                                            {d.available
                                                ? isSelected
                                                    ? "Selected"
                                                    : "Assign"
                                                : "Busy"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="text-right mt-4">
                        <Button
                            type="submit"
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                            disabled={!driverId}
                        >
                            Save Assignment
                        </Button>
                    </div>
                </form>
                {/* FORM END */}
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl shadow p-5 m-6">
                <h2 className="text-lg font-semibold mb-3">Activity Log</h2>
                <div className="text-sm space-y-1"></div>
            </div>
        </div>
    );
};

export default AssignDriverEdit;
