import React, { useState, useEffect, useRef } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Button, Input, Label, Link,Textarea } from "../../components";
import { calculateContainerCharges } from "@/utils/containerCalculation";

const ContainerInfo = ({
    job,
    containers = [],
    container_types = [],
    uoms = [],
    routes = [],
    fz_options = [],
    pageTitle
}) => {
    const totalContainers =
        containers.length > 0 ? containers.length : job.total_container || 0;
    
    const fileInputRefs = useRef([]);
    
    const createEmptyContainer = () => ({
        container_id: "",
        container_no: "",
        container_type: container_types[0]?.value || "",
        arrival_date: "",
        product_category: "",
        quantity: 0,
        uom: uoms[0]?.value || "",
        weight: 0,
        cbm: 0,
        route_id: "",
        origin: "",
        destination: "",
        fz: 0,
        billing_customer: "",
        status: 0,

        pickup_date: "",
        pickup_address: "",
        pickup_contact_person: "",
        pickup_contact_phone: "",

        delivery_address: "",
        delivery_contact_person: "",
        delivery_contact_phone: "",

        detention_free_day: job.lead?.detention_free_day || 0,
        detention_last_date: "",
        detention_used_day: "",
        detention_extra_day: "",
        detention_rate: "",
        detention_total: "",
        detention_remark: "",
        left_port_date: "",
        container_return_date: "",

        demurrage_free_day: job.lead?.demurrage_free_day || 0,
        demurrage_last_date: "",
        demurrage_used_day: "",
        demurrage_extra_day: "",
        demurrage_rate: "",
        demurrage_total: "",
        demurrage_remark: "",

        existing_files: [],
        deleted_files: [],
        files: []
    });

    const [currentTab, setCurrentTab] = useState(0);

    const [containerData, setContainerData] = useState(
        containers.length > 0
            ? containers.map(container => ({
                ...container,
                container_id: container.container_id,
                existing_files: container.files || [],
                deleted_files: [],
                files: []
            }))
            : Array.from({ length: totalContainers }, () => createEmptyContainer())
    );

    const handleFileChange = (index, files) => {
        const updated = [...containerData];

        const newFiles = Array.from(files);

        updated[index].files = [
            ...(updated[index].files || []),
            ...newFiles
        ];

        setContainerData(updated);
    };

    useEffect(() => {
        const calculated = containerData.map(item =>
            calculateContainerCharges({ ...item })
        );

        setContainerData(calculated);
    }, []);

    const handleChange = (index, field, value) => {

        const updated = [...containerData];

        updated[index] = {
            ...updated[index],
            [field]: value
        };

        if (field === "route_id") {
            const selectedRoute = routes.find(r => r.id === Number(value));

            updated[index] = {
                ...updated[index],
                origin: selectedRoute?.origin || "",
                destination: selectedRoute?.destination || ""
            };
        }

        updated[index] = calculateContainerCharges({ ...updated[index] });

        setContainerData(updated);
    };

    const handleRemoveSelectedFile = (index, fileIndex) => {
        const updated = [...containerData];

        updated[index].files = updated[index].files.filter(
            (_, i) => i !== fileIndex
        );

        setContainerData(updated);

        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index].value = "";
        }
    };

    const handleDeleteExistingFile = (fileId) => {
        setContainerData(prev => {
            const updated = [...prev];

            updated[currentTab].deleted_files.push(fileId);

            updated[currentTab].existing_files =
                updated[currentTab].existing_files.filter(
                    file => file.id !== fileId
                );

            return updated;
        });
    };


    const handleNext = () => {
        if (currentTab < totalContainers - 1) {
            setCurrentTab(currentTab + 1);
        }
    };

    const handlePrevious = () => {
        if (currentTab > 0) {
            setCurrentTab(currentTab - 1);
        }
    };

    const handleSubmit = () => {

        const formData = new FormData();

        containerData.forEach((container, index) => {

            Object.keys(container).forEach(key => {
                if (
                    key !== "files" &&
                    key !== "existing_files" &&
                    key !== "deleted_files"
                ) {
                    formData.append(
                        `containers[${index}][${key}]`,
                        container[key] ?? ""
                    );
                }
            });

            // Deleted files
            container.deleted_files?.forEach((fileId, fileIndex) => {
                formData.append(
                    `containers[${index}][deleted_files][${fileIndex}]`,
                    fileId
                );
            });

            // New files
            container.files?.forEach((file, fileIndex) => {
                formData.append(
                    `containers[${index}][files][${fileIndex}]`,
                    file
                );
            });
        });

        Inertia.post(`/jobs/${job.shipment_id}/containers`, formData, {
            forceFormData: true,
        });
    };



    if (totalContainers === 0) {
        return <div className="p-6">No containers found.</div>;
    }

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === "") return "";
        return Number(value).toLocaleString("en-US");
    };

    const handleFormattedNumberChange = (index, field, value) => {
        const numericValue = value.replace(/,/g, "");

        if (!/^\d*$/.test(numericValue)) return;

        const updated = [...containerData];

        updated[index] = {
            ...updated[index],
            [field]: numericValue
        };

        setContainerData(updated);
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                    {pageTitle}
                </h1>
                <Link href={`/jobs/${job.shipment_id}/edit`}>Shipment Details</Link>
            </div>

            <div className="m-6 space-y-1">
                <div>
                    <strong>Master BL Number:</strong>{" "}
                    {job?.master_bl_number || "-"}
                </div>
                <div>
                    <strong>House BL Number  :</strong>{" "}
                    {job?.house_bl_number || "-"}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 m-6 flex-wrap">
                {containerData.map((_, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 rounded 
                            ${index === currentTab
                                ? "bg-sidebar-color text-white"
                                : "bg-gray-200"}`}
                        onClick={() => setCurrentTab(index)}
                    >
                        Container {index + 1}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded shadow" key={currentTab}>
                {/* BASIC INFO */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label required>Container No</Label>
                        <Input
                            value={containerData[currentTab].container_no || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "container_no", e.target.value)
                            }
                        />
                        <Input
                            type="hidden"
                            value={containerData[currentTab].container_id || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "container_id", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label>Container Type</Label>
                        <select
                            className="border px-3 py-2 rounded w-full"
                            value={containerData[currentTab].container_type || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "container_type", Number(e.target.value))
                            }
                        >
                            {container_types.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>ATA (Actual time of arrival) </Label>
                        <Input 
                            type="date" 
                            value={containerData[currentTab].arrival_date || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "arrival_date", e.target.value)
                            } />
                    </div>
                    <div>
                        <Label>Product Category</Label>
                        <Input
                            value={containerData[currentTab].product_category || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "product_category", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>UOM</Label>
                        <select
                            className="border px-3 py-2 rounded w-full"
                            value={containerData[currentTab].uom || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "uom", Number(e.target.value))
                            }
                        >
                            {uoms.map((uom) => (
                                <option key={uom.value} value={uom.value}>
                                    {uom.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>Quantity</Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(containerData[currentTab].quantity) || ""}
                            onChange={(e) =>
                                handleFormattedNumberChange(currentTab, "quantity", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Weight (Kg)</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].weight ?? ""}
                            onChange={(e) =>
                                handleChange(currentTab, "weight", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label>CBM</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].cbm ?? ""}
                            onChange={(e) =>
                                handleChange(currentTab, "cbm", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Route</Label>
                        <select
                            className="border px-3 py-2 rounded w-full"
                            value={containerData[currentTab].route_id || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "route_id", Number(e.target.value))
                            }
                        >
                            <option value="">Select Route</option>
                            {routes.map((route) => (
                                <option key={route.id} value={route.id}>
                                    {route.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>Pickup Point</Label>
                        <Input
                            value={containerData[currentTab].origin || ""}
                            disabled
                        />
                    </div>

                    <div>
                        <Label>Deliver Drop Point</Label>
                        <Input
                            value={containerData[currentTab].destination || ""}
                            disabled
                        />
                    </div>

                    <div>
                        <Label>FZ (W/H)</Label>
                        <select
                            className="border px-3 py-2 rounded w-full"
                            value={containerData[currentTab].fz ?? 0}
                            onChange={(e) =>
                                handleChange(currentTab, "fz", Number(e.target.value))
                            }
                            disabled={String(job?.type) !== "2"}
                        >
                            <option value={0}>Select</option>
                            {fz_options.map((fz) => (
                                <option key={fz.value} value={fz.value}>
                                    {fz.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>Billing Customer</Label>
                        <Input
                            value={containerData[currentTab].billing_customer || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "billing_customer", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Pickup Date</Label>
                        <Input
                            type="date"
                            value={containerData[currentTab].pickup_date || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "pickup_date", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Pickup Contact Person</Label>
                        <Input
                            value={containerData[currentTab].pickup_contact_person || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "pickup_contact_person", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Pickup Contact Phone</Label>
                        <Input
                            value={containerData[currentTab].pickup_contact_phone || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "pickup_contact_phone", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Delivery Contact Person</Label>
                        <Input
                            value={containerData[currentTab].delivery_contact_person || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "delivery_contact_person", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Delivery Contact Phone</Label>
                        <Input
                            value={containerData[currentTab].delivery_contact_phone || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "delivery_contact_phone", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label>Pickup Address Detail</Label>
                        <Textarea
                            value={containerData[currentTab].pickup_address || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "pickup_address", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label>Delivery Address Detail</Label>
                        <Textarea
                            value={containerData[currentTab].delivery_address || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "delivery_address", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label>Remark</Label>
                        <Textarea
                            value={containerData[currentTab].remark || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "remark", e.target.value)
                            }
                        />
                    </div>

                </div>


                 {/* DEMURRAGE */}
                <hr className="my-6" />
                <h2 className="font-semibold text-lg mb-4">Demurrage</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>Free Days</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].demurrage_free_day || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "demurrage_free_day", Number(e.target.value))
                            }
                        />
                    </div>
                    <div>
                        <Label>Last Date</Label>
                        <Input
                            type="date"
                            value={containerData[currentTab].demurrage_last_date || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "demurrage_last_date", e.target.value)
                            }
                            disabled
                        />
                    </div>
                    <div>
                        <Label>Used Days</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].demurrage_used_day || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "demurrage_used_day", Number(e.target.value))
                            }
                            disabled
                        />
                    </div>
                    <div>
                        <Label>Extra Days</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].demurrage_extra_day || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "demurrage_extra_day", Number(e.target.value))
                            }
                            disabled
                        />
                    </div>
                    <div>
                        <Label>Total</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].demurrage_total || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "demurrage_total", Number(e.target.value))
                            }
                            disabled
                        />
                    </div>
                    <div></div>
                    <div>
                        <Label>Rate</Label>
                        <Textarea
                            type="text"
                           // inputMode="numeric"
                            value={containerData[currentTab].demurrage_rate || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "demurrage_rate", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label>Remark</Label>
                        <Textarea
                            value={containerData[currentTab].demurrage_remark || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "demurrage_remark", e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* DETENTION */}
                <hr className="my-6" />
                <h2 className="font-semibold text-lg mb-4">Detention</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>Free Days</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].detention_free_day || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "detention_free_day", Number(e.target.value))
                            }
                        />
                    </div>
                    <div>
                        <Label>Last Date</Label>
                        <Input
                            type="date"
                            value={containerData[currentTab].detention_last_date || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "detention_last_date", e.target.value)
                            }
                            disabled
                        />
                    </div>
                    <div>
                        <Label>Used Days</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].detention_used_day || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "detention_used_day", Number(e.target.value))
                            }
                            disabled
                        />
                    </div>
                    <div>
                        <Label>Extra Days</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].detention_extra_day || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "detention_extra_day", Number(e.target.value))
                            }
                            disabled
                        />
                    </div>
                    <div>
                        <Label>Total</Label>
                        <Input
                            type="number"
                            value={containerData[currentTab].detention_total || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "detention_total", Number(e.target.value))
                            }
                            disabled
                        />
                    </div>
                    <div></div>
                    <div>
                        <Label>Rate</Label>
                        <Textarea
                            type="text"
                            //inputMode="numeric"
                            value={containerData[currentTab].detention_rate || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "detention_rate", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label>Remark</Label>
                        <Textarea
                            value={containerData[currentTab].detention_remark || ""}
                            onChange={(e) =>
                                handleChange(currentTab, "detention_remark", e.target.value)
                            }
                        />
                    </div>
                </div>


                {/* FILE UPLOAD */}
                <div>
                    <hr className="my-6" />
                    <h2 className="font-semibold text-lg mb-4">Upload Files</h2>

                    <div>
                        <input
                            key={currentTab} 
                            ref={(el) => (fileInputRefs.current[currentTab] = el)}
                            type="file"
                            multiple
                            onChange={(e) =>
                                handleFileChange(currentTab, e.target.files)
                            }
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    {/* Show Selected Files */}
                    {containerData[currentTab].files?.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600">
                            {containerData[currentTab].files.map((file, i) => (
                                <div key={i} className="flex justify-between items-center border-b py-1">
                                    <span>{file.name}</span>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSelectedFile(currentTab, i)}
                                        className="text-red-600 text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Existing Files */}
                    {containerData[currentTab].existing_files?.length > 0 && (
                        <div className="mt-3 mb-3 text-sm">
                            <div className="font-semibold mb-2">Uploaded Files:</div>

                            {containerData[currentTab].existing_files.map(file => (
                                <div key={file.id} className="flex justify-between border-b py-1">
                                    <a
                                        href={file.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline"
                                    >
                                        {file.file_name}
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteExistingFile(file.id)}
                                        className="text-red-600 text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* NAVIGATION */}
                <div className="flex justify-between mt-6">
                    <Button disabled={currentTab === 0} onClick={handlePrevious}>
                        Previous
                    </Button>

                    {currentTab < totalContainers - 1 ? (
                        <Button onClick={handleNext}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit}>
                            Save All Containers
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContainerInfo;