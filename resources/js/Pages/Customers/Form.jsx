import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { FormWrapper, Label, Input, Button, Select, Textarea } from "../../components";

const CustomerForm = ({ customer = null, statuses = [], customer_types=[], pageTitle }) => {
    
    const [formData, setFormData] = useState({
        cus_id: customer?.cus_id || "",
        name: customer?.name || "",
        customer_type: customer?.customer_type || "",
        status: customer?.status ?? 0,

        contact_person: customer?.contact_person || "",
        designation: customer?.designation || "",
        email: customer?.email || "",
        phone: customer?.phone || "",
        secondary_phone: customer?.secondary_phone || "",
        whatsapp: customer?.whatsapp || "",

        billing_address: customer?.billing_address || "",
        billing_country: customer?.billing_country || "",
        billing_state: customer?.billing_state || "",
        billing_city: customer?.billing_city || "",
        billing_zip: customer?.billing_zip || "",

        shipping_address: customer?.shipping_address || "",
        shipping_country: customer?.shipping_country || "",
        shipping_state: customer?.shipping_state || "",
        shipping_city: customer?.shipping_city || "",
        shipping_zip: customer?.shipping_zip || "",

        credit_limit: customer?.credit_limit || "",
        currency: customer?.currency || "",
        payment_terms: customer?.payment_terms || "",
        tax_id: customer?.tax_id || "",
        invoice_email: customer?.invoice_email || "",

        notes: customer?.notes || "",
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = customer ? `/customers/${customer.cus_id}` : "/customers";
        const method = customer ? "put" : "post";

        Inertia[method](url, formData, {
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
                Inertia.visit("/customers");
            },
        });
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            </div>

            <div className="p-6">
                <FormWrapper onSubmit={handleSubmit}>

                    <h2 className="text-lg font-semibold bold">Basic Information</h2>
                    <div className="border-t border-gray-200 mt-3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">

                        <div>
                            <Label htmlFor="cus_id" required>Customer Code</Label>
                            <Input name="cus_id" value={formData.cus_id} onChange={handleChange} error={errors.cus_id} disabled/>
                        </div>

                        <div>
                            <Label htmlFor="name" required>Customer Name</Label>
                            <Input name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                        </div>

                        <div>
                            <Label htmlFor="customer_type" required>Customer Type</Label>
                            <Select
                                id="customer_type"
                                name="customer_type"
                                value={formData.customer_type}
                                onChange={handleChange}
                                options={customer_types}
                                placeholder="Select Type"
                                aria-invalid={!!errors.customer_type}
                                aria-describedby="customer_type-error"
                                error={errors.customer_type}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status" required>Status</Label>
                            <Select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={statuses}
                                placeholder="Select Status"
                                aria-invalid={!!errors.status}
                                aria-describedby="status-error"
                                error={errors.status}
                            />
                        </div>

                    </div>

                    <h2 className="text-lg font-semibold bold pt-10">Contact Details</h2>
                    <div className="border-t border-gray-200 mt-3"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">

                        <div>
                            <Label>Contact Person</Label>
                            <Input name="contact_person" value={formData.contact_person} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Designation</Label>
                            <Input name="designation" value={formData.designation} onChange={handleChange} />
                        </div>

                        <div>
                            <Label required>Email</Label>
                            <Input name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                        </div>

                        <div>
                            <Label>Phone</Label>
                            <Input name="phone" value={formData.phone} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Secondary Phone</Label>
                            <Input name="secondary_phone" value={formData.secondary_phone} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>WhatsApp</Label>
                            <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                        </div>
                    </div>

        
                    <h2 className="text-lg font-semibold bold pt-10">Address Details</h2>
                    <div className="border-t border-gray-200 mt-3"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">

                        <div className="sm:col-span-2">
                            <Label>Billing Address</Label>
                            <Textarea name="billing_address" value={formData.billing_address} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Country</Label>
                            <Input name="billing_country" value={formData.billing_country} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>State</Label>
                            <Input name="billing_state" value={formData.billing_state} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>City</Label>
                            <Input name="billing_city" value={formData.billing_city} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>ZIP</Label>
                            <Input name="billing_zip" value={formData.billing_zip} onChange={handleChange} />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold bold pt-10">Shipping Address</h3>
                    <div className="border-t border-gray-200 mt-3"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">

                        <div className="sm:col-span-2">
                            <Label>Shipping Address</Label>
                            <Textarea name="shipping_address" value={formData.shipping_address} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Country</Label>
                            <Input name="shipping_country" value={formData.shipping_country} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>State</Label>
                            <Input name="shipping_state" value={formData.shipping_state} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>City</Label>
                            <Input name="shipping_city" value={formData.shipping_city} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>ZIP</Label>
                            <Input name="shipping_zip" value={formData.shipping_zip} onChange={handleChange} />
                        </div>
                    </div>

        
                    <h2 className="text-lg font-semibold bold pt-10">Financials & Billing</h2>
                    <div className="border-t border-gray-200 mt-3"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">

                        <div>
                            <Label>Credit Limit (USD)</Label>
                            <Input name="credit_limit" value={formData.credit_limit} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Currency</Label>
                            <Input name="currency" value={formData.currency} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Payment Terms</Label>
                            <Input name="payment_terms" value={formData.payment_terms} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Tax ID</Label>
                            <Input name="tax_id" value={formData.tax_id} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Invoice Email</Label>
                            <Input name="invoice_email" value={formData.invoice_email} onChange={handleChange} />
                        </div>
                    </div>

        
                    <h2 className="text-lg font-semibold bold pt-6 px-2">Additional Notes</h2>
                    <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full"
                        rows={4}
                    />

                    {/* ------------------------------------------------------ */}
                    {/* BUTTONS */}
                    {/* ------------------------------------------------------ */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="secondary" onClick={() => Inertia.visit("/customers")}>
                            Cancel
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : customer ? "Update" : "Save"}
                        </Button>
                    </div>

                </FormWrapper>
            </div>
        </div>
    );
};

export default CustomerForm;
