import React, { useState } from "react";
import { Link } from "../../components";
import { ChevronDown, ChevronRight } from "lucide-react";

const LeadShow = ({
    lead,
    pageTitle,
    modes = [],
    categories = [],
    statuses = [],
}) => {

    const Value = ({ children }) => (
        <p className="text-gray-800 mt-1">
            {children ?? "-"}
        </p>
    );

    const Field = ({ label, value }) => (
        <div>
            <span className="text-sm font-semibold text-gray-600">
                {label}
            </span>
            <div className="text-gray-900 break-words whitespace-normal">{value}</div>
        </div>
    );

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

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


    const getLabel = (list, value) =>
        list.find((item) => item.value == value)?.label;

   
    return (
        <div className="container mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>

                <Link
                    href="/leads"
                    className="text-blue-600"
                >
                    Back to List
                </Link>
            </div>

            <div className="p-6">

               
                <CollapsibleCard title="Basic Information">
                    <div className="grid grid-cols-2 gap-6">

                        <Field label="Booking ID" value={lead?.booking_id} />
                        <Field label="Customer" value={lead?.customer?.name} />

                        <Field
                            label="Mode"
                            value={getLabel(modes, lead?.mode)}
                        />

                        <Field
                            label="Shipment Category"
                            value={getLabel(categories, lead?.category)}
                        />

                        <Field label="ETA" value={formatDate(lead?.eta)} />
                        <Field label="Forwarder" value={lead?.forwarder} />

                        <Field
                            label="Master BL Number"
                            value={lead?.master_bl_number}
                        />

                        <Field
                            label="House BL Number"
                            value={lead?.house_bl_number}
                        />

                        <Field
                            label="No. of Containers"
                            value={lead?.total_container}
                        />

                        <Field
                            label="Demurrage Free Day"
                            value={lead?.demurrage_free_day}
                        />

                        <Field
                            label="Detention Free Day"
                            value={lead?.detention_free_day}
                        />

                        <Field
                            label="Status"
                            value={getLabel(statuses, lead?.status)}
                        />

                        <Field label="Created At" value={formatDate(lead?.created_at)} />
                        <Field label="Created By" value={lead?.created_by_user?.name} />
                        <Field label="Updated At" value={formatDate(lead?.updated_at)} />
                        <Field label="Updated By" value={lead?.updated_by_user?.name} />

                    </div>
                </CollapsibleCard>

                
                {lead?.files?.length > 0 && (
                    <CollapsibleCard title="Uploaded Documents">
                        <div className="space-y-3">
                            {lead.files.map((file) => (
                                <div
                                    key={file.id}
                                    className="p-3 border rounded bg-gray-50"
                                >
                                    <a
                                        href={file.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {file.file_path.split("/").pop()}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </CollapsibleCard>
                )}

            </div>
        </div>
    );
};

export default LeadShow;