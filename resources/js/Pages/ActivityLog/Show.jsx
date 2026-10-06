import React, { useMemo, useState } from "react";
import { Link } from "../../components";

const ActivityLogShow = ({ trip, statuses = [], expense_types=[], pageTitle }) => {

    const [selectedStatus, setSelectedStatus] = useState("");
    const [openLogId, setOpenLogId] = useState(null);

    const logs = trip?.status_logs ?? [];

    const toggleLog = (id) => {
        setOpenLogId(openLogId === id ? null : id);
    };

    const getLabel = (list, value) =>
        list.find((item) => item.value == value)?.label ?? value;

    const filteredLogs = useMemo(() => {

        if (!selectedStatus) return logs;

        return logs.filter(
            log => String(log.status) === String(selectedStatus)
        );

    }, [logs, selectedStatus]);


    const calculateDaysBetween = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
    };

    const totalDays = useMemo(() => {
        if (!filteredLogs.length) return 0;
        const firstDate = filteredLogs[0].created_at;
        const lastDate = filteredLogs[filteredLogs.length - 1].created_at;
        return calculateDaysBetween(firstDate, lastDate);
    }, [filteredLogs]);

    return (

        <div className="container mx-auto">

            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
                <Link href="/activity-log" className="text-blue-600">
                    Back to List
                </Link>
            </div>

            <div className="bg-white rounded-xl border shadow p-5 m-6">

                <h2 className="font-semibold mb-4 text-gray-700">
                    Trip Information
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">

                    <div>
                        <div className="text-gray-500">Trip ID</div>
                        <div className="font-medium">
                            {trip?.trip_id ?? "-"}
                        </div>
                    </div>

                    <div>
                        <div className="text-gray-500">Driver</div>
                        <div className="font-medium break-words">
                            {trip?.driver?.name ?? "-"}
                        </div>
                    </div>

                    <div>
                        <div className="text-gray-500">Truck</div>
                        <div className="font-medium">
                            {trip?.truck?.truck_number ?? "-"}
                        </div>
                    </div>

                    <div>
                        <div className="text-gray-500">Current Status</div>
                        <div className="font-medium">
                            {getLabel(statuses, trip?.status)}
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-500">Remark</div>
                        <div className="font-medium">
                            {trip?.remark ?? ""}
                        </div>
                    </div>

                </div>

            </div>

            <div className="bg-white rounded-xl border shadow p-5 m-6">

                <h2 className="font-semibold mb-4 text-gray-700">
                    Containers
                </h2>

                {trip?.containers?.length ? (

                    <table className="w-full text-sm">

                        <thead className="border-b text-gray-500">

                            <tr>
                                <th className="text-left py-2">No.</th>
                                <th className="text-left py-2">Shipment ID</th>
                                <th className="text-left py-2">Master BL</th>
                                 <th className="text-left py-2">House BL</th>
                                <th className="text-left py-2">Customer Name</th>
                                <th className="text-left py-2">Container No</th>
                                <th className="text-left py-2">Product Category</th>
                            </tr>

                        </thead>

                        <tbody>

                            {trip.containers.map((container, index) => (

                                <tr key={container.id}>

                                <td className="py-2">
                                    {index + 1}
                                </td>

                                <td className="py-2 break-words">
                                    {container.job?.shipment_id ?? ""}
                                </td>

                                <td className="py-2 break-words">
                                    {container.job?.master_bl_number ?? ""}
                                </td>

                                <td className="py-2 break-words">
                                    {container.job?.house_bl_number ?? ""}
                                </td>

                                <td className="py-2 break-words">
                                    {container.job?.customer?.name ?? ""}
                                </td>

                                <td className="py-2 break-words">
                                    {container.container_no ?? ""}
                                </td>
                                <td className="py-2 break-words">
                                    {container.product_category ?? ""}
                                </td>

                                </tr>

                            ))}     

                        </tbody>

                    </table>

                ) : (

                    <div className="text-gray-400 text-sm">
                        No containers found
                    </div>

                )}

            </div>

            <div className="flex justify-between items-center m-6">

                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                >

                    <option value="">All Status</option>

                    {statuses.map(status => (

                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>

                    ))}

                </select>

                <div className="text-sm text-gray-800 font-bold">
                    Turn Around Time (Days): {totalDays} | Total Logs: {filteredLogs.length} 
                </div>

            </div>

            <div className="space-y-4 m-6">

                <div className="grid grid-cols-6 bg-gray-100 p-4 rounded-xl text-sm font-semibold text-gray-700">
                    <div>Date</div>
                    <div>Created By</div>
                    <div className="mx-4">Truck</div>
                    <div className="mx-4">Status</div>
                    <div>Attachment</div>
                    <div className="text-right">Action</div>
                </div>

                {filteredLogs.length ? (

                    filteredLogs.map(log => {

                        const isOpen = openLogId === log.id;

                        return (

                            <div
                                key={log.id}
                                className="bg-white rounded-xl shadow border"
                            >

                                <div
                                    onClick={() => toggleLog(log.id)}
                                    className="grid grid-cols-6 p-4 cursor-pointer hover:bg-gray-50 text-sm"
                                >

                                    <div>
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>

                                    <div className="font-medium break-words">
                                        {log.user?.name ?? "-"}
                                    </div>
                                    <div className="mx-4 font-medium break-words">
                                        {log.truck?.truck_number ?? "-"}
                                    </div>

                                    <div className="mx-4">
                                        {getLabel(statuses, log?.status)}
                                    </div>
                                    <div>
                                        {log.photo_url ? (
                                            <a
                                                href={log.photo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                View File
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">
                                                -
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-right text-gray-400">
                                        {isOpen ? "▲" : "▼"}
                                    </div>

                                </div>

                                {isOpen && (

                                    <div className="border-t p-4 bg-gray-50 space-y-4 text-sm">

                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">
                                                Notes
                                            </div>
                                            <div>
                                                {log.notes ?? "-"}
                                            </div>
                                        </div>

                                        <div>

                                            <div className="font-semibold mb-2">
                                                Expenses
                                            </div>

                                            {log.costs?.length ? (

                                                <table className="w-full text-xs border">

                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="p-2 text-left">Title</th>
                                                            <th className="p-2 text-left">Type</th>
                                                            <th className="p-2 text-left">Amount</th>
                                                            <th className="p-2 text-left">Notes</th>
                                                            <th className="p-2 text-left">Receipts</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>

                                                        {log.costs.map(exp => (

                                                            <tr key={exp.id} className="border-t">

                                                                <td className="p-2">{exp.title}</td>
                                                                <td className="p-2"> {getLabel(expense_types, exp.type)}</td>

                                                                <td className="p-2">
                                                                    ฿{Number(exp.amount).toFixed(2)}
                                                                </td>

                                                                <td className="break-words p-2">
                                                                    {exp.notes ?? "-"}
                                                                </td>

                                                                <td className="p-2">
                                                                    {exp.receipt_url && (
                                                                        <a href={exp.receipt_url} target="_blank" className="text-blue-600 underline mx-2">View</a>
                                                                    )}

                                                                    {exp.receipt2_url && (
                                                                        <a href={exp.receipt2_url} target="_blank" className="text-blue-600 underline mx-2">View</a>
                                                                    )}

                                                                    {exp.receipt3_url && (
                                                                        <a href={exp.receipt3_url} target="_blank" className="text-blue-600 underline mx-2">View</a>
                                                                    )}      
                                                                    
                                                                </td>

                                                            </tr>

                                                        ))}

                                                    </tbody>

                                                </table>

                                            ) : (

                                                <div className="text-gray-400 text-xs">
                                                    No Transpost Cost
                                                </div>

                                            )}

                                        </div>

                                    </div>

                                )}

                            </div>

                        );

                    })

                ) : (

                    <div className="text-center text-gray-400 py-6">
                        No logs found
                    </div>

                )}

            </div>

        </div>

    );

};

export default ActivityLogShow;