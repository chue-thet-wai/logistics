import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FormWrapper, Label, Input, Button, Textarea, Select } from '../../components';

const DriverForm = ({ driver = null, routes = [], checkpoints = [], statuses =[], pageTitle }) => {
    const [formData, setFormData] = useState({
        driver_id: driver?.driver_id || '',
        name: driver?.name || '',
        email: driver?.email || '',
        phone: driver?.phone || '',
        truck_number: driver?.truck_number || '',
        vehicle_type: driver?.vehicle_type || '',
        status: driver?.status || '0',
        route: driver?.route || '',
        checkpoint: driver?.checkpoint || '',
        remark: driver?.remark || '',
    });

    const filteredCheckpoints = checkpoints.filter(c => c.route_id == formData.route);

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // reset checkpoint if route changes
        if (name === 'route') setFormData(prev => ({ ...prev, checkpoint: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const action = driver ? 'put' : 'post';
        const url = driver ? `/drivers/${driver.id}` : '/drivers';

        Inertia[action](url, formData, {
            onError: (errors) => { setErrors(errors); setProcessing(false); },
            onSuccess: () => { Inertia.visit('/drivers'); setProcessing(false); },
        });
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            </div>

            <div className="p-6">
                <FormWrapper onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">

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

                        {/* Email */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
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
                                aria-invalid={!!errors.status}
                                aria-describedby="status-error"
                                error={errors.status}
                            />
                        </div>
                        

                        {/* Route */}
                        <div>
                            <Label htmlFor="route">Route</Label>
                            <Select
                                name="route"
                                value={formData.route}
                                onChange={handleChange}
                                options={routes.map(r => ({ value: r.id, label: r.name }))}
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
                                options={filteredCheckpoints.map(c => ({ value: c.id, label: c.name }))}
                                placeholder="Select Checkpoint"
                                error={errors.checkpoint}
                                disabled={!formData.route}
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
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                        <Button variant="secondary" onClick={() => Inertia.visit('/drivers')} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </FormWrapper>
            </div>
        </div>
    );
};

export default DriverForm;
