import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/react";
import { Button, Select, Label, FormWrapper, ButtonIcon } from "../../components";
import { FaTrash } from "react-icons/fa";

export default function TrackForm({ track = null, drivers = [], trucks = [], container_types = [], pageTitle }) {

    const [formData, setFormData] = useState({
        driver_id: track?.driver_id || "",
        truck_id: track?.truck_id || "",
        bl_number: "",
        selectedContainers: track?.containers?.map(c => c.id) || [],
    });

    const [selectedContainerData, setSelectedContainerData] = useState(track?.containers || []);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
    });

    const [containers, setContainers] = useState([]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        handleSearch(1);

        if (track?.containers) {
            setSelectedContainerData(track.containers);
            setFormData(prev => ({
                ...prev,
                selectedContainers: track.containers.map(c => c.id)
            }));
        }
    }, [track]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.last_page) return;
        handleSearch(page);
    };

    const addContainer = (container) => {
        if (!formData.selectedContainers.includes(container.id)) {
            setFormData(prev => ({
                ...prev,
                selectedContainers: [...prev.selectedContainers, container.id]
            }));

            setSelectedContainerData(prev => [...prev, container]);
        }
    };

    const removeContainer = (id) => {
        setFormData(prev => ({
            ...prev,
            selectedContainers: prev.selectedContainers.filter(c => c !== id)
        }));

        setSelectedContainerData(prev =>
            prev.filter(c => c.id !== id)
        );
    };

    const handleSearch = async (page = 1) => {
        try {
            const res = await fetch(
                `/tracks/search-job?bl_number=${formData.bl_number || ""}&page=${page}`
            );

            const data = await res.json();

            setContainers(data.jobContainers?.data || []);

            setPagination({
                current_page: data.jobContainers.current_page,
                last_page: data.jobContainers.last_page,
            });

        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.selectedContainers.length === 0) {
            setErrors(prev => ({
                ...prev,
                selectedContainers: "Please select at least one container"
            }));
            return;
        }

        const payload = {
            driver_id: formData.driver_id,
            truck_id: formData.truck_id,
            containers: formData.selectedContainers,
        };

        setProcessing(true);

        if (track) {
            Inertia.put(`/tracks/${track.track_id}`, payload, {
                onError: setErrors,
                onFinish: () => setProcessing(false),
            });
        } else {
            Inertia.post("/tracks", payload, {
                onError: setErrors,
                onFinish: () => setProcessing(false),
            });
        }
    };

    const getContainerTypeLabel = (value) => {
        const type = container_types.find(t => Number(t.value) === Number(value));
        return type ? type.label : value;
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-14 px-6 py-2 border-b">
                <h1 className="text-lg font-semibold">{pageTitle}</h1>
            </div>

            <FormWrapper onSubmit={handleSubmit} className="m-4">

                {/* Driver + Truck */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <Label required>Driver</Label>
                        <Select
                            name="driver_id"
                            value={formData.driver_id}
                            onChange={handleChange}
                            options={drivers.map(d => ({ value: d.id, label: d.name }))}
                        />
                    </div>
                    <div>
                        <Label required>Truck</Label>
                        <Select
                            name="truck_id"
                            value={formData.truck_id}
                            onChange={handleChange}
                            options={trucks.map(t => ({ value: t.id, label: t.truck_number }))}
                        />
                    </div>
                </div>

                {/* Search */}
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        name="bl_number"
                        value={formData.bl_number}
                        onChange={handleChange}
                        placeholder="Enter BL Number"
                        className="border p-2 rounded w-full"
                    />
                    <Button type="button" onClick={() => handleSearch(1)}>Search</Button>
                </div>

                {/* Available Containers */}
                <div className="border rounded p-4 mb-6">
                    <h3 className="font-semibold mb-3">
                        Available Containers ({containers.length})
                    </h3>

                    <table className="min-w-full border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2">✔</th>
                                <th className="border px-3 py-2">Shipment ID</th>
                                <th className="border px-3 py-2">Master BL</th>
                                <th className="border px-3 py-2">House BL</th>
                                <th className="border px-3 py-2">Container No</th>
                                <th className="border px-3 py-2">Container Type</th>
                                <th className="border px-3 py-2">Product Category</th>
                                <th className="border px-3 py-2">Deliver Drop Point</th>
                                <th className="border px-3 py-2">Pickup Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {containers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        No available containers
                                    </td>
                                </tr>
                            ) : (
                                containers.map(container => (
                                    <tr key={container.id}>
                                        <td className="border px-3 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.selectedContainers.includes(container.id)}
                                                onChange={(e) =>
                                                    e.target.checked
                                                        ? addContainer(container)
                                                        : removeContainer(container.id)
                                                }
                                            />
                                        </td>
                                        <td className="border px-3 py-2">{container.shipment_id}</td>
                                        <td className="border px-3 py-2">
                                            {container.job?.master_bl_number}
                                        </td>
                                        <td className="border px-3 py-2">
                                            {container.job?.house_bl_number}
                                        </td>
                                        <td className="border px-3 py-2">{container.container_no}</td>
                                        <td className="border px-3 py-2">
                                            {getContainerTypeLabel(container.container_type)}
                                        </td>
                                        <td className="border px-3 py-2">
                                            {container.product_category}
                                        </td>
                                        <td className="border px-3 py-2">
                                            {container.destination}
                                        </td>
                                        <td className="border px-3 py-2">
                                            {container.pickup_date}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100">

                        <button
                            type="button"
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="px-2 py-1 text-gray-500 disabled:text-gray-300 hover:text-black"
                        >
                            &lt;
                        </button>

                        {[...Array(pagination.last_page)].map((_, i) => (
                            <button
                                type="button"
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    pagination.current_page === i + 1
                                        ? "bg-gray-200 text-gray-900"
                                        : "text-gray-500 hover:bg-gray-100"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="px-2 py-1 text-gray-500 disabled:text-gray-300 hover:text-black"
                        >
                            &gt;
                        </button>

                    </div>
                </div>

                {/* Selected Containers (UNCHANGED DESIGN) */}
                {selectedContainerData.length > 0 && (
                    <div className="border rounded p-4 mb-6 bg-gray-50">
                        <h3 className="font-semibold mb-3">
                            Selected Containers ({selectedContainerData.length})
                        </h3>

                        <table className="min-w-full border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-3 py-2">Shipment ID</th>
                                    <th className="border px-3 py-2">Master BL</th>
                                    <th className="border px-3 py-2">House BL</th>
                                    <th className="border px-3 py-2">Container No</th>
                                    <th className="border px-3 py-2">Container Type</th>
                                    <th className="border px-3 py-2">Product Category</th>
                                    <th className="border px-3 py-2">Deliver Drop Point</th>
                                    <th className="border px-3 py-2">Pickup Date</th>
                                    <th className="border px-3 py-2 text-center">Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedContainerData.map(container => (
                                    <tr key={container.id}>
                                        <td className="border px-3 py-2">{container.shipment_id}</td>
                                        <td className="border px-3 py-2">
                                            {container.job?.master_bl_number}
                                        </td>
                                        <td className="border px-3 py-2">
                                            {container.job?.house_bl_number}
                                        </td>
                                        <td className="border px-3 py-2">{container.container_no}</td>
                                        <td className="border px-3 py-2">
                                            {getContainerTypeLabel(container.container_type)}
                                        </td>
                                        <td className="border px-3 py-2">{container.product_category}</td>
                                        <td className="border px-3 py-2">
                                            {container.destination}
                                        </td>
                                        <td className="border px-3 py-2">
                                            {container.pickup_date}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            <ButtonIcon
                                                onClick={() => removeContainer(container.id)}
                                                icon={<FaTrash />}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <Link href="/tracks">
                        <Button type="button" variant="secondary">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Processing..." : track ? "Update Track" : "Save Track"}
                    </Button>
                </div>

            </FormWrapper>
        </div>
    );
}