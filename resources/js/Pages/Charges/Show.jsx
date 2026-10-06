import React, { useMemo } from "react";
import { Link } from "../../components";
import { ChevronDown, ChevronRight } from "lucide-react";
import { calculateContainerCharges } from "@/utils/containerCalculation";

import { useState } from "react";

const CollapsibleCard = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border rounded-xl shadow-sm bg-white m-4 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex justify-between items-center w-full px-5 py-3 bg-gray-50"
            >
                <span className="font-semibold">{title}</span>

                {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {open && <div className="p-5 border-t">{children}</div>}
        </div>
    );
};

const Field = ({ label, value }) => (
    <div>
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="font-semibold text-sm break-words">{value ?? "-"}</div>
    </div>
);

export default function ChargesShow({
    trip,
    incomes = [],
    expenses = [],
    costs = [],
    statuses = [],
    pageTitle
}) {

    const getStatusLabel = value =>
        statuses.find(s => String(s.value) === String(value))?.label ?? value;

    const deductions = useMemo(() => {

        if (!trip?.containers) return [];

        return trip.containers.flatMap(c => {

            const calculated = calculateContainerCharges(c);

            return [

                {
                    master_bl_number: c.job?.master_bl_number,
                    container: c.container_no,
                    type: "Demurrage",
                    free: calculated.demurrage_free_day ?? 0,
                    used: calculated.demurrage_used_day ?? 0,
                    extra: calculated.demurrage_extra_day ?? 0,
                    rate: calculated.demurrage_rate ?? 0,
                    total:calculated.demurrage_total ?? 0,
                },

                {
                    master_bl_number: c.job?.master_bl_number,
                    container: c.container_no,
                    type: "Detention",
                    free: calculated.detention_free_day ?? 0,
                    used: calculated.detention_used_day ?? 0,
                    extra: calculated.detention_extra_day ?? 0,
                    rate: calculated.detention_rate ?? 0,
                    total:calculated.detention_total ?? 0,
                }

            ];
        });

    }, [trip]);

    const totalIncome = incomes.reduce(
        (s, i) => s + Number(i.amount || 0),
        0
    );

    const totalExpense = expenses.reduce(
        (s, i) => s + Number(i.amount || 0),
        0
    );

    const totalCost = costs.reduce(
        (s, e) => s + Number(e.amount || 0),
        0
    );

    const totalDeduction = deductions.reduce(
        (s, d) => s + Number(d.total || 0),
        0
    );

    const profit = totalIncome - (totalCost + totalDeduction + totalExpense);

    return (

        <div className="container mx-auto">

            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
                <Link href="/charges" className="text-blue-600">
                    Back to List
                </Link>
            </div>

            <CollapsibleCard title="Trip Information">

                <div className="grid grid-cols-5 gap-4">

                    <Field label="Trip ID" value={trip.trip_id} />
                    <Field label="Driver" value={trip.driver?.name} />
                    <Field label="Truck" value={trip.truck?.truck_number} />
                    <Field label="Status" value= {getStatusLabel(trip.status)} />
                    <Field label="Remark" value={trip.remark} />

                </div>

            </CollapsibleCard>


            <CollapsibleCard title="Income">
                {incomes.length > 0 && (
                    <table className="w-full text-sm">

                        <thead>
                            <tr className="border-b text-gray-500">
                                <th className="text-left py-2">Title</th>
                                <th className="text-left py-2">Container No</th>
                                <th className="text-left">Notes</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {incomes.map(i => (
                                <tr key={i.id}>
                                    <td className="py-2">{i.title}</td>
                                    <td className="py-2">{i.container_no}</td>
                                    <td className="break-words">{i.notes}</td>
                                    <td className="text-right">
                                        {Number(i.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
            </CollapsibleCard>

            <CollapsibleCard title="Expense">
                {expenses.length > 0 && (
                    <table className="w-full text-sm">

                        <thead>
                            <tr className="border-b text-gray-500">
                                <th className="text-left py-2">Title</th>
                                <th className="text-left py-2">Container No</th>
                                <th className="text-left">Notes</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {expenses.map(i => (
                                <tr key={i.id}>
                                    <td className="py-2">{i.title}</td>
                                    <td className="py-2">{i.container_no}</td>
                                    <td className="break-words">{i.notes}</td>
                                    <td className="text-right">
                                        {Number(i.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
            </CollapsibleCard>

            <CollapsibleCard title="Transport Costs">
                {costs.length > 0 && (
                    <table className="w-full text-sm">

                        <thead>
                            <tr className="border-b text-gray-500">
                                <th className="text-left py-2">Title</th>
                                <th className="text-left py-2">Type</th>
                                <th className="text-left py-2">Created By</th>
                                <th className="text-left py-2">Note</th>
                                <th className="text-left py-2">Receipt</th>
                                <th className="text-right py-2">Amount</th>
                                <th className="text-right py-2">Per Container</th>
                            </tr>
                        </thead>

                        <tbody>

                            {costs.map(e => (

                                <tr key={e.id} className="border-b">

                                    <td className="py-2">{e.title}</td>

                                    <td>{e.type ?? "-"}</td>

                                    <td className="break-words">{e.user ?? "-"}</td>

                                    <td className="break-words">{e.notes}</td>

                                    <td>
                                        {e.receipt_url ? (
                                            <a
                                                href={e.receipt_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                View
                                            </a>
                                        ) : "-"}
                                    </td>

                                    <td className="text-right">
                                        {Number(e.amount).toFixed(2)}
                                    </td>

                                    <td className="text-right">
                                        {Number(e.per_container).toFixed(2)}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                )}
            </CollapsibleCard>

            <CollapsibleCard title="Detention & Demurrage">

                <table className="w-full text-sm">

                    <thead>

                        <tr className="border-b text-gray-500 text-left py-2">
                            <th>Master BL</th>
                            <th>House BL</th>
                            <th>Container</th>
                            <th>Type</th>
                            <th>Free</th>
                            <th>Used</th>
                            <th>Extra</th>
                            <th>Rate</th>
                            <th className="text-right">Total</th>

                        </tr>

                    </thead>

                    <tbody className="text-left">

                        {deductions.map((d, i) => (

                            <tr key={i}>
                                <td className="py-2">{d.master_bl_number}</td>
                                <td className="py-2">{d.house_bl_number}</td>
                                <td className="py-2">{d.container}</td>
                                <td>{d.type}</td>
                                <td>{d.free}</td>
                                <td>{d.used}</td>

                                <td className="text-red-600">
                                    +{d.extra}
                                </td>

                                <td>{d.rate}</td>

                                <td className="font-semibold text-right">
                                    {d.total}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </CollapsibleCard>

            <div className="bg-white shadow border rounded-xl p-6 m-4">

                <div className="flex justify-between">

                    <div className="text-sm text-gray-500">
                        Charges Summary
                    </div>

                    <div className="flex gap-10">

                        <Summary label="Income" value={totalIncome} color="text-green-600" />

                        <Summary label="Expense" value={totalCost + totalDeduction + totalExpense} color="text-red-600" />

                        <Summary label="Profit" value={profit} color="text-blue-600" />

                    </div>

                </div>

            </div>

        </div>

    );
}

const Summary = ({ label, value, color }) => (

    <div className="text-right">

        <div className={`font-semibold ${color}`}>
            ฿{Number(value).toFixed(2)}
        </div>

        <div className="text-gray-500 text-sm">
            {label}
        </div>

    </div>

);