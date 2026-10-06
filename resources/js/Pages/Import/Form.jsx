import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FormWrapper, Label, Input, Button, Select } from '../../components';

const ImportForm = ({ pageTitle }) => {
    const [formData, setFormData] = useState({
        type: 'drivers',
        file: null,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'file') {
            setFormData(prev => ({ ...prev, file: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const form = new FormData();
        form.append('file', formData.file);

        Inertia.post(`/import/${formData.type}`, form, {
            forceFormData: true,
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            </div>

            <div className="p-6">
                <FormWrapper onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">

                        {/* Import Type */}
                        <div className="col-span-2">
                            <Label htmlFor="type" required>Import Type</Label>
                            <Select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                options={[
                                    { value: 'customers', label: 'Customers' },
                                    { value: 'drivers', label: 'Drivers' },
                                    { value: 'trucks', label: 'Trucks' },
                                ]}
                                placeholder="Select Type"
                                error={errors.type}
                            />
                        </div>

                        {/* File Upload */}
                        <div className="col-span-2">
                            <Label htmlFor="file" required>Excel File</Label>
                            <Input
                                type="file"
                                name="file"
                                onChange={handleChange}
                                error={errors.file}
                            />
                            {formData.file && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Selected: {formData.file.name}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <Button
                            variant="secondary"
                            onClick={() => Inertia.visit('/drivers')}
                            disabled={processing}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </FormWrapper>
            </div>
        </div>
    );
};

export default ImportForm;