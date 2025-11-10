import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FormWrapper, Label, Input, Button } from '../../components';

const RoleForm = ({ role = null, permissions = [] ,pageTitle }) => {
    const [formData, setFormData] = useState({
        name: role ? role.name : '',
        permissions: role && role.permissions ? role.permissions.map(p => p.id) : [],
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            const permissionId = parseInt(value, 10);
            setFormData((prevData) => {
                const newPermissions = checked
                    ? [...prevData.permissions, permissionId]
                    : prevData.permissions.filter((item) => item !== permissionId);

                return { ...prevData, permissions: newPermissions };
            });
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        const action = role ? 'put' : 'post';
        const url = role ? `/roles/${role.id}` : '/roles';

        Inertia[action](url, formData, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                Inertia.visit('/roles');
                setProcessing(false);
            },
        });
    };

    const actionsFilter = ['View', 'Create', 'Edit', 'Delete', 'Export'];

    const filteredPermissions = permissions.filter((permission) =>
        actionsFilter.some((action) => permission.name.startsWith(action))
    );

    const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
        const [action, ...menuParts] = permission.name.split(' ');
        const menu = menuParts.join(' ');

        if (!acc[menu]) {
            acc[menu] = [];
        }
        acc[menu].push({ action, id: permission.id });
        return acc;
    }, {});

    const actions = ['View', 'Create', 'Edit', 'Delete', 'Export'];

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}                    
                </h1>
            </div>
            <div className='p-6'>
                <FormWrapper onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <Label htmlFor="name" required>{"Role Name"}</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={"Role Name"}
                            aria-invalid={!!errors.name}
                            aria-describedby="name-error"
                            error={errors.name}
                        />
                    </div>

                    <div className="mb-6">
                        <Label htmlFor="permissions">{"Permissions"}</Label>
                        <table className="min-w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">{"Menu"}</th>
                                    {actions.map((action) => (
                                        <th key={action} className="px-4 py-2 text-left">{action.toLowerCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(groupedPermissions).map((menu) => (
                                    <tr key={menu}>
                                        <td className="px-4 py-2 font-medium text-gray-700">{menu}</td>
                                        {actions.map((action) => {
                                            const permission = groupedPermissions[menu].find(
                                                (perm) => perm.action === action
                                            );
                                            if (!permission) return <td key={action}></td>;

                                            const isChecked = formData.permissions.includes(permission.id);

                                            return (
                                                <td key={action} className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        name="permissions"
                                                        value={permission.id}
                                                        checked={isChecked}
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                        className="h-5 w-5 text-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {errors.permissions && (
                            <div className="mt-2 text-red-500 text-sm">{errors.permissions}</div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={() => Inertia.visit('/roles')}
                            variant="secondary"
                            disabled={processing}
                        >
                            {"Cancel"}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving" : "Save"}
                        </Button>
                    </div>
                </FormWrapper>
            </div>
        </div>
    );
};

export default RoleForm;
