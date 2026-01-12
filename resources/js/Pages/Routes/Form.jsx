import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FormWrapper, Label, Input, Textarea, Select, Button, Link } from '../../components';

const RouteForm = ({ route = null, statuses=[], pageTitle }) => {
    const [formData, setFormData] = useState({
        name: route?.name || "",
        origin: route?.origin || "",
        destination: route?.destination || "",
        total_distance: route?.total_distance || "",
        estimate_duration: route?.estimate_duration || "",
        status: route?.status ?? 0,
        remark: route?.remark || "",
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const method = route ? "put" : "post";
        const url = route ? `/transport-routes/${route.id}` : "/transport-routes";

        Inertia[method](url, formData, {
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
                Inertia.visit("/transport-routes");
            }
        });
    };

    return (
        <div className="container mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
                {route && (
                    <Link href={`/transport-routes/${route.id}/checkpoints`}>
                        Checkpoints
                    </Link>
                )}
            </div>

            <div className="p-6">
                <FormWrapper onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">

                        {/* Name */}
                        <div>
                            <Label htmlFor="name" required>Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                        </div>

                        {/* Origin */}
                        <div>
                            <Label htmlFor="origin">Origin</Label>
                            <Input
                                id="origin"
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                error={errors.origin}
                            />
                        </div>

                        {/* Destination */}
                        <div>
                            <Label htmlFor="destination">Destination</Label>
                            <Input
                                id="destination"
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                error={errors.destination}
                            />
                        </div>

                        {/* Distance */}
                        <div>
                            <Label htmlFor="total_distance">Total Distance</Label>
                            <Input
                                id="total_distance"
                                name="total_distance"
                                value={formData.total_distance}
                                onChange={handleChange}
                                error={errors.total_distance}
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <Label htmlFor="estimate_duration">Estimate Duration</Label>
                            <Input
                                id="estimate_duration"
                                name="estimate_duration"
                                value={formData.estimate_duration}
                                onChange={handleChange}
                                error={errors.estimate_duration}
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
                                aria-invalid={!!errors.status}
                                aria-describedby="status-error"
                                error={errors.status}
                            />
                        </div>

                        {/* Remark */}
                        <div className="col-span-2">
                            <Label htmlFor="remark">Remark</Label>
                            <Textarea
                                id="remark"
                                name="remark"
                                value={formData.remark}
                                onChange={handleChange}
                                error={errors.remark}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <Button
                            onClick={() => Inertia.visit("/transport-routes")}
                            variant="secondary"
                            disabled={processing}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </FormWrapper>
            </div>
        </div>
    );
};

export default RouteForm;
