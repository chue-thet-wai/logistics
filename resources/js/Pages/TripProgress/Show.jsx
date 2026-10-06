import React from "react";
import { Link } from "../../components";
import { calculateContainerCharges } from "@/utils/containerCalculation";

const TripProgressShow = ({ trip, statuses = [], pageTitle }) => {

    const getStatusLabel = value =>
        statuses.find(s => String(s.value) === String(value))?.label ?? value;

    const LAST_STATUS = 9;
    const isFinished = Number(trip.status) === LAST_STATUS;

    const getState = statusValue => {
        if (isFinished) return "completed";
        if (statusValue < trip.status) return "completed";
        if (statusValue === trip.status) return "current";
        return "pending";
    };

    const calculateDaysBetween = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const diffTime = end.getTime() - start.getTime();
        return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
    };

    const today = new Date();
    const endDate =
        Number(trip.status) === 7 && trip.updated_at
            ? new Date(trip.updated_at)
            : today;

    return (
        <div className="container mx-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
                <div className="flex gap-2">
                     <Link href="/trip-progress" className="text-blue-600">
                        Back to List
                    </Link>
                    <Link
                        href={`/trip-progress/${trip.trip_id}`}
                        className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800 transition"
                    >
                        ⟳ Refresh
                    </Link>

                </div>
            </div>

            {/* BASIC INFO */}
            <div className="bg-white shadow-md rounded-2xl p-6 m-4 border">
                <div className="grid md:grid-cols-5 gap-6 text-sm">

                    <div>
                        <p className="text-gray-500">Trip ID</p>
                        <p className="font-semibold text-gray-800">
                            {trip.trip_id}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">Driver</p>
                        <p className="font-semibold text-gray-800 break-words">
                            {trip.driver?.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">Truck</p>
                        <p className="font-semibold text-gray-800">
                            {trip.truck?.truck_number}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">Status</p>
                        <p className="font-semibold text-gray-800">
                            {getStatusLabel(trip.status)}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">Remark</p>
                        <p className="font-semibold text-gray-800">
                            {getStatusLabel(trip.remark)}
                        </p>
                    </div>

                </div>
            </div>

            {/* STATUS TIMELINE */}
            <div className="bg-white shadow-md rounded-2xl p-6 m-4 border">
                <div className="relative flex justify-between">

                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded" />

                    {statuses.map(status => {
                        const state = getState(status.value);

                        const circle =
                            state === "completed"
                                ? "bg-green-500"
                                : state === "current"
                                ? "bg-blue-500 scale-110"
                                : "bg-gray-300";

                        return (
                            <div
                                key={status.value}
                                className="relative z-10 flex-1 text-center"
                            >
                                <div
                                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-white shadow ${circle}`}
                                >
                                    {state === "completed" && "✓"}
                                </div>

                                <p className="mt-3 text-xs font-semibold text-gray-700">
                                    {status.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CONTAINER SUMMARY */}
            <div className="bg-white shadow-md rounded-2xl p-6 m-4 border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    Detention & Demurrage Summary
                </h3>

                {trip.containers?.length === 0 && (
                    <p className="text-sm text-gray-400">
                        No containers assigned.
                    </p>
                )}

                {trip.containers?.map(container => {
                    const calculated = calculateContainerCharges(container);

                    const demurrageFree = calculated.demurrage_free_day ?? 0;
                    const demurrageUsedDays = calculated.demurrage_used_day ?? 0;
                    const demurrageExtraDays = calculated.demurrage_extra_day ?? 0;
                    const demurrageRate = calculated.demurrage_rate ?? "-";

                    const detentionFree = calculated.detention_free_day ?? 0;
                    const detentionUsedDays = calculated.detention_used_day ?? 0;
                    const detentionExtraDays = calculated.detention_extra_day ?? 0;
                    const detentionRate = calculated.detention_rate ?? "-";

                    return (
                        <div
                            key={container.id}
                            className="border rounded-xl p-5 mb-5 bg-gray-50 hover:shadow transition"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-gray-800">
                                    {container.container_no}
                                </h4>
                            </div>

                            <div className="grid text-sm text-gray-600 mb-4">

                                <p>
                                    <span className="font-medium">Master BL Number :</span>{" "}
                                    {container.job?.master_bl_number ?? "-"}
                                </p>
                                <p>
                                    <span className="font-medium">House BL Number :</span>{" "}
                                    {container.job?.house_bl_number ?? "-"}
                                </p>

                                <p>
                                    <span className="font-medium">Shipment ID   :</span>{" "}
                                    {container.job?.shipment_id ?? "-"}
                                </p>

                                <p>
                                    <span className="font-medium">Customer Name:</span>{" "}
                                    {container.job.customer?.name ?? "-"}
                                </p>

                            </div>

                            <div className="grid md:grid-cols-2 gap-6 text-sm">

                                {/* DEMURRAGE */}
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-600">
                                        Demurrage
                                    </p>
                                    <p>
                                        Used: {demurrageUsedDays} / {demurrageFree}
                                    </p>

                                    {demurrageExtraDays > 0 && (
                                        <p className="text-red-600 font-semibold">
                                            Exceeded: {demurrageExtraDays} days
                                        </p>
                                    )}

                                    <p className="text-gray-700">
                                        Fee: {demurrageRate}
                                    </p>
                                </div>

                                {/* DETENTION */}
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-600">
                                        Detention
                                    </p>
                                    <p>
                                        Used: {detentionUsedDays} / {detentionFree}
                                    </p>

                                    {detentionExtraDays > 0 && (
                                        <p className="text-red-600 font-semibold">
                                            Exceeded: {detentionExtraDays} days
                                        </p>
                                    )}

                                    <p className="text-gray-700">
                                        Fee: {detentionRate}
                                    </p>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default TripProgressShow;