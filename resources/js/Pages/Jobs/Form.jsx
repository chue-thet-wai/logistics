import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { motion, AnimatePresence } from "framer-motion";
import { FormWrapper, Label, Input, Textarea, Select, Button } from "../../components";
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

const JobForm = ({ job = null, customers, categories=[], routes=[], pageTitle }) => {
    const [formData, setFormData] = useState({
        shipment_id: job?.shipment_id || "",
        booking_id: job?.booking_id || lead?.booking_id || "",
        cus_id: job?.cus_id || lead?.cus_id || "",
        mode: job?.mode || lead?.mode || "",
        eta: job?.eta || lead?.eta || "",
        containers: job?.containers || lead?.containers || "",
        category: job?.category || lead?.category || "",
        bl_number: job?.bl_number || lead?.bl_number || "",
        free_day: job?.free_day || lead?.free_day || "",
        origin: job?.origin || "",
        destination: job?.destination || "",
        shipment_type: job?.shipment_type || "",
        // operational
        operational_pickup_date: job?.operational_pickup_date || "",
        operational_container_info: job?.operational_container_info || "",
        operational_gatepass_info: job?.operational_gatepass_info || "",
        operational_receiving_confirmation: job?.operational_receiving_confirmation || "",
        // detention
        detention_free_days: job?.detention_free_days || "",
        detention_used_days: job?.detention_used_days || "",
        detention_extra_days: job?.detention_extra_days || "",
        detention_rate: job?.detention_rate || "",
        detention_total: job?.detention_total || "",
        detention_remark: job?.detention_remark || "",
        // demurrage
        demurrage_free_days: job?.demurrage_free_days || "",
        demurrage_used_days: job?.demurrage_used_days || "",
        demurrage_extra_days: job?.demurrage_extra_days || "",
        demurrage_rate: job?.demurrage_rate || "",
        demurrage_total: job?.demurrage_total || "",
        demurrage_remark: job?.demurrage_remark || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // When route changes, auto-fill origin & destination
        if (name === "route_id") {
            const selectedRoute = routes.find(r => r.id === parseInt(value));
            setFormData(prev => ({
                ...prev,
                route_id: value,
                origin: selectedRoute?.origin || "",
                destination: selectedRoute?.destination || "",
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e, submitType) => {
        e.preventDefault();

        const payload = { ...formData, submitType };

        const url = job ? `/jobs/${job.id}` : "/jobs";
        const method = job ? "put" : "post";

        Inertia[method](url, payload);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center border-b px-6 pb-3 mb-4">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            </div>

            <FormWrapper onSubmit={handleSubmit}>
                {/* Basic Shipment Info */}
                <CollapsibleCard title="Basic Shipment Information" defaultOpen>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Shipment ID</Label>
                            <Input name="shipment_id" value={formData.shipment_id} disabled />
                        </div>
                        <div>
                            <Label>Booking ID</Label>
                            <Input name="booking_id" value={formData.booking_id} disabled />
                        </div>
                        <div>
                            <Label>Customer</Label>
                            <Select
                                name="cus_id"
                                value={formData.cus_id}
                                onChange={handleChange}
                                options={customers.map((c) => ({
                                    value: c.cus_id,
                                    label: c.name,
                                }))}
                            />
                        </div>
                        <div>
                            <Label>Shipment Category</Label>
                            <Select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                options={categories}
                            />
                        </div>
                       <div>
                            <Label required>Mode</Label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="air"
                                        checked={formData.mode === "air"}
                                        onChange={handleChange}
                                    />
                                    Air
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="sea"
                                        checked={formData.mode === "sea"}
                                        onChange={handleChange}
                                    />
                                    Sea
                                </label>
                            </div>
                        </div>
                        <div>
                            <Label>ETA (Expected Arrival Date)</Label>
                            <Input type="date" name="eta" value={formData.eta} onChange={handleChange} />
                        </div>
                        <div>
                            <Label required>Route</Label>
                            <Select
                                name="route_id"
                                value={formData.route_id}
                                onChange={handleChange}
                                options={routes.map(r => ({
                                    value: r.id,
                                    label: r.name
                                }))}
                            />
                        </div>
                        <div></div>
                        <div>
                            <Label>Port of Loading (Origin)</Label>
                            <Input name="origin" value={formData.origin} onChange={handleChange}  disabled/>
                        </div>
                        <div>
                            <Label>Port of Discharge (Destination)</Label>
                            <Input name="destination" value={formData.destination} onChange={handleChange}  disabled/>
                        </div>
                        <div>
                            <Label>BL Number</Label>
                            <Input name="bl_number" value={formData.bl_number} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Free Days</Label>
                            <Input type="number" name="free_day" value={formData.free_day} onChange={handleChange} />
                        </div>
                    </div>
                </CollapsibleCard>

                {/* Operational Instructions */}
                <CollapsibleCard title="Operational Instructions">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Pickup Date</Label>
                            <Input type="date" name="operational_pickup_date" value={formData.operational_pickup_date} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Container Information</Label>
                            <Input name="operational_container_info" value={formData.operational_container_info} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Gate Pass Info</Label>
                            <Input name="operational_gatepass_info" value={formData.operational_gatepass_info} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Receiving Confirmation</Label>
                            <Input name="operational_receiving_confirmation" value={formData.operational_receiving_confirmation} onChange={handleChange} />
                        </div>
                    </div>
                </CollapsibleCard>

                {/* Detention */}
                <CollapsibleCard title="Detention Information">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Free Days</Label>
                            <Input name="detention_free_days" value={formData.detention_free_days} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Used Days</Label>
                            <Input name="detention_used_days" value={formData.detention_used_days} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Extra Days</Label>
                            <Input name="detention_extra_days" value={formData.detention_extra_days} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Rate</Label>
                            <Input name="detention_rate" value={formData.detention_rate} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Total</Label>
                            <Input name="detention_total" value={formData.detention_total} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Remarks</Label>
                            <Input name="detention_remark" value={formData.detention_remark} onChange={handleChange} />
                        </div>
                    </div>
                </CollapsibleCard>

                {/* Demurrage */}
                <CollapsibleCard title="Demurrage Information">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Free Days</Label>
                            <Input name="demurrage_free_days" value={formData.demurrage_free_days} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Used Days</Label>
                            <Input name="demurrage_used_days" value={formData.demurrage_used_days} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Extra Days</Label>
                            <Input name="demurrage_extra_days" value={formData.demurrage_extra_days} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Rate</Label>
                            <Input name="demurrage_rate" value={formData.demurrage_rate} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Total</Label>
                            <Input name="demurrage_total" value={formData.demurrage_total} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Remarks</Label>
                            <Input name="demurrage_remark" value={formData.demurrage_remark} onChange={handleChange} />
                        </div>
                    </div>
                </CollapsibleCard>

                <div className="flex justify-end mt-6 space-x-3">
                    <Button type="button" variant="secondary" onClick={() => Inertia.visit("/jobs")}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={() => Inertia.visit(`/jobs/${job.id}/documents`)}>
                        Document Attached
                    </Button>
                    <Button
                        type="button"
                        onClick={(e) => handleSubmit(e, "save")}
                    >
                        Save
                    </Button>

                    <Button
                        type="button"
                        onClick={(e) => handleSubmit(e, "continue")}
                    >
                        Save & Continue to Driver Assign
                    </Button>
                </div>
            </FormWrapper>
        </div>
    );
};

export default JobForm;
