import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Link, Table, Modal, ButtonIcon } from '../../components';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { usePage } from '@inertiajs/inertia-react';
import { usePermissions } from '../../utils/usePermissions';

const Index = ({ users, pageTitle }) => {
    const { props } = usePage();
    const userPermissions = props.auth?.permissions || [];

    const [isModalOpen, setModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const { checkMenuPermissions } = usePermissions(userPermissions);
    const { canCreate, canEdit, canDelete } = checkMenuPermissions('Users');

    const columns = React.useMemo(() => [
        { header: "Name", field: 'name' },
        { header: "Email", field: 'email' },
        { header: "Roles", field: 'role' },
    ]);

    const handleDeleteClick = useCallback((id) => {
        setUserToDelete(id);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (userToDelete) {
            Inertia.delete(`/users/${userToDelete}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setUserToDelete(null);
                },
            });
        }
    }, [userToDelete]);

    const RowActions = ({ rowId }) => (
        <div className="flex items-center space-x-2">
            {canEdit && (
                <ButtonIcon
                    href={`/users/${rowId}/edit`}
                    icon={<FaEdit />}
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon" 
                    tooltip={"Edit"}
                    size="lg"
                    shadow={true}
                />
            )}
            {canDelete && (
                <ButtonIcon
                    onClick={() => handleDeleteClick(rowId)}
                    icon={<FaTrash />}
                    iconColor="text-gray-500"
                    hoverColor="hover:text-gray-700"
                    variant="icon" 
                    tooltip={"Delete"}
                    size="md"
                    shadow={true}
                    data-testid={`delete-btn-${rowId}`}
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
                    <Link href="/users/create">+ New User</Link>
                )}
            </div>

            <div className='px-6'>
                <Table
                    columns={columns}
                    tableData={users}
                    onPageChange={(page) => {
                        Inertia.get(`/users?page=${page}`, { preserveState: true });
                    }}
                    actions={(row) => <RowActions rowId={row.id} />}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title={"Confirm Delete"}
                message={"Are you sure you want to delete this record?"}
                buttonText={"Delete"}
            />
        </div>
    );
};

export default Index;
