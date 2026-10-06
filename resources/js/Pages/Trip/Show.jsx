import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "../../components";
import { formatDateDMY } from "@/utils/dateFormat";

// Collapsible card
const CollapsibleCard = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
        <div className="border rounded-xl shadow-sm bg-white mb-4 overflow-hidden m-4">
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

const Field = ({ label, value }) => (
    <div>
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        <div className="text-gray-900 break-words whitespace-normal">{value}</div>
    </div>
);

const formatNumber = (value) =>
        value ? Number(value).toLocaleString() : "-";

const TripDetailView = ({ trip, pageTitle, uoms=[], container_types = [], statuses = [] }) => {
    const driver = trip?.driver;
    const truck = trip?.truck;

    const getContainerTypeLabel = (value) => {
        const type = container_types.find(t => Number(t.value) === Number(value));
        return type ? type.label : value;
    };

    const getUOMsLabel = (value) => {
        const uom = uoms.find(t => Number(t.value) === Number(value));
        return uom ? uom.label : value;
    };

    const getStatusLabel = (value) => {
        const status = statuses.find(t => Number(t.value) === Number(value));
        return status ? status.label : value;
    };

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
                <Link href="/trips" className="text-blue-600">
                    Back to List
                </Link>
            </div>

            {/* Trip Information */}
            <CollapsibleCard title="Trip Information">
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Trip ID" value={trip.trip_id} />
                    <Field label="Driver" value={driver?.name} />
                    <Field label="Driver Email" value={driver?.email} />
                    <Field label="Driver Phone" value={driver?.phone} />
                    <Field label="Truck" value={truck?.truck_number} />
                    <Field label="Status" value={getStatusLabel(trip.status)} />
                    <Field label="Created At" value={formatDateDMY(trip.created_at)} />
                    <Field label="Created By" value={trip?.created_by_user?.name} />
                    <Field label="Updated At" value={formatDateDMY(trip.updated_at)} />
                    <Field label="Updated By" value={trip?.updated_by_user?.name} />
                    <Field label="Remark" value={trip.remark} />
                </div>
            </CollapsibleCard>

            {/* Containers */}
            <CollapsibleCard title={`Containers (${trip.containers?.length || 0})`}>
                {trip.containers?.length > 0 ? (
                    <table className="min-w-full border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2">Shipment ID</th>
                                <th className="border px-3 py-2">Master BL</th>
                                <th className="border px-3 py-2">House BL</th>
                                <th className="border px-3 py-2">Container No</th>
                                <th className="border px-3 py-2">Container Type</th>
                                <th className="border px-3 py-2">Product Category</th>
                                <th className="border px-3 py-2">Deliver Drop Point</th>
                                <th className="border px-3 py-2">Pickup Date</th>
                                <th className="border px-3 py-2">UOM</th>
                                <th className="border px-3 py-2">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trip.containers.map(container => (
                                <tr key={container.id}>
                                    <td className="border px-3 py-2">{container.shipment_id}</td>
                                    <td className="border px-3 py-2">{container.job?.master_bl_number}</td>
                                    <td className="border px-3 py-2">{container.job?.house_bl_number}</td>
                                    <td className="border px-3 py-2">{container.container_no}</td>
                                    <td className="border px-3 py-2">{getContainerTypeLabel(container.container_type)}</td>
                                    <td className="border px-3 py-2">{container.product_category}</td>
                                    <td className="border px-3 py-2">{container.destination}</td>
                                    <td className="border px-3 py-2">{formatDateDMY(container.pickup_date)}</td>
                                    <td className="border px-3 py-2">{getContainerTypeLabel(container.uom)}</td>
                                    <td className="border px-3 py-2">{formatNumber(container.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 text-sm">No containers selected.</p>
                )}
            </CollapsibleCard>
        </div>
    );
};

export default TripDetailView;