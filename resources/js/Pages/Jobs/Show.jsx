import React, { useState, useMemo } from "react";
import { Link } from "../../components";
import { ChevronDown, ChevronRight } from "lucide-react";
import { calculateContainerCharges } from "@/utils/containerCalculation";
import { formatDateDMY } from "@/utils/dateFormat";

const JobShow = ({
    job,
    pageTitle,
    modes = [],
    categories = [],
    loading_ports = [],
    discharge_ports = [],
    carriers = [],
    consignees = [],
    shipment_types = [],
    bl_statuses = [],
    free_day_types = [],
    statuses = [],
    container_statuses = [],
    container_types = [],
    uoms = [],
    fz_options = [],
}) => {

    const formatNumber = (value) =>
        value ? Number(value).toLocaleString() : "-";

    const getLabel = (list, value) =>
        list.find((item) => item.value == value)?.label ?? value;

    /* Calculate containers using helper */
    const calculatedContainers = useMemo(() => {
        return job?.containers?.map((c) =>
            calculateContainerCharges({ ...c })
        ) || [];
    }, [job]);

    const totalDetention = calculatedContainers.reduce(
        (sum, c) => sum + (Number(c.detention_total) || 0),
        0
    );

    const totalDemurrage = calculatedContainers.reduce(
        (sum, c) => sum + (Number(c.demurrage_total) || 0),
        0
    );

    const Field = ({ label, value }) => (
        <div>
            <span className="text-sm font-semibold text-gray-600">{label}</span>
            <div className="text-gray-900 break-words whitespace-normal">
                {value ?? "-"}
            </div>
        </div>
    );

    const CollapsibleCard = ({ title, children, defaultOpen = true }) => {
        const [open, setOpen] = useState(defaultOpen);

        return (
            <div className="border rounded-lg shadow-sm mb-6 bg-white">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex justify-between items-center w-full px-4 py-3 bg-gray-50 hover:bg-gray-100"
                >
                    <span className="font-semibold text-gray-700">{title}</span>
                    {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {open && <div className="p-4">{children}</div>}
            </div>
        );
    };

    return (
        <div className="container mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
                <Link href="/jobs" className="text-blue-600">
                    Back to List
                </Link>
            </div>

            <div className="p-6">

                {/* Shipment Info */}
                <CollapsibleCard title="Basic Shipment Information">
                    <div className="grid grid-cols-2 gap-6">
                        <Field label="Shipment ID" value={job?.shipment_id} />
                        <Field label="Booking ID" value={job?.booking_id} />
                        <Field label="Customer" value={job?.customer?.name} />
                        <Field label="Mode" value={getLabel(modes, job?.mode)} />
                        <Field label="Shipment Category" value={getLabel(categories, job?.category)} />
                        <Field label="ETA" value={formatDateDMY(job?.eta)} />
                        <Field label="SI Number" value={job?.si_number} />
                        <Field label="Master BL Number" value={job?.master_bl_number} />
                        <Field label="House BL Number" value={job?.house_bl_number} />
                        <Field label="Port of Loading" value={getLabel(loading_ports, job?.loading_port)} />
                        <Field label="Port of Discharge" value={getLabel(discharge_ports, job?.discharge_port)} />
                        <Field label="Carrier" value={getLabel(carriers, job?.carrier)} />
                        <Field label="Forwarder" value={job?.forwarder} />
                        <Field label="Shipper Name" value={job?.shipper_name} />
                        <Field label="Consignee" value={getLabel(consignees, job?.consignee)} />
                        <Field label="Shipment Type" value={getLabel(shipment_types, job?.type)} />
                        <Field label="BL Status" value={getLabel(bl_statuses, job?.bl_status)} />
                        <Field label="Free Day Type" value={getLabel(free_day_types, job?.free_day_type)} />
                        <Field label="Surrendered Date" value={formatDateDMY(job?.surrendered_date)} />
                        <Field label="Total Containers" value={job?.total_container} />
                        <Field label="Status" value={getLabel(statuses, job?.status)} />
                        <Field label="Created At" value={formatDateDMY(job?.created_at)} />
                        <Field label="Created By" value={job?.created_by_user?.name} />
                        <Field label="Updated At" value={formatDateDMY(job?.updated_at)} />
                        <Field label="Updated By" value={job?.updated_by_user?.name} />
                    </div>
                </CollapsibleCard>

                {/* Container Info */}
                <CollapsibleCard title={`Container Information (${calculatedContainers.length})`}>
                    {calculatedContainers.map((container, index) => (
                        <CollapsibleCard
                            key={container.id}
                            title={`Container ${index + 1} - ${container.container_no ?? container.container_id}`}
                            defaultOpen={false}
                        >

                            <div className="bg-gray-50 p-4 rounded-lg">

                                {/* Basic Info */}
                                <div className="grid grid-cols-3 gap-6">
                                    <Field label="Container ID" value={container.container_id} />
                                    <Field label="Container No" value={container.container_no} />
                                    <Field label="ATA (Actual time of arrival) " value={formatDateDMY(container.arrival_date)} />
                                    <Field label="Container Type" value={getLabel(container_types,container.container_type)} />
                                    <Field label="Product Category" value={container.product_category} />
                                    <Field label="Quantity" value={formatNumber(container.quantity)} />
                                    <Field label="UOM" value={getLabel(uoms,container.uom)} />
                                    <Field label="Weight" value={container.weight} />
                                    <Field label="CBM" value={container.cbm} />
                                    <Field label="Route" value={container.route?.name} />
                                    <Field label="Pickup Point" value={container.origin} />
                                    <Field label="Deliver Drop Point" value={container.destination} />
                                    <Field label="FZ" value={container?.fz ? getLabel(fz_options, container.fz) : ""} />
                                    <Field label="Billing Customer" value={container.billing_customer} />
                                    <Field label="Status" value={getLabel(container_statuses, container.status)} />
                                    <Field label="Remark" value={container.remark} />
                                </div>

                                {/* Pickup Info */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Pickup Information</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <Field label="Pickup Date" value={formatDateDMY(container.pickup_date)} />
                                        <Field label="Pickup Address" value={container.pickup_address} />
                                        <Field label="Contact Person" value={container.pickup_contact_person} />
                                        <Field label="Contact Phone" value={container.pickup_contact_phone} />
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Delivery Information</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <Field label="Delivery Address" value={container.delivery_address} />
                                        <Field label="Contact Person" value={container.delivery_contact_person} />
                                        <Field label="Contact Phone" value={container.delivery_contact_phone} />
                                    </div>
                                </div>

                                {/* Demurrage */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Demurrage</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <Field label="Free Days" value={container.demurrage_free_day} />
                                        <Field label="Last Date" value={formatDateDMY(container.demurrage_last_date)} />
                                        <Field label="Used Days" value={container.demurrage_used_day} />
                                        <Field label="Extra Days" value={container.demurrage_extra_day} />
                                        <Field label="Rate" value={container.demurrage_rate} />
                                        <Field label="Total" value={formatNumber(container.demurrage_total)} />
                                        <Field label="Remark" value={container.demurrage_remark} />
                                    </div>
                                </div>

                                {/* Detention */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Detention</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <Field label="Free Days" value={container.detention_free_day} />
                                        <Field label="Last Date" value={formatDateDMY(container.detention_last_date)} />
                                        <Field label="Used Days" value={container.detention_used_day} />
                                        <Field label="Extra Days" value={container.detention_extra_day} />
                                        <Field label="Rate" value={container.detention_rate} />
                                        <Field label="Total" value={formatNumber(container.detention_total)} />
                                        <Field label="Remark" value={container.detention_remark} />
                                        <Field label="Left Port Date" value={formatDateDMY(container.left_port_date)} />
                                        <Field label="Container Return Date" value={formatDateDMY(container.container_return_date)} />
                                    </div>
                                </div>

                                {/* Files */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Container Files</h4>
                                    {container.files && container.files.length > 0 ? (
                                        <ul className="space-y-2">
                                            {container.files.map((file) => (
                                                <li key={file.id}>
                                                    <a
                                                        href={file.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {file.file_name ?? "Download File"}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No files uploaded.</p>
                                    )}
                                </div>

                            </div>
                        </CollapsibleCard>
                    ))}

                </CollapsibleCard>

            </div>
        </div>
    );
};

export default JobShow;