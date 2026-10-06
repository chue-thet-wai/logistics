import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { FormWrapper, Label, Input, Button, Select, SearchableSelect } from "../../components";

const LeadForm = ({ lead = null, customers = [],modes=[], categories=[], pageTitle }) => {
    const [formData, setFormData] = useState({
        booking_id: lead?.booking_id || "",
        cus_id: lead?.cus_id || "",
        mode: lead?.mode || "2",
        category: lead?.category || "2",
        eta: lead?.eta || "",
        total_container: lead?.total_container || 0,

        master_bl_number: lead?.master_bl_number || "",
        house_bl_number: lead?.house_bl_number || "",
        forwarder: lead?.forwarder || "",

        demurrage_free_day: lead?.demurrage_free_day || 0,
        detention_free_day: lead?.detention_free_day || 0,

        status: lead?.status ?? 0,
        submitType: "",
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e, type = "") => {
        e.preventDefault();

        const updatedData = {
            ...formData,
            status: type === "confirm" ? 1 : 0,
            submitType: type,
        };

        setProcessing(true);

        const url = lead ? `/leads/${lead.id}` : "/leads";

        if (lead) {
            // UPDATE
            Inertia.put(url, updatedData, {
                onError: (err) => {
                    setErrors(err);
                    setProcessing(false);
                },
                onSuccess: () => {
                    setProcessing(false);
                    if (type === "save") Inertia.visit("/leads");
                    if (type === "confirm") Inertia.visit("/jobs");
                },
            });
        } else {
            // CREATE
            Inertia.post(url, updatedData, {
                onError: (err) => {
                    setErrors(err);
                    setProcessing(false);
                },
                onSuccess: () => {
                    setProcessing(false);
                    if (type === "save") Inertia.visit("/leads");
                    if (type === "confirm") Inertia.visit("/jobs");
                },
            });
        }
    };


    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
            </div>

            <div className="p-6">
                <FormWrapper onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">

                        {/* Booking ID */}
                        <div>
                            <Label>Booking ID</Label>
                            <Input
                                name="booking_id"
                                value={formData.booking_id}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>

                        {/* Customer */}
                        <div>
                            <Label required>Customer</Label>
                            <SearchableSelect
                                name="cus_id"
                                value={formData.cus_id}
                                onChange={handleChange}
                                options={customers.map((c) => ({
                                    value: c.cus_id,
                                    label: c.name,
                                }))}
                                error={errors.cus_id}
                            />
                        </div>

                        {/* Mode */}
                        <div>
                            <Label required>Mode</Label>

                            <div className="flex gap-4 mt-1">
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

                            <div className="flex gap-4 mt-1">
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

                        {/* ETA */}
                        <div>
                            <Label>ETA</Label>
                            <Input
                                type="date"
                                name="eta"
                                value={formData.eta}
                                onChange={handleChange}
                                error={errors.eta}
                            />
                        </div>

                        {/* Forwarder */}
                        <div>
                            <Label>Forwarder</Label>
                            <Input
                                name="forwarder"
                                value={formData.forwarder}
                                onChange={handleChange}
                                error={errors.forwarder}
                            />
                        </div>

                        {/* Master BL */}
                        <div>
                            <Label>Master BL Number</Label>
                            <Input
                                name="master_bl_number"
                                value={formData.master_bl_number}
                                onChange={handleChange}
                                error={errors.master_bl_number}
                            />
                        </div>

                        {/* House BL */}
                        <div>
                            <Label>House BL Number</Label>
                            <Input
                                name="house_bl_number"
                                value={formData.house_bl_number}
                                onChange={handleChange}
                                error={errors.house_bl_number}
                            />
                        </div>


                        {/* Demurrage */}
                        <div>
                            <Label>Demurrage Free Day</Label>
                            <Input
                                type="number"
                                name="demurrage_free_day"
                                value={formData.demurrage_free_day}
                                min={0}
                                onChange={handleChange}
                                error={errors.demurrage_free_day}
                            />
                        </div>

                        {/* Detention */}
                        <div>
                            <Label>Detention Free Day</Label>
                            <Input
                                type="number"
                                name="detention_free_day"
                                value={formData.detention_free_day}
                                min={0}
                                onChange={handleChange}
                                error={errors.detention_free_day}
                            />
                        </div>
                        {/* Containers */}
                        <div>
                            <Label required>No. of Containers</Label>
                            <Input
                                type="number"
                                name="total_container"
                                value={formData.total_container}
                                min={0}
                                onChange={handleChange}
                                error={errors.total_container}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-8">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => Inertia.visit("/leads")}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            disabled={processing}
                            onClick={(e) => handleSubmit(e, "save")}
                        >
                            {processing && formData.submitType === "save"
                                ? "Saving..."
                                : "Save"}
                        </Button>

                        {formData.status == 0 && (
                            <Button
                                type="button"
                                disabled={processing}
                                onClick={(e) => handleSubmit(e, "confirm")}
                            >
                                {processing && formData.submitType === "confirm"
                                    ? "Creating Job..."
                                    : "Confirm & Create Job Sheet"}
                            </Button>
                        )}
                    </div>
                </FormWrapper>
            </div>
        </div>
    );
};

export default LeadForm;
