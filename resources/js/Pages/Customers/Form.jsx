import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { FormWrapper, Label, Input, Button } from "../../components";

const CustomerForm = ({ customer = null , pageTitle }) => {
  const [formData, setFormData] = useState({
    name: customer?.user?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    city: customer?.city || "",
    state: customer?.state || "",
    country: customer?.country || "",
    zip_code: customer?.zip_code || "",
    address: customer?.address || "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    const url = customer ? `/customers/${customer.id}` : "/customers";
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
          <h1 className="text-lg font-semibold text-gray-800">
              {pageTitle}                    
          </h1>
      </div>
      <div className='p-6'>
        <FormWrapper onSubmit={handleSubmit}>
          {/* First Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" required>Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Customer Name"
                error={errors.name}
              />
            </div>

            <div>
              <Label htmlFor="email" required>Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                error={errors.email}
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                error={errors.phone}
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter City"
                error={errors.city}
              />
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter State"
                error={errors.state}
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter Country"
                error={errors.country}
              />
            </div>
          </div>

          {/* Fourth Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="zip_code">Zip Code</Label>
              <Input
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="Enter Zip Code"
                error={errors.zip_code}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Address"
                error={errors.address}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => Inertia.visit("/customers")}
              variant="secondary"
              disabled={processing}
            >
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
