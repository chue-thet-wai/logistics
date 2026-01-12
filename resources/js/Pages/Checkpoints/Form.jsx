import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FormWrapper, Label, Input, Textarea, Select, Button } from '../../components';

const CheckpointForm = ({ checkpoint = null, route = null, checkpoint_types=null, pageTitle }) => {
    const [formData, setFormData] = useState({
        name: checkpoint?.name || "",
        route_id: checkpoint?.route_id || route?.id || "",
        type: checkpoint?.type || "",
        eta: checkpoint?.eta || "",
        latitude: checkpoint?.latitude || "",
        longitude: checkpoint?.longitude || "",
        remark: checkpoint?.remark || "",
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

        const method = checkpoint ? "put" : "post";
        const url = checkpoint ? `/transport-routes/${route.id}/checkpoints/${checkpoint.id}` : `/transport-routes/${route.id}/checkpoints`;

        Inertia[method](url, formData, {
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
                Inertia.visit(`/transport-routes/${formData.route_id}/checkpoints`);
            }
        });
    };

    return (
        <div className="container mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
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

                        {/* Type */}
                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                options={checkpoint_types}
                                aria-invalid={!!errors.type}
                                aria-describedby="type-error"
                                error={errors.type}
                            />
                        </div>

                        {/* ETA */}
                        <div>
                            <Label htmlFor="eta">ETA</Label>
                            <Input
                                id="eta"
                                name="eta"
                                value={formData.eta}
                                onChange={handleChange}
                                error={errors.eta}
                            />
                        </div>

                        {/* Latitude */}
                        <div>
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                                id="latitude"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                error={errors.latitude}
                            />
                        </div>

                        {/* Longitude */}
                        <div>
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                                id="longitude"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                error={errors.longitude}
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
                            onClick={() => Inertia.visit(`/transport-routes/${formData.route_id}/checkpoints`)}
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

export default CheckpointForm;
