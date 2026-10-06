import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FormWrapper, Label, Input, Button, Textarea, Select } from '../../components';

const TruckForm = ({ truck = null, statuses =[], pageTitle }) => {
    const [formData, setFormData] = useState({
        truck_id: truck?.truck_id || '',
        truck_number: truck?.truck_number || '',
        vehicle_type: truck?.vehicle_type || '',
        status: truck?.status || '0',
        remark: truck?.remark || '',
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

        const action = truck ? 'put' : 'post';
        const url = truck ? `/trucks/${truck.truck_id}` : '/trucks';

        Inertia[action](url, formData, {
            onError: (errors) => { setErrors(errors); setProcessing(false); },
            onSuccess: () => { Inertia.visit('/trucks'); setProcessing(false); },
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
                        <Button variant="secondary" onClick={() => Inertia.visit('/trucks')} disabled={processing}>
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

export default TruckForm;
