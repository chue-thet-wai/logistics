import React, { useState,useRef } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Table, ButtonIcon, Button , Link, Label } from "../../components";
import { FaEye, FaUpload } from "react-icons/fa";

const DocumentUpload = ({ job, attachments , pageTitle }) => {
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState("Bill of Lading");
    const fileRef = useRef(null);

    const handleUpload = (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("document_type", documentType);

        Inertia.post(`/jobs/${job.shipment_id}/documents`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setFile(null);
                setDocumentType("Bill of Lading");
                if (fileRef.current) fileRef.current.value = "";
            }
        });
    };

    const handleReplace = (attachmentId, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        Inertia.post(`/jobs/${job.shipment_id}/documents/${attachmentId}/replace`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setFile(null);
                setDocumentType("Bill of Lading");
                if (fileRef.current) fileRef.current.value = "";
            }
        });
    };

    const columns = [
        { header: "Document Type", field: "document_type" },
        { header: "File Name", field: "file_name" },
        { header: "Uploaded By", field: "creator.name" },
        {
            header: "Date",
            render: (row) =>
                new Date(row.created_at).toLocaleDateString(),
        },
    ];

    // Row Actions
    const RowActions = ({ row }) => (
        <div className="flex items-center space-x-4">

            {/* View Link */}
            <a
                href={row.file_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${
                    row.file_url ? "text-blue-600" : "text-gray-400 pointer-events-none"
                }`}
            >
                View
            </a>

            {/* Replace Link */}
            <label className="text-green-600 underline text-sm cursor-pointer">
                Replace
                <input
                    type="file"
                    ref={fileRef}
                    className="hidden"
                    onChange={(e) => handleReplace(row.id, e.target.files[0])}
                />
            </label>

        </div>
    );


    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
                <Link href={`/jobs/${job.shipment_id}/edit`}>Shipment Details</Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow m-6">
                <Table
                    columns={columns}
                    tableData={{ data: attachments, last_page: 1 }} 
                    actions={(row) => <RowActions row={row} />}
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow m-6">
                <Label htmlFor="name" required>Upload Section</Label>

                {/* Document Type */}
                <select
                    className="border px-3 py-2 rounded w-full mb-3"
                    value={documentType}
                    required
                    onChange={(e) => setDocumentType(e.target.value)}
                >
                    <option value="Bill of Lading">Bill of Lading</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Delivery Order">Delivery Order</option>
                    <option value="Customs Form">Customs Form</option>
                    <option value="Proof of Delivery">Proof of Delivery</option>
                </select>

                {/* File Upload */}
                <label className="border-dashed border-2 rounded-xl p-10 block text-center cursor-pointer">
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="mt-1"
                    />
                </label>

                {/* Upload Button */}
                <div className="text-right mt-4">
                    <Button onClick={handleUpload}>Upload File</Button>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
