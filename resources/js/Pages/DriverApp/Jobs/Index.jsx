import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/inertia-react";
import { FaArrowLeft, FaBell, FaCalendarAlt } from "react-icons/fa";

export default function JobsPage() {
  const { auth, jobs = [] } = usePage().props;
  const user = auth?.user;

  const [activeTab, setActiveTab] = useState("new");

  const mapStatus = (status) => {
    if (status === 2) {
      return "new";
    } else if (status >= 3 && status <= 6) {
      return "ongoing";
    } else if (status === 7) {
      return "completed";
    } else {
      return "new";
    }
  };


  const transformedJobs = jobs.map((job) => ({
    id: job.id,
    job_no: job.booking_id,
    from: job.origin ?? "N/A",
    to: job.destination ?? "N/A",
    pickup: job.eta
      ? new Date(job.eta).toLocaleString()
      : "N/A",
    delivery: null, // add when available
    status: mapStatus(job.status),
  }));

  // Filter jobs by active tab
  const filteredJobs = transformedJobs.filter(
    (job) => job.status === activeTab
  );

  // Count new jobs
  const newJobCount = transformedJobs.filter(
    (job) => job.status === "new"
  ).length;

  const badgeColors = {
    new: "bg-green-100 text-green-600",
    ongoing: "bg-blue-100 text-blue-600",
    completed: "bg-gray-300 text-gray-700",
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div
        className="px-4 pt-6 pb-4 flex justify-between items-center bg-white shadow fixed top-0 left-0 right-0 z-10"
        style={{ height: 80 }}
      >
        {/* Back Icon */}
        <Link href="/driver/dashboard" className="text-gray-600 text-xl">
          <FaArrowLeft />
        </Link>

        {/* Title */}
        <h1 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">
          My Jobs
        </h1>

        {/* Notification */}
        <div className="relative">
          <FaBell className="text-gray-600 text-xl" />
          {newJobCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              {newJobCount}
            </span>
          )}
        </div>
      </div>

      {/* ================= PAGE CONTENT ================= */}
      <div
        className="flex-1 overflow-auto px-4 py-4 min-h-screen bg-gray-100"
        style={{ paddingTop: 90 }}
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["new", "ongoing", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium uppercase ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Job List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No jobs found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border rounded-xl shadow p-4 relative"
              >
                {/* Job number + status */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold">
                    {job.job_no}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${badgeColors[job.status]}`}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </div>

                {/* Route */}
                <p className="font-semibold text-[15px]">
                  {job.from} → {job.to}
                </p>

                {/* Pickup */}
                <div className="flex items-center text-sm mt-2 text-gray-600">
                  <FaCalendarAlt className="mr-2 text-gray-500" size={13} />
                  Pickup: {job.pickup}
                </div>

                {/* Delivery */}
                {job.delivery && (
                  <div className="flex items-center text-sm mt-1 text-gray-600">
                    <FaCalendarAlt className="mr-2 text-gray-500" size={13} />
                    Delivery: {job.delivery}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/driver/jobs/${job.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    View Job
                  </Link>

                  <Link
                    href={`/driver/jobs/${job.id}/update`}
                    className="border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm"
                  >
                    Update Status
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
