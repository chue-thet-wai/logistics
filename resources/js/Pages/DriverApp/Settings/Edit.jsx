import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/inertia-react";
import { FaArrowLeft } from "react-icons/fa";
import {FormWrapper,Label,Input,Button,Textarea,Select,} from "@/components";

export default function Edit({
  driver,
  routes = [],
  checkpoints = [],
  statuses = [],
}) {
  const [formData, setFormData] = useState({
    name: driver?.name || "",
    phone: driver?.phone || "",
    truck_number: driver?.truck_number || "",
    vehicle_type: driver?.vehicle_type || "",
    status: driver?.status || "0",
    route: driver?.route || "",
    checkpoint: driver?.checkpoint || "",
    available: driver?.available ?? 1,
    remark: driver?.remark || "",
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const filteredCheckpoints = checkpoints.filter(
    (c) => c.route_id == formData.route
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "route" ? { checkpoint: "" } : {}),
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setProcessing(true);

    Inertia.put("/driver/settings", formData, {
      onError: (err) => {
        setErrors(err);
        setProcessing(false);
      },
      onSuccess: () => {
        Inertia.visit("/driver/settings");
        setProcessing(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between bg-white shadow fixed top-0 left-0 right-0 z-10">
        <Link href="/driver/settings" className="text-xl">
          <FaArrowLeft />
        </Link>

        <h1 className="text-lg font-semibold">Edit Driver</h1>
        <div />
      </div>

      {/* FORM */}
      <div className="pt-24 px-4 pb-10">
        <FormWrapper onSubmit={submit}>

          <div className="grid grid-cols-1 gap-4">

            {/* Name */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />
            </div>

            {/* Truck Number */}
            <div>
              <Label htmlFor="truck_number">Truck Number</Label>
              <Input
                id="truck_number"
                name="truck_number"
                value={formData.truck_number}
                onChange={handleChange}
                error={errors.truck_number}
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Input
                id="vehicle_type"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                error={errors.vehicle_type}
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statuses}
                placeholder="Select Status"
                error={errors.status}
              />
            </div>

            {/* Availability */}
            <div>
              <Label htmlFor="available">Availability</Label>
              <Select
                name="available"
                value={formData.available}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    available: Number(e.target.value),
                  })
                }
                options={[
                  { value: 1, label: "Available" },
                  { value: 0, label: "Busy" },
                ]}
              />
            </div>

            {/* Route */}
            <div>
              <Label htmlFor="route">Route</Label>
              <Select
                name="route"
                value={formData.route}
                onChange={handleChange}
                options={routes.map((r) => ({
                  value: r.id,
                  label: r.name,
                }))}
                placeholder="Select Route"
                error={errors.route}
              />
            </div>

            {/* Checkpoint */}
            <div>
              <Label htmlFor="checkpoint">Checkpoint</Label>
              <Select
                name="checkpoint"
                value={formData.checkpoint}
                onChange={handleChange}
                options={filteredCheckpoints.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder="Select Checkpoint"
                disabled={!formData.route}
                error={errors.checkpoint}
              />
            </div>

            {/* Remark */}
            <div>
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                error={errors.remark}
                rows={3}
              />
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => Inertia.visit("/driver/settings")}
              disabled={processing}
            >
              Cancel
            </Button>

            <button
              type="submit"
              disabled={processing}
              className={`w-full py-3 rounded-xl text-white bg-green-600`}
            >
              {processing ? "Saving..." : "Save"}
            </button>

          </div>

        </FormWrapper>
      </div>
    </div>
  );
}
