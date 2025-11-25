import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Link, Table, Modal, ButtonIcon } from '../../components';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { usePage } from '@inertiajs/inertia-react';
import { usePermissions } from '../../utils/usePermissions';

const Index = ({ customers, statuses = [], customer_types=[] ,pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const [isModalOpen, setModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const { checkMenuPermissions } = usePermissions(userPermissions);
    const { canCreate, canEdit, canDelete } = checkMenuPermissions('Customers');

    const columns = React.useMemo(() => [
        { header: "Customer ID", field: 'cus_id' },
        { header: "Name", field: 'name' },
        {
            header: "Type",
            field: 'customer_type',
            render: (row) => {
                const type = customer_types.find(s => s.value === row.customer_type);
                return type ? type.label : row.customer_type;
            },
        },
        { header: "Country", field: 'billing_country' },
        { header: "Contact Person", field: 'contact_person' },
        { header: "Phone", field: 'phone' },
        { header: "Email", field: 'email' },
        { header: "Credit Limit", render: (row) => `${row.credit_limit} ${row.currency}` },
        {
            header: "Status",
            field: 'status',
            render: (row) => {
                const status = statuses.find(s => s.value === row.status);
                return status ? status.label : row.status;
            },
        },
    ], []);

    const handleDeleteClick = useCallback((id) => {
        setCustomerToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (customerToDelete) {
            Inertia.delete(`/customers/${customerToDelete}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setCustomerToDelete(null);
                },
            });
        }
    }, [customerToDelete]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canEdit && (
                <ButtonIcon
                    href={`/customers/${rowId}/edit`}
                    icon={<FaEdit />}
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon" 
                    tooltip="Edit"
                    size="lg"
                    shadow
                />
            )}
            {canDelete && (
                <ButtonIcon
                    onClick={() => handleDeleteClick(rowId)}
                    icon={<FaTrash />}
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon" 
                    tooltip="Delete"
                    size="lg"
                    shadow
                />
            )}
        </div>
    );

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
                {canCreate && (
                    <Link href="/customers/create">+ New Customer</Link>
                )}
            </div>
            
            <div className='px-6'>
                <Table
                    columns={columns}
                    tableData={customers}
                    onPageChange={(page) => {
                        Inertia.get(`/customers?page=${page}`, { preserveState: true });
                    }}
                    actions={(row) => <RowActions rowId={row.id} />}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this customer?"
                buttonText="Delete"
            />
        </div>
    );
};

export default Index;
