import React from "react";
import { Link } from "@inertiajs/inertia-react";
import { FaArrowLeft, FaPhone, FaMapMarkedAlt } from "react-icons/fa";

export default function JobDetail({ job, job_statuses }) {
  const customer = job.customer;

  // Starting status value (e.g., 3 = "Arrived Port")
  const startStatusValue = 3;

  // Filter statuses to show starting from a specific value
  const filteredStatuses = job_statuses.filter(
    (status) => status.value >= startStatusValue
  );

  return (
    <div className="pb-24 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div
        className="px-4 pt-6 pb-4 flex justify-between items-center bg-white shadow fixed top-0 left-0 right-0 z-10"
        style={{ height: 80 }}
      >
        <Link href="/driver/jobs" className="text-gray-600 text-xl">
          <FaArrowLeft />
        </Link>

        <h1 className="text-lg font-semibold">Job Detail</h1>

        <div className="w-10 h-10"></div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pt-24">

        {/* JOB SUMMARY */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <p className="font-bold text-[15px]">
            Shipment ID: {job.booking_id}
          </p>

          <p className="text-gray-600 text-sm mt-1">
            Customer: {customer?.name ?? "N/A"}
          </p>

          <p className="text-gray-600 text-sm mt-1">
            Cargo Type: {job.containers} Containers
          </p>

          <p className="text-gray-600 text-sm mt-1">
            Pickup: {job.origin}
          </p>

          <p className="text-gray-600 text-sm">
            Delivery: {job.destination}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mb-4">
          <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2">
            <FaMapMarkedAlt /> View Route Map
          </button>

          {customer?.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <FaPhone /> Contact Customer
            </a>
          )}
        </div>

        {/* STATUS TIMELINE */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold mb-4">Status</p>

          <div className="relative flex items-center justify-between">
            {filteredStatuses.map((status, i, arr) => {
              const numericStatus = Number(job.status); // ensure numeric comparison
              let color = "bg-gray-300"; // future

              if (status.value < numericStatus) color = "bg-green-600"; // completed
              else if (status.value === numericStatus) color = "bg-blue-600"; // current

              return (
                <div key={status.value} className="flex-1 flex flex-col items-center relative">
                  {/* Status circle */}
                  <div className={`w-5 h-5 rounded-full mb-1 ${color}`}></div>
                  <p className="text-xs text-center">{status.label}</p>

                  {/* Connecting line */}
                  {i !== arr.length - 1 && (
                    <div
                      className={`absolute top-2.5 left-1/2 w-full h-1 -translate-x-1/2 ${
                        filteredStatuses[i + 1].value <= numericStatus
                          ? "bg-green-600"
                          : "bg-gray-300"
                      }`}
                      style={{ zIndex: -1 }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DOCUMENTS */}
        {job.attachments?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <p className="font-semibold mb-2">Documents</p>
            <div className="grid grid-cols-2 gap-3">
              {job.attachments.map((file) => (
                <img
                  key={file.id}
                  src={file.file_url}
                  className="rounded-lg w-full h-32 object-cover"
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
