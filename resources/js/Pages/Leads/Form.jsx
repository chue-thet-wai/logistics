import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { FormWrapper, Label, Input, Button, Select } from "../../components";

const LeadForm = ({ lead = null, customers, categories=[], pageTitle  }) => {
    const [formData, setFormData] = useState({
        booking_id : lead?.booking_id || "",
        cus_id: lead?.cus_id || "",
        mode: lead?.mode || "",
        containers: lead?.containers || "",
        eta: lead?.eta || "",
        category: lead?.category || "",
        bl_number: lead?.bl_number || "",
        free_day: lead?.free_day || "",
        files: [],
        submitType: "",
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setFormData((prev) => ({
                ...prev,
                files: [...files],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e, type = "") => {
        e.preventDefault();

        setFormData((prev) => ({ ...prev, submitType: type }));
        setProcessing(true);

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === "files") {
                formData.files.forEach((f, i) => data.append(`files[${i}]`, f));
            } else {
                data.append(key, formData[key]);
            }
        });
        data.append("submitType", type);

        const action = lead ? 'post' : 'post';
        const url = lead ? `/leads/${lead.id}/update` : '/leads';      
                
        Inertia[action](url, data, {
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
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            </div>

            <div className="p-6">
                <FormWrapper onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Booking ID</Label>
                            <Input
                                id="booking_id"
                                name="booking_id"
                                type="text"
                                value={formData.booking_id}
                                onChange={handleChange}
                                disabled = "disabled"
                                className="bg-gray-100"
                            />
                        </div>

                        <div>
                            <Label htmlFor="cus_id" required>
                                Customer
                            </Label>
                            <Select
                                id="cus_id"
                                name="cus_id"
                                value={formData.cus_id}
                                onChange={handleChange}
                                options={customers.map((c) => ({
                                    value: c.cus_id,
                                    label: c.name,
                                }))}
                                placeholder="Select Customer"
                                error={errors.cus_id}
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
                            {errors.mode && (
                                <p className="text-red-500 text-sm">{errors.mode}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="eta" required>
                                ETA
                            </Label>
                            <Input
                                type="date"
                                id="eta"
                                name="eta"
                                value={formData.eta}
                                onChange={handleChange}
                                error={errors.eta}
                            />
                        </div>

                        <div>
                            <Label htmlFor="containers">No. of Containers</Label>
                            <Input
                                type="number"
                                id="containers"
                                name="containers"
                                value={formData.containers}
                                onChange={handleChange}
                                error={errors.containers}
                            />
                        </div>

                        <div>
                            <Label htmlFor="category" required>
                                Category
                            </Label>
                            <Select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                options={categories}
                                placeholder="Select Category"
                                error={errors.category}
                            />
                        </div>

                        <div>
                            <Label htmlFor="bl_number">BL Number</Label>
                            <Input
                                id="bl_number"
                                name="bl_number"
                                value={formData.bl_number}
                                onChange={handleChange}
                                placeholder="Enter BL Number"
                                error={errors.bl_number}
                            />
                        </div>

                        <div>
                            <Label htmlFor="free_day">Free Day</Label>
                            <Input
                                id="free_day"
                                name="free_day"
                                type="number"
                                value={formData.free_day}
                                onChange={handleChange}
                                placeholder="Enter Free Day"
                                error={errors.free_day}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <Label>Document Upload (Multiple)</Label>
                        <input
                            type="file"
                            multiple
                            accept="application/pdf"
                            onChange={handleChange}
                            className="mt-1"
                        />
                        {errors.files && (
                            <p className="text-red-500 text-sm">{errors.files}</p>
                        )}
                        {lead?.files?.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <p className="text-sm font-semibold text-gray-600">Uploaded Files:</p>
                                <ul className="list-disc list-inside text-sm">
                                    {lead.files.map((file, index) => (
                                        <li key={index}>
                                            <a
                                                href={`http://sgp1.digitaloceanspaces.com/assets-kidcares/${file.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {file.original_name || `File ${index + 1}`}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => Inertia.visit("/leads")}
                            disabled={processing}
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

                        <Button
                            type="button"
                            disabled={processing}
                            onClick={(e) => handleSubmit(e, "confirm")}
                        >
                            {processing && formData.submitType === "confirm"
                                ? "Creating Job Sheet..."
                                : "Confirm & Create Job Sheet"}
                        </Button>
                    </div>
                </FormWrapper>
            </div>
        </div>
    );
};

export default LeadForm;
