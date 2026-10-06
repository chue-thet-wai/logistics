import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { motion, AnimatePresence } from "framer-motion";
import { FormWrapper, Label, Input, Select, Button, SearchableSelect } from "../../components";
import { ChevronDown, ChevronRight } from "lucide-react";

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

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 py-4 border-t"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const JobForm = ({
    job = null,
    customers = [],
    categories = [],
    modes = [],
    loading_ports = [],
    discharge_ports = [],
    carriers = [],
    consignees = [],
    shipment_types = [],
    bl_statuses = [],
    free_day_types = [],
    pageTitle
}) => {

    const [formData, setFormData] = useState({
        shipment_id: job?.shipment_id || "",
        booking_id: job?.booking_id || "",
        cus_id: job?.cus_id || "",
        mode: job?.mode ?? 2,
        category: job?.category ?? 2,
        eta: job?.eta || "",
        si_number: job?.si_number || "",
        loading_port: job?.loading_port ?? "",
        discharge_port: job?.discharge_port ?? "",
        master_bl_number: job?.master_bl_number || "",
        house_bl_number: job?.house_bl_number || "",
        forwarder: job?.forwarder || "",
        carrier: job?.carrier ?? "",
        shipper_name: job?.shipper_name || "",
        consignee: job?.consignee ?? "",
        type: job?.type ?? "",
        bl_status: job?.bl_status ?? 3,
        free_day_type: job?.free_day_type ?? 1,
        surrendered_date: job?.surrendered_date || "",
    });

    const [processing, setProcessing] = useState(false);
    const { flash, errors } = usePage().props;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e, submitType) => {
        e.preventDefault();

        const payload = {
            ...formData,
            submitType
        };

        const url = job ? `/jobs/${job.shipment_id}` : "/jobs";
        const method = job ? "put" : "post";

        Inertia[method](url, payload);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center border-b px-6 pb-3 mb-4">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            </div>

            {flash?.error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
                    {flash.error}
                </div>
            )}

            <FormWrapper>
                <CollapsibleCard title="Basic Shipment Information" defaultOpen>
                    <div className="grid grid-cols-2 gap-6">

                        <div>
                            <Label>Shipment ID</Label>
                            <Input name="shipment_id" value={formData.shipment_id} disabled />
                        </div>

                        <div>
                            <Label>Booking ID</Label>
                            <Input name="booking_id" value={formData.booking_id} disabled />
                        </div>

                        <div>
                            <Label required>Customer</Label>
                            <SearchableSelect
                                name="cus_id"
                                value={formData.cus_id}
                                onChange={handleChange}
                                options={customers.map(c => ({
                                    value: c.cus_id,
                                    label: c.name
                                }))}
                                error={errors.cus_id}
                            />
                        </div>

                        <div>
                            <Label>ETA</Label>
                            <Input type="date" name="eta" value={formData.eta} onChange={handleChange} />
                        </div>

                         {/* Mode */}
                        <div>
                            <Label required>Mode</Label>
                            <div className="flex gap-4 mt-1 mb-1">
                                <Select
                                    id="mode"
                                    name="mode"
                                    value={formData.mode}
                                    onChange={handleChange}
                                    options={modes}
                                    placeholder="Select Mode"
                                    aria-invalid={!!errors.mode}
                                    aria-describedby="mode-error"
                                    error={errors.mode}
                                />
                            </div>
                        </div>
                        {/* Shipment Category */}
                        <div>
                            <Label required>Shipment Category</Label>

                            <div className="flex gap-4 mt-1 mb-1">
                                {categories.map((category) => (
                                    <label key={category.value} className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={category.value}
                                            checked={formData.category == category.value}
                                            onChange={handleChange}
                                        />
                                        {category.label}
                                    </label>
                                ))}
                            </div>

                            {errors.category && (
                                <p className="text-red-500 text-sm">
                                    {errors.category}
                                </p>
                            )}
                        </div>                        

                        <div>
                            <Label>Port of Loading(Origin)</Label>
                            <SearchableSelect
                                name="loading_port"
                                value={formData.loading_port}
                                onChange={handleChange}
                                options={loading_ports}
                                placeholder="Search loading port..."
                                error={errors.loading_port}
                            />
                        </div>

                        <div>
                            <Label>Port of Discharge(Discharge)</Label>
                            <SearchableSelect
                                name="discharge_port"
                                value={formData.discharge_port}
                                onChange={handleChange}
                                options={discharge_ports}
                                placeholder="Search discharge port..."
                                error={errors.discharge_port}
                            />
                        </div>

                        <div>
                            <Label>Master BL Number</Label>
                            <Input 
                                name="master_bl_number" 
                                value={formData.master_bl_number} 
                                onChange={handleChange} 
                                error={errors.master_bl_number}
                            />
                        </div>

                        <div>
                            <Label>House BL Number</Label>
                            <Input 
                                name="house_bl_number" 
                                value={formData.house_bl_number}
                                onChange={handleChange} 
                                error={errors.house_bl_number}
                            />
                        </div>

                        <div>
                            <Label>Forwarder</Label>
                            <Input name="forwarder" value={formData.forwarder} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>SI Number</Label>
                            <Input name="si_number" value={formData.si_number} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Carrier</Label>
                            <SearchableSelect
                                name="carrier"
                                value={formData.carrier}
                                onChange={handleChange}
                                options={carriers}
                                placeholder="Search carrier..."
                                error={errors.carrier}
                            />
                        </div>  

                        <div>
                            <Label required>Consignee</Label>
                            <SearchableSelect
                                name="consignee"
                                value={formData.consignee}
                                onChange={handleChange}
                                options={consignees}
                                placeholder="Search consignee..."
                                error={errors.consignee}
                            />
                        </div>

                        <div>
                            <Label>Shipper Name</Label>
                            <Input name="shipper_name" value={formData.shipper_name} onChange={handleChange} />
                        </div>

                        <div>
                            <Label required>Shipment Type</Label>
                            <Select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                options={shipment_types}
                                error={errors.type}
                            />
                        </div>

                        <div>
                            <Label required>BL Status</Label>
                            <Select
                                name="bl_status"
                                value={formData.bl_status}
                                onChange={handleChange}
                                options={bl_statuses}
                                error={errors.bl_status}
                            />
                        </div>

                        <div>
                            <Label required>Free Day Type</Label>
                            <Select
                                name="free_day_type"
                                value={formData.free_day_type}
                                onChange={handleChange}
                                options={free_day_types}
                                error={errors.free_day_type}
                            />
                        </div>

                        <div>
                            <Label>Surrendered Date</Label>
                            <Input type="date" name="surrendered_date" value={formData.surrendered_date} onChange={handleChange} />
                        </div>

                    </div>
                </CollapsibleCard>

                {/* BUTTONS — UNCHANGED */}
                <div className="flex justify-end mt-6 space-x-3">
                    <Button type="button" variant="secondary" onClick={() => Inertia.visit("/jobs")}>
                        Cancel
                    </Button>

                    {job && (
                        <>
                            <Button type="button" onClick={() => Inertia.visit(`/jobs/${job.shipment_id}/documents`)}>
                                Document Attached
                            </Button>

                            <Button type="button" onClick={() => Inertia.visit(`/jobs/${job.shipment_id}/containers`)}>
                                Container Information
                            </Button>
                        </>
                    )}

                    <Button type="button" disabled={processing}  onClick={(e) => handleSubmit(e, "save")}>
                        {processing && formData.submitType === "save"
                                                    ? "Saving..."
                                                    : "Save"}
                    </Button>
                    {job.status == 0 && (
                        <Button type="button" disabled={processing} onClick={(e) => handleSubmit(e, "continue")}>
                            {processing && formData.submitType === "continue"
                                                        ? "Approving to Driver Assign"
                                                        : "Approve to Driver Assign"}
                        </Button>
                    )}
                </div>
            </FormWrapper>
        </div>
    );
};

export default JobForm;