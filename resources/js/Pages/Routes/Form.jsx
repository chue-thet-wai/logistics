import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FormWrapper, Label, Input, Button } from '../../components';

const RouteForm = ({ route = null ,pageTitle }) => {
    const [formData, setFormData] = useState({
        name: route?.name || '',
        city: route?.city || '',
        state: route?.state || '',
        country: route?.country || '',
        zip_code: route?.zip_code || '',
        address: route?.address || '',
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

        const action = route ? 'put' : 'post';
        const url = route ? `/routes/${route.id}` : '/routes';

        Inertia[action](url, formData, {
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
            onSuccess: () => {
                Inertia.visit('/routes');
                setProcessing(false);
            }
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
                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                            <Label htmlFor="name" required>Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter Route Name"
                                error={errors.name}
                            />
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
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
                                placeholder="State"
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
                                placeholder="Country"
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
                                placeholder="Zip Code"
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


                    <div className="flex justify-end space-x-3 mt-4">
                        <Button onClick={() => Inertia.visit('/routes')} variant="secondary" disabled={processing}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save'}</Button>
                    </div>
                </FormWrapper>
            </div>
            
        </div>
    );
};

export default RouteForm;
