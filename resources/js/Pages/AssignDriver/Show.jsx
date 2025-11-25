import React, { useState } from "react";
import { Link } from "@inertiajs/inertia-react";
import { ChevronDown, ChevronRight } from "lucide-react";

// Reusable collapsible card
const CollapsibleCard = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border rounded-xl shadow-sm bg-white mb-4 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex justify-between items-center w-full px-5 py-3 bg-gray-50 hover:bg-gray-100 transition"
            >
                <span className="font-semibold text-gray-700">{title}</span>
                {open ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
            </button>

            {open && <div className="px-5 py-4 border-t">{children}</div>}
        </div>
    );
};

// Safe value fallback
const Field = ({ label, value }) => (
    <div>
        <span className="font-semibold text-gray-600">{label}</span>
        <p className="text-gray-800">{value || "-"}</p>
    </div>
);

const AssignDriverShow = ({ job, pageTitle }) => {
    // driver relation from controller: job.job_driver.driver.user
    const driver = job?.job_driver?.driver;
    const driverUser = driver?.user;

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
                <Link href="/assign-driver" className="text-blue-600 hover:underline">
                    Back to List
                </Link>
            </div>

            {/* Job Information */}
            <CollapsibleCard title="Job Information">
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Shipment ID" value={job.shipment_id} />
                    <Field label="Booking ID" value={job.booking_id} />
                    <Field label="Customer" value={job.lead?.customer?.name} />
                    <Field label="Category" value={job.category} />
                    <Field label="Mode" value={job.mode} />
                    <Field label="ETA" value={job.eta} />
                    <Field label="Origin" value={job.origin} />
                    <Field label="Destination" value={job.destination} />
                    <Field label="BL Number" value={job.bl_number} />
                    <Field label="Free Days" value={job.free_day} />
                </div>
            </CollapsibleCard>

            {/* Driver Information */}
            <CollapsibleCard title="Assigned Driver">
                {driver ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Driver Name" value={driverUser?.name} />
                        <Field label="Phone" value={driverUser?.phone} />
                        <Field label="Vehicle Type" value={driver.vehicle_type} />
                        <Field label="Vehicle Number" value={driver.vehicle_no} />
                        <Field label="License Number" value={driver.license_no} />
                        <Field label="Assigned At" value={job.job_driver?.created_at} />
                    </div>
                ) : (
                    <p className="text-gray-600">No driver assigned.</p>
                )}
            </CollapsibleCard>

            {/* Operational Instructions */}
            <CollapsibleCard title="Operational Instructions">
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Pickup Date" value={job.operational_pickup_date} />
                    <Field label="Container Info" value={job.operational_container_info} />
                    <Field label="Gatepass Info" value={job.operational_gatepass_info} />
                    <Field
                        label="Receiving Confirmation"
                        value={job.operational_receiving_confirmation}
                    />
                </div>
            </CollapsibleCard>

            {/* Detention */}
            <CollapsibleCard title="Detention Info">
                <div className="grid grid-cols-3 gap-4">
                    <Field label="Free Days" value={job.detention_free_days} />
                    <Field label="Used Days" value={job.detention_used_days} />
                    <Field label="Extra Days" value={job.detention_extra_days} />
                    <Field label="Rate" value={job.detention_rate} />
                    <Field label="Total" value={job.detention_total} />
                    <Field label="Remarks" value={job.detention_remark} />
                </div>
            </CollapsibleCard>

            {/* Demurrage */}
            <CollapsibleCard title="Demurrage Info">
                <div className="grid grid-cols-3 gap-4">
                    <Field label="Free Days" value={job.demurrage_free_days} />
                    <Field label="Used Days" value={job.demurrage_used_days} />
                    <Field label="Extra Days" value={job.demurrage_extra_days} />
                    <Field label="Rate" value={job.demurrage_rate} />
                    <Field label="Total" value={job.demurrage_total} />
                    <Field label="Remarks" value={job.demurrage_remark} />
                </div>
            </CollapsibleCard>
        </div>
    );
};

export default AssignDriverShow;
