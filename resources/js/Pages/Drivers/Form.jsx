import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FormWrapper, Label, Input, Button } from '../../components';

const DriverForm = ({ driver = null ,pageTitle }) => {
    const [formData, setFormData] = useState({
        driver_id: driver?.driver_id || '',
        name: driver?.name || '',
        email: driver?.email || '',
        phone: driver?.phone || '',
        city: driver?.city || '',
        state: driver?.state || '',
        country: driver?.country || '',
        zip_code: driver?.zip_code || '',
        address: driver?.address || '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
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
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}                    
                </h1>
            </div>
            <div className='p-6'>
                <FormWrapper onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">

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

                        <div>
                            <Label htmlFor="email" required>Email</Label>
                            <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                        </div>

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

                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={errors.city}
                            />
                        </div>

                        <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
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
                                error={errors.country}
                            />
                        </div>

                        <div>
                            <Label htmlFor="zip_code">Zip Code</Label>
                            <Input
                                id="zip_code"
                                name="zip_code"
                                value={formData.zip_code}
                                onChange={handleChange}
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
                                error={errors.address}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                        <Button onClick={() => Inertia.visit('/drivers')} variant="secondary" disabled={processing}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving' : 'Save'}</Button>
                    </div>
                </FormWrapper>
            </div>
        </div>
    );
};

export default DriverForm;
