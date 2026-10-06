import React, { useMemo, useState,useEffect } from "react";
import { router } from "@inertiajs/react";
import { Edit2, Trash2 } from "lucide-react";
import { Input, SearchableSelect, Button,Select } from "../../components";
import { calculateContainerCharges } from "@/utils/containerCalculation";

export default function ChargesPage({
    trip,
    incomes = [],
    expenses = [],
    costs = [],
    expense_types = [],
    income_titles = [],
    expense_titles = [],
    pageTitle
}) {
    const [loading, setLoading] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCostModal, setShowCostModal] = useState(false);

    const [incomeErrors, setIncomeErrors] = useState({});
    const [expenseErrors, setExpenseErrors] = useState({});
    const [costErrors, setCostErrors] = useState({});

    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleFinish = () => setLoading(false);

        document.addEventListener("inertia:start", handleStart);
        document.addEventListener("inertia:finish", handleFinish);

        return () => {
            document.removeEventListener("inertia:start", handleStart);
            document.removeEventListener("inertia:finish", handleFinish);
        };
    }, []);

    const [incomeForm, setIncomeForm] = useState({
        container_id: "",
        title: "",
        title_other: "",
        notes: "",
        amount: ""
    });

    const [expenseForm, setExpenseForm] = useState({
        container_id: "",
        title: "",
        title_other: "",
        notes: "",
        amount: ""
    });

    const [costForm, setCostForm] = useState({
        type: "",
        title: "",
        notes: "",
        amount: "",
        files: []
    });

    const isEditingCost = !!costForm.id;

    const deductions = useMemo(() => {

        if (!trip?.containers?.length) return [];

        return trip.containers.flatMap(container => {

            const calculated = calculateContainerCharges(container);

            return [

                {
                    master_bl_number: container.job?.master_bl_number,
                    container_no: container.container_no,
                    container_id: container.container_id,
                    type: "Demurrage",
                    free_days: calculated.demurrage_free_day ?? 0,
                    used_days: calculated.demurrage_used_day ?? 0,
                    extra_days: calculated.demurrage_extra_day ?? 0,
                    rate: calculated.demurrage_rate ?? "",
                    total:calculated.demurrage_total??"",
                    remark: calculated.demurrage_remark ?? "",
                },

                {
                    master_bl_number: container.job?.master_bl_number,
                    container_no: container.container_no,
                    container_id: container.container_id,
                    type: "Detention",
                    free_days: calculated.detention_free_day ?? 0,
                    used_days: calculated.detention_used_day ?? 0,
                    extra_days: calculated.detention_extra_day ?? 0,
                    rate: calculated.detention_rate ?? "",
                    total: calculated.detention_total??"",
                    remark: calculated.detention_remark ?? "",
                }

            ];
        });

    }, [trip]);    

    const totalIncome = useMemo(
        () => incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0),
        [incomes]
    );

    const totalExpense = useMemo(
        () => expenses.reduce((sum, i) => sum + Number(i.amount || 0), 0),
        [expenses]
    );

    const totalCost = useMemo(
        () => costs.reduce((sum, e) => sum + Number(e.amount || 0), 0),
        [costs]
    );

    const totalDeduction = useMemo(
        () => deductions.reduce((sum, d) => sum + Number(d.total || 0), 0),
        [deductions]
    );

    const allExpense = totalCost + totalDeduction + totalExpense;
    const profit = totalIncome - allExpense;

    const submitIncome = () => {

        let errors = {};

        if (!incomeForm.amount) {
            errors.amount = "Amount is required";
        }
        if (!incomeForm.container_id) {
            errors.container_id = "Container is required";
        }

        if (!incomeForm.title) {
            errors.title = "Income title is required";
        }

        if (Object.keys(errors).length) {
            setIncomeErrors(errors);
            return;
        }
        setShowIncomeModal(false);

        router.post(route("charges.incomes.store", trip.trip_id), incomeForm, {

            preserveScroll: true,
            preserveState: true,

            onSuccess: () => {

                setIncomeForm({
                    container_id:"",
                    title: "",
                    title_other: "",
                    notes: "",
                    amount: ""
                });

                setIncomeErrors({});
                setShowIncomeModal(false);
            },

            onFinish: () => setShowIncomeModal(false)

        });

    };

    const submitExpense = () => {

        let errors = {};

        if (!expenseForm.amount) {
            errors.amount = "Amount is required";
        }
        if (!expenseForm.container_id) {
            errors.container_id = "Container is required";
        }

        if (!expenseForm.title) {
            errors.title = "Expense title is required";
        }

        if (Object.keys(errors).length) {
            setExpenseErrors(errors);
            return;
        }
        setShowExpenseModal(false);

        router.post(route("charges.expenses.store", trip.trip_id), expenseForm, {

            preserveScroll: true,
            preserveState: true,

            onSuccess: () => {

                setExpenseForm({
                    container_id:"",
                    title: "",
                    title_other: "",
                    notes: "",
                    amount: ""
                });

                setExpenseErrors({});
                setShowExpenseModal(false);
            },

            onFinish: () => setShowExpenseModal(false)

        });

    };

    const submitCost = () => {

        let errors = {};

        if (!costForm.amount && costForm.files.length === 0 && !isEditingCost) {
            errors.amount = "Amount or file required";
        }

        if (!costForm.type) {
            errors.type = "Type required";
        }

        if (costForm.files.length > 3) {
            errors.files = "Maximum 3 files allowed";
        }

        if (Object.keys(errors).length) {
            setCostErrors(errors);
            return;
        }
        setShowCostModal(false);
        const formData = new FormData();

        formData.append("type", costForm.type);
        formData.append("title", costForm.title);
        formData.append("notes", costForm.notes);
        formData.append("amount", costForm.amount);

        costForm.files.forEach((file, index) => {
            formData.append(`receipts[${index}]`, file);
        });

        const url = isEditingCost
            ? route("charges.costs.update", costForm.id)
            : route("charges.costs.store", trip.trip_id);

        router.post(url, formData, {

            forceFormData: true,
            preserveScroll: true,
            preserveState: true,

            onSuccess: () => {

                setCostForm({
                    id: null,
                    type: "",
                    title: "",
                    notes: "",
                    amount: "",
                    files: []
                });
                setShowCostModal(false);
                setCostErrors({});
            },

            onFinish: () => setShowCostModal(false)

        });

    };

    const updateCharge = (container, type, field, value) => {

        router.post(route("charges.updateCharge"), {
            container_id: container,
            type: type,
            [field]: value
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true
        });

    };

    const getTitleLabel = (item, titleList) => {
        if (Number(item.title) === 99) {
            return item.title_other || "Other";
        }

        const found = titleList.find(t => Number(t.value) === Number(item.title));
        return found?.label || "-";
    };

    const containerMap = useMemo(() => {
        return Object.fromEntries(
            (trip?.containers || []).map(c => [c.container_id, c.container_no])
        );
    }, [trip]);

    return (

        <div className="container mx-auto">
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex justify-between items-center h-14 px-6 py-2 border-b">
                <h1 className="text-lg font-semibold">{pageTitle}</h1>
            </div>

            {/* INCOME */}

            <Card title="Income Table">
                <Row className="font-semibold border-b" cols={5}>
                    <div className="px-2">Title</div>
                    <div className="px-2">Container No</div>
                    <div className="px-2">Notes</div>
                    <div className="text-right">Amount</div>
                    <div className="flex justify-center">Action</div>
                </Row>

                {incomes.map(i => (

                    <Row key={i.id} cols={5}>

                        <div className="break-words px-2">
                            {getTitleLabel(i, income_titles)}
                        </div>
                        <div className="break-words px-2">
                            {containerMap[i.container_id] || "-"}
                        </div>
                        <div className="break-words px-2">{i.notes}</div>

                        <div className="text-right">
                            {Number(i.amount).toFixed(2)}
                        </div>

                        <div className="flex justify-center">

                            <IconButton
                                icon={<Trash2 size={16} />}
                                danger
                                onClick={() =>
                                    router.delete(route("charges.incomes.delete", i.id))
                                }
                            />

                        </div>

                    </Row>

                ))}

                <AddLine label="+ Add Income" onClick={() => setShowIncomeModal(true)} />

            </Card>

            {/* Expense */}

            <Card title="Expense Table">
                <Row className="font-semibold border-b" cols={5}>
                    <div className="px-2">Title</div>
                    <div className="px-2">Container No</div>
                    <div className="px-2">Notes</div>
                    <div className="text-right">Amount</div>
                    <div className="flex justify-center">Action</div>
                </Row>

                {expenses.map(i => (

                    <Row key={i.id} cols={5}>

                        <div className="break-words px-2">
                            {getTitleLabel(i, expense_titles)}
                        </div>
                        <div className="break-words px-2">
                            {containerMap[i.container_id] || "-"}
                        </div>
                        <div className="break-words px-2">{i.notes}</div>

                        <div className="text-right">
                            {Number(i.amount).toFixed(2)}
                        </div>

                        <div className="flex justify-center">

                            <IconButton
                                icon={<Trash2 size={16} />}
                                danger
                                onClick={() =>
                                    router.delete(route("charges.expenses.delete", i.id))
                                }
                            />

                        </div>

                    </Row>

                ))}

                <AddLine label="+ Add Expense" onClick={() => setShowExpenseModal(true)} />

            </Card>

            {/* Transport Cost */}

            <Card title="Transport Cost Table">
                <Row className="font-semibold border-b" cols={8}>
                    <div className="px-2">Title</div>
                    <div className="px-2">Type</div>
                    <div className="px-2">Created By</div>
                    <div className="px-2">Notes</div>
                    <div className="px-2">Attachment</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Per Container</div>
                    <div className="flex justify-center">Action</div>
                </Row>
                
                {costs.map(e => (
                    <Row key={e.id} cols={8}>

                        <div className="break-words px-2">{e.title}</div>
                        <div>{e.typeLabel ?? "-"}</div>
                        <div className="break-words px-2">{e.user ?? "-"}</div>
                        <div className="break-words px-2">{e.notes}</div>

                        <div className="space-y-1">
                            {e.receipt_url && (
                                <a href={e.receipt_url} target="_blank" className="text-blue-600 underline mx-2">View</a>
                            )}

                            {e.receipt2_url && (
                                <a href={e.receipt2_url} target="_blank" className="text-blue-600 underline mx-2">View</a>
                            )}

                            {e.receipt3_url && (
                                <a href={e.receipt3_url} target="_blank" className="text-blue-600 underline mx-2">View</a>
                            )}
    
                            {!e.receipt_url && !e.receipt2_url && !e.receipt3_url && "-"}
                        </div>

                        <div className="text-right">
                            {Number(e.amount).toFixed(2)}
                        </div>
                        <div className="text-right">
                            {Number(e.per_container).toFixed(2)}
                        </div>

                        {e.role === "Admin" && (
                            <div className="flex gap-2 justify-center">
                                <IconButton
                                    icon={<Edit2 size={16} />}
                                    onClick={() => {
                                       
                                        setCostForm({
                                            id: e.id,
                                            type: e.type,
                                            title: e.title || "",
                                            notes: e.notes || "",
                                            amount: e.amount || "",
                                            files: []
                                        });

                                        setShowCostModal(true);
                                    }}
                                />

                                <IconButton
                                    icon={<Trash2 size={16} />}
                                    danger
                                    onClick={() =>
                                        router.delete(route("charges.costs.delete", e.id))
                                    }
                                />

                            </div>
                        )}

                    </Row>

                ))}

                <AddLine label="+ Add Transport Cost" onClick={() => setShowCostModal(true)} />

            </Card>

            {/* DETENTION & DEMURRAGE */}

            <Card title="Detention & Demurrage Charges">

                <table className="w-full text-sm">

                    <thead>

                        <tr className="border-b text-center">

                            <th>Master BL</th>
                            <th>House BL</th>
                            <th>Container</th>
                            <th>Type</th>
                            <th>Free</th>
                            <th>Used</th>
                            <th>Extra</th>
                            <th>Rate</th>
                            <th>Total</th>
                            <th>Remark</th>

                        </tr>

                    </thead>

                    <tbody className="text-center">

                        {deductions.map((d, i) => (

                            <tr key={i} className="border-b">

                                <td>{d.master_bl_number}</td>
                                 <td>{d.house_bl_number}</td>
                                <td>{d.container_no}</td>
                                <td>{d.type}</td>
                                <td>{d.free_days}</td>
                                <td>{d.used_days}</td>
                                <td className="text-red-600">+{d.extra_days}</td>

                                <td>

                                    <Input
                                        defaultValue={d.rate}
                                        className="w-24 m-2"
                                        onBlur={e =>
                                            updateCharge(
                                                d.container_id,
                                                d.type,
                                                "rate",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                                <td>

                                    <Input
                                        defaultValue={d.total}
                                        className="w-24 m-2"
                                        onBlur={e =>
                                            updateCharge(
                                                d.container_id,
                                                d.type,
                                                "total",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                                <td>{d.remark}</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </Card>

            {/* SUMMARY */}

            <div className="flex justify-between bg-white m-6 rounded-xl shadow p-5 border">

                <div className="text-sm text-gray-500">
                    Charges Summary
                </div>

                <div className="flex gap-10 text-sm">

                    <Summary label="Income" value={totalIncome} color="text-green-600" />
                    <Summary label="Expense" value={allExpense} color="text-red-600" />
                    <Summary label="Profit" value={profit} color="text-blue-600" />

                </div>

            </div>

            {/* INCOME MODAL */}

            {showIncomeModal && (

                <Modal title="Add Income" onClose={() => setShowIncomeModal(false)}>

                    <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={incomeForm.container_id}
                        onChange={e =>
                            setIncomeForm({ ...incomeForm, container_id: e.target.value })
                        }
                    >
                        <option value="">Select Container</option>

                        {trip?.containers?.map(c => (
                            <option key={c.container_id} value={c.container_id}>
                                {c.container_no} {c.job?.master_bl_number ? `(${c.job.master_bl_number})` : ""}
                            </option>
                        ))}
                    </select>       
                    {incomeErrors.container_id && (
                        <div className="text-red-500 text-sm">
                            {incomeErrors.container_id}
                        </div>
                    )}

                    <SearchableSelect
                        name="title"
                        value={incomeForm.title}
                        onChange={(e) =>
                            setIncomeForm({
                                ...incomeForm,
                                title: e.target.value,
                                title_other: "",
                            })
                        }
                        options={income_titles}
                        placeholder="Search income title..."
                        error={incomeErrors.title}
                    />  

                    {Number(incomeForm.title) === 99 && (
                        <Input
                            placeholder="Other Title"
                            value={incomeForm.title_other || ""}
                            onChange={e =>
                                setIncomeForm({
                                    ...incomeForm,
                                    title_other: e.target.value
                                })
                            }
                        />
                    )}      

                    <Input
                        placeholder="Note"
                        value={incomeForm.notes}
                        onChange={e =>
                            setIncomeForm({ ...incomeForm, notes: e.target.value })
                        }
                    />

                    <Input
                        type="number"
                        placeholder="Amount"
                        value={incomeForm.amount}
                        onChange={e =>
                            setIncomeForm({ ...incomeForm, amount: e.target.value })
                        }
                    />

                    {incomeErrors.amount && (
                        <div className="text-red-500 text-sm">
                            {incomeErrors.amount}
                        </div>
                    )}

                    <ModalActions
                        onCancel={() => setShowIncomeModal(false)}
                        onSave={submitIncome}
                    />

                </Modal>

            )}

            {/* Expense MODAL */}

            {showExpenseModal && (

                <Modal title="Add Expense" onClose={() => setShowExpenseModal(false)}>

                    <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={expenseForm.container_id}
                        onChange={e =>
                            setExpenseForm({ ...expenseForm, container_id: e.target.value })
                        }
                    >
                        <option value="">Select Container</option>

                        {trip?.containers?.map(c => (
                            <option key={c.container_id} value={c.container_id}>
                                {c.container_no} {c.job?.master_bl_number ? `(${c.job.master_bl_number})` : ""}
                            </option>
                        ))}
                    </select>       
                    {expenseErrors.container_id && (
                        <div className="text-red-500 text-sm">
                            {expenseErrors.container_id}
                        </div>
                    )}

                    <SearchableSelect
                        name="title"
                        value={expenseForm.title}
                        onChange={(e) =>
                            setExpenseForm({
                                ...expenseForm,
                                title: e.target.value,
                                title_other: "",
                            })
                        }
                        options={expense_titles}
                        placeholder="Search expense title..."
                        error={expenseErrors.title}
                    />

                    {Number(expenseForm.title) === 99 && (
                        <Input
                            placeholder="Other Title"
                            value={expenseForm.title_other || ""}
                            onChange={e =>
                                setExpenseForm({
                                    ...expenseForm,
                                    title_other: e.target.value
                                })
                            }
                        />
                    )}      

                    <Input
                        placeholder="Note"
                        value={expenseForm.notes}
                        onChange={e =>
                            setExpenseForm({ ...expenseForm, notes: e.target.value })
                        }
                    />

                    <Input
                        type="number"
                        placeholder="Amount"
                        value={expenseForm.amount}
                        onChange={e =>
                            setExpenseForm({ ...expenseForm, amount: e.target.value })
                        }
                    />

                    {expenseErrors.amount && (
                        <div className="text-red-500 text-sm">
                            {expenseErrors.amount}
                        </div>
                    )}

                    <ModalActions
                        onCancel={() => setShowExpenseModal(false)}
                        onSave={submitExpense}
                    />

                </Modal>

            )}

            {/* Transport Cost MODAL */}

            {showCostModal && (

                <Modal
                    title={isEditingCost ? "Edit Transport Cost" : "Add Transport Cost"}
                    onClose={() => setShowCostModal(false)}
                >   
                    <SearchableSelect
                        name="type"
                        value={costForm.type}
                        onChange={e =>
                            setCostForm({ ...costForm, type: e.target.value })
                        }
                        options={expense_types}
                        placeholder="Search Cost Type..."
                    />
                    {costErrors.type && (
                        <div className="text-red-500 text-sm">
                            {costErrors.type}
                        </div>
                    )}

                    <Input
                        placeholder="Cost Title"
                        value={costForm.title}
                        onChange={e =>
                            setCostForm({ ...costForm, title: e.target.value })
                        }
                    />

                    <Input
                        placeholder="Note"
                        value={costForm.notes}
                        onChange={e =>
                            setCostForm({ ...costForm, notes: e.target.value })
                        }
                    />

                    <Input
                        type="number"
                        placeholder="Amount"
                        value={costForm.amount}
                        onChange={e =>
                            setCostForm({ ...costForm, amount: e.target.value })
                        }
                    />

                    {costErrors.amount && (
                        <div className="text-red-500 text-sm">
                            {costErrors.amount}
                        </div>
                    )}
                    
                    <input
                        type="file"
                        multiple
                        onChange={e => {
                            const files = Array.from(e.target.files);

                            if (files.length > 3) {
                                e.target.value = ""; // reset input
                                setCostForm({ ...costForm, files: [] });
                                setCostErrors({ ...costErrors, files: "Maximum 3 files allowed" });
                                return;
                            }

                            // Acceptable number of files
                            setCostForm({ ...costForm, files });
                            setCostErrors({ ...costErrors, files: null });
                        }}
                    />

                    {costErrors.files && (
                        <div className="text-red-500 text-sm">
                            {costErrors.files}
                        </div>
                    )}

                    {costForm.files.length > 0 && (
                        <div className="text-sm text-gray-500">
                            {costForm.files.map((file, i) => (
                                <div key={i}>{file.name}</div>
                            ))}
                        </div>
                    )}

                    <ModalActions
                        onCancel={() => setShowCostModal(false)}
                        onSave={submitCost}
                    />

                </Modal>

            )}

        </div>

    );
}

/* COMPONENTS */

const Card = ({ title, children }) => (
    <div className="bg-white m-6 rounded-xl shadow p-5 border">
        <h2 className="font-semibold mb-4">{title}</h2>
        {children}
    </div>
);

const Row = ({ children, cols = 4 }) => {

    const colMap = {
        4: "grid-cols-4",
        5: "grid-cols-5",
        7: "grid-cols-7",
        8: "grid-cols-8",
    };

    return (
        <div className={`grid ${colMap[cols]} items-center py-3 border-b text-sm`}>
            {children}
        </div>
    );
};

const IconButton = ({ icon, danger, ...props }) => (
    <button {...props} className={danger ? "text-red-600" : "text-gray-600"}>
        {icon}
    </button>
);

const AddLine = ({ label, onClick }) => (
    <button onClick={onClick} className="text-blue-600 text-sm mt-3">
        {label}
    </button>
);

const Summary = ({ label, value, color }) => (
    <div className="text-right">
        <div className={`font-semibold ${color}`}>
            ฿{Number(value).toFixed(2)}
        </div>
        <div className="text-gray-500">{label}</div>
    </div>
);

const Modal = ({ title, children, onClose }) => (

    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

        <div className="bg-white rounded-xl p-6 w-96 shadow">

            <div className="flex justify-between items-center mb-4">

                <h2 className="text-lg font-semibold">{title}</h2>

                <button onClick={onClose}>✕</button>

            </div>

            <div className="space-y-3">
                {children}
            </div>

        </div>

    </div>

);

const ModalActions = ({ onCancel, onSave }) => (

    <div className="flex justify-end gap-3 mt-4">

        <Button
            variant="secondary"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg"
        >
            Cancel
        </Button>

        <Button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
            Save

        </Button>

    </div>
);