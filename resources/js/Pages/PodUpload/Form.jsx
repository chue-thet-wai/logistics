import React, { useState, useEffect, useRef } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Table, Button, Link, Modal } from "../../components";
import { formatDateDMY } from "@/utils/dateFormat";

const PodUploadForm = ({ job, attachments = [], containers = [], container_types = [], container_statuses = [] }) => {

    const [file, setFile] = useState(null);
    const [containerFile, setContainerFile] = useState(null);
    const [documentType, setDocumentType] = useState("Bill of Lading");
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [activeTab, setActiveTab] = useState("job");

    const [csvContent, setCsvContent] = useState("");

    const [isModalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteType, setDeleteType] = useState(null);

    const fileRef = useRef(null);
    const containerFileRef = useRef(null);

    const getContainerTypeLabel = (value) => {
        const type = container_types.find(t => String(t.value) === String(value));
        return type ? type.label : value;
    };

    const getContainerStatusLabel = (value) => {
        const status = container_statuses.find(s => String(s.value) === String(value));
        return status ? status.label : value;
    };

    // 🔥 FIX: Reset + update preview when tab changes
    useEffect(() => {
        setSelectedAttachment(null);

        if (activeTab === "job") {
            if (attachments.length > 0) {
                setSelectedAttachment(attachments[0]);
            }
        } else {
            const container = containers.find(c => c.container_id === activeTab);
            if (container && container.files?.length > 0) {
                setSelectedAttachment(container.files[0]);
            }
        }
    }, [activeTab, attachments, containers]);

    // 🔥 FIX: CSV preview (prevent auto download)
    useEffect(() => {
        if (selectedAttachment?.file_name.match(/\.csv$/i)) {
            fetch(selectedAttachment.file_url)
                .then(res => res.text())
                .then(text => setCsvContent(text))
                .catch(() => setCsvContent("Failed to load CSV"));
        } else {
            setCsvContent("");
        }
    }, [selectedAttachment]);

    const handleUpload = () => {
        if (!file || !documentType) return;

        const formData = new FormData();
        formData.append("job_id", job.id);
        formData.append("file", file);
        formData.append("document_type", documentType);

        Inertia.post("/pod-upload", formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setFile(null);
                setDocumentType("Bill of Lading");
                if (fileRef.current) fileRef.current.value = "";
            }
        });
    };

    const handleContainerUpload = (containerId) => {
        if (!containerFile) return;

        const formData = new FormData();
        formData.append("container_id", containerId);
        formData.append("file", containerFile);

        Inertia.post("/pod-upload/container-upload", formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setContainerFile(null);
                if (containerFileRef.current) containerFileRef.current.value = "";
            }
        });
    };

    const openDeleteModal = (id, type) => {
        setDeleteId(id);
        setDeleteType(type);
        setModalOpen(true);
    };

    const handleDelete = () => {
        if (deleteType === "job") {
            Inertia.delete(`/pod-upload/job-delete/${deleteId}`, { preserveScroll: true });
        }
        if (deleteType === "container") {
            Inertia.delete(`/pod-upload/container-delete/${deleteId}`, { preserveScroll: true });
        }
        setSelectedAttachment(null);
        setModalOpen(false);
    };

    const columns = [
        { header: "Document Type", field: "document_type" },
        { header: "File Name", field: "file_name" },
        { header: "Uploaded By", field: "creator.name" },
        { header: "Date", render: row => formatDateDMY(row.created_at)},
    ];

    const containerColumns = [
        { header: "File Name", field: "file_name" },
        { header: "Uploaded By", field: "creator.name" },
        { header: "Date", render: row => formatDateDMY(row.created_at) },
    ];

    return (
        <div className="container mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b">
                <div className="text-sm">
                    <div className="font-semibold">
                        Shipment ID: {job.shipment_id} | Customer: {job.customer?.name}
                    </div>
                    <div className="font-semibold">
                        Master BL: {job.master_bl_number} | Status: {job.status_label}
                    </div>
                </div>

                <Link href={`/pod-upload`} className="px-3 py-2 bg-black text-white rounded">
                    ← Back to List
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 mt-4">
                <button
                    onClick={() => setActiveTab("job")}
                    className={`px-4 py-2 rounded-md ${activeTab === "job" ? "bg-gray-800 text-white" : "bg-gray-200"}`}
                >
                    Job
                </button>

                {containers.map((container, index) => (
                    <button
                        key={container.container_id}
                        onClick={() => setActiveTab(container.container_id)}
                        className={`px-4 py-2 rounded-md ${activeTab === container.container_id ? "bg-gray-800 text-white" : "bg-gray-200"}`}
                    >
                        Container {index + 1}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 m-6">

                {/* LEFT */}
                <div className="lg:col-span-4 space-y-6">

                    {activeTab === "job" && (
                        <>
                            <div className="bg-white border rounded-xl p-6">
                                <h2 className="font-semibold mb-4">Photo & POD Upload</h2>

                                <input
                                    type="file"
                                    ref={fileRef}
                                    onChange={e => setFile(e.target.files[0])}
                                />

                                <select
                                    className="border rounded w-full mt-4 px-3 py-2"
                                    value={documentType}
                                    onChange={e => setDocumentType(e.target.value)}
                                >
                                    <option value="Bill of Lading">Bill of Lading</option>
                                    <option value="Invoice">Invoice</option>
                                    <option value="Delivery Order">Delivery Order</option>
                                    <option value="Customs Form">Customs Form</option>
                                    <option value="Proof of Delivery">Proof of Delivery</option>
                                </select>

                                <div className="text-right mt-4">
                                    <Button onClick={handleUpload}>Upload Document</Button>
                                </div>
                            </div>

                            <div className="bg-white border rounded-xl p-6">
                                <Table
                                    columns={columns}
                                    tableData={{ data: attachments, last_page: 1 }}
                                    actions={(row) => (
                                        <div className="flex gap-3 text-sm">
                                            <button onClick={() => setSelectedAttachment(row)} className="text-blue-600 underline">
                                                View
                                            </button>
                                            <button onClick={() => openDeleteModal(row.id, "job")} className="text-red-600 underline">
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                />
                            </div>
                        </>
                    )}

                    {containers.map(container => (
                        activeTab === container.container_id && (
                            <div key={container.container_id} className="space-y-6">

                                <div className="bg-white border rounded-xl p-6">
                                    <h2 className="font-semibold mb-4">Container Information</h2>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div><b>No:</b><br />{container.container_no}</div>
                                        <div><b>Product:</b><br />{container.product_category}</div>
                                        <div><b>Type:</b><br />{getContainerTypeLabel(container.container_type)}</div>
                                        <div><b>Status:</b><br />{getContainerStatusLabel(container.status)}</div>
                                    </div>
                                </div>

                                <div className="bg-white border rounded-xl p-6">
                                    <input type="file" ref={containerFileRef} onChange={(e) => setContainerFile(e.target.files[0])} />
                                    <div className="text-right mt-4">
                                        <Button onClick={() => handleContainerUpload(container.container_id)}>Upload File</Button>
                                    </div>
                                </div>

                                <div className="bg-white border rounded-xl p-6">
                                    <Table
                                        columns={containerColumns}
                                        tableData={{ data: container.files || [], last_page: 1 }}
                                        actions={(row) => (
                                            <div className="flex gap-3 text-sm">
                                                <button onClick={() => setSelectedAttachment(row)} className="text-blue-600 underline">
                                                    View
                                                </button>
                                                <button onClick={() => openDeleteModal(row.id, "container")} className="text-red-600 underline">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    />
                                </div>

                            </div>
                        )
                    ))}

                </div>

                {/* RIGHT PREVIEW */}
                <div
                    key={selectedAttachment?.id || "empty"}
                    className="lg:col-span-2 bg-white border rounded-xl p-6"
                >
                    <h2 className="font-semibold mb-4">Preview</h2>

                    {!selectedAttachment ? (
                        <p className="text-gray-400 text-sm text-center">
                            Click "View" to preview
                        </p>
                    ) : (
                        <>
                            {selectedAttachment.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img src={selectedAttachment.file_url} className="w-full h-64 object-contain border rounded" />

                            ) : selectedAttachment.file_name.match(/\.pdf$/i) ? (
                                <iframe src={selectedAttachment.file_url} className="w-full h-72 border rounded" />

                            ) : selectedAttachment.file_name.match(/\.csv$/i) ? (
                                <pre className="w-full h-72 overflow-auto bg-gray-50 p-2 text-xs border rounded">
                                    {csvContent}
                                </pre>

                            ) : selectedAttachment.file_name.match(/\.txt$/i) ? (
                                <iframe src={selectedAttachment.file_url} className="w-full h-72 border rounded" />

                            ) : selectedAttachment.file_name.match(/\.(xls|xlsx)$/i) ? (
                                <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedAttachment.file_url)}`}
                                    className="w-full h-72 border rounded"
                                />

                            ) : (
                                <div className="text-center">
                                    <a href={selectedAttachment.file_url} target="_blank" className="text-blue-600 underline">
                                        Download File
                                    </a>
                                </div>
                            )}

                            <a
                                href={selectedAttachment.file_url}
                                target="_blank"
                                className="text-blue-600 underline text-sm block mt-2"
                            >
                                Open in new tab
                            </a>
                        </>
                    )}
                </div>

            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this file?"
                buttonText="Delete"
            />

        </div>
    );
};

export default PodUploadForm;
