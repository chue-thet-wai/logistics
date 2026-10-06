import React, { useState } from "react";
import { Link } from "../../components";
import { ChevronDown, ChevronRight } from "lucide-react";

const Show = ({ container, container_types, bl_statuses, free_day_types, pageTitle }) => {

    const Field = ({ label, value }) => (
        <div>
            <span className="text-sm font-semibold text-gray-600">
                {label}
            </span>
            <div className="text-gray-900 break-words whitespace-normal">
                {value ?? "-"}
            </div>
        </div>
    );

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getLabel = (list, value) =>
        list.find((item) => item.value == value)?.label ?? value;

    const CollapsibleCard = ({ title, children, defaultOpen = true }) => {
        const [open, setOpen] = useState(defaultOpen);

        return (
            <div className="border rounded-lg shadow-sm mb-6 bg-white">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex justify-between items-center w-full px-4 py-3 bg-gray-50 hover:bg-gray-100"
                >
                    <span className="font-semibold text-gray-700">
                        {title}
                    </span>
                    {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {open && <div className="p-4">{children}</div>}
            </div>
        );
    };

    return (
        <div className="container mx-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>

                <Link
                    href="/incoming-shipment-tracking"
                    className="text-blue-600"
                >
                    Back to List
                </Link>
            </div>

            <div className="p-6">

                {/* BASIC INFO */}
                <CollapsibleCard title="Basic Information">
                    <div className="grid grid-cols-2 gap-6">

                        <Field label="Customer" value={container?.job?.customer?.name} />
                        <Field label="Container No" value={container?.container_no} />

                        <Field label="Master BL Number" value={container?.job?.master_bl_number} />
                        <Field label="House BL Number" value={container?.job?.house_bl_number} />

                        <Field label="Container Type" value={getLabel(container_types,container?.container_type)} />
                        <Field label="BL Status" value={getLabel(bl_statuses,container?.job?.bl_status)} />
                        <Field label="Free Day Type" value={getLabel(free_day_types,container?.job?.free_day_type)} />

                        <Field label="Arrival Date (ATA)" value={formatDate(container?.arrival_date)} />
                        <Field label="Left Port Date" value={formatDate(container?.left_port_date)} />

                        <Field label="Return Date" value={formatDate(container?.container_return_date)} />

                    </div>
                </CollapsibleCard>

                {/* DEMURRAGE */}
                <CollapsibleCard title="Demurrage Information">
                    <div className="grid grid-cols-2 gap-6">

                        <Field label="Approved Demurrage Free Days" value={container?.demurrage_free_day} />
                        <Field label="Demurrage End Day" value={formatDate(container?.demurrage_last_date)} />

                        <Field
                            label="Demurrage Remain Free day (Alert)"
                            value={
                                container?.demurrage_remain > 0
                                    ? <span className="text-red-600 font-bold">
                                        {container.demurrage_remain} Days
                                      </span>
                                    : "0"
                            }
                        />

                        <Field
                            label="Demurrage Over day (Alert)"
                            value={
                                container?.demurrage_over > 0
                                    ? <span className="text-red-700 font-bold">
                                        {container.demurrage_over} Days
                                      </span>
                                    : "0"
                            }
                        />

                    </div>
                </CollapsibleCard>

                {/* DETENTION */}
                <CollapsibleCard title="Detention Information">
                    <div className="grid grid-cols-2 gap-6">

                        <Field label="Approved Detention Free Days" value={container?.detention_free_day} />
                        <Field label="Detention End Day" value={formatDate(container?.detention_last_date)} />

                        <Field
                            label="Detention Remain Free day (Alert)"
                            value={
                                container?.detention_remain > 0
                                    ? <span className="text-red-600 font-bold">
                                        {container.detention_remain} Days
                                      </span>
                                    : "0"
                            }
                        />

                        <Field
                            label="Detention Over day (Alert)"
                            value={
                                container?.detention_over > 0
                                    ? <span className="text-red-700 font-bold">
                                        {container.detention_over} Days
                                      </span>
                                    : "0"
                            }
                        />

                    </div>
                </CollapsibleCard>

            </div>
        </div>
    );
};

export default Show;