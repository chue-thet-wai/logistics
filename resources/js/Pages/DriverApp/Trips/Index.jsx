import React from "react";
import { Link, usePage } from "@inertiajs/inertia-react";
import { FaArrowLeft, FaBell, FaCalendarAlt } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/lang";

export default function TripsPage() {
  const { auth, trips = [] } = usePage().props;
  const user = auth?.user;

  const { language } = useLanguage();
  const t = translations[language];

  const { url } = usePage();

  const params = new URLSearchParams(url.split("?")[1]);
  const activeTab = params.get("tab") || "new";

  const mapStatus = (status) => {
    if (status === 0) return "new";
    if (status >= 1 && status <= 8) return "ongoing";
    if (status >= 9) return "completed";
    return "new";
  };

  const transformedTrips = trips.map((trip) => ({
    id: trip.id,
    trip_no: trip.trip_id,
    from: trip.containers?.[0]?.origin ?? "N/A",
    to: trip.containers?.[0]?.destination ?? "N/A",
    created_at: trip.created_at
      ? new Date(trip.created_at).toLocaleString()
      : "N/A",
    raw_status: trip.status,
    status: mapStatus(trip.status),
  }));

  const filteredTrips = transformedTrips.filter(
    (trip) => trip.status === activeTab
  );

  const newTripCount = transformedTrips.filter(
    (trip) => trip.status === "new"
  ).length;

  const badgeColors = {
    new: "bg-green-100 text-green-600",
    ongoing: "bg-blue-100 text-blue-600",
    completed: "bg-gray-300 text-gray-700",
  };

  return (
    <div>
      {/* HEADER */}
      <div
        className="px-4 pt-6 pb-4 flex justify-between items-center bg-white shadow fixed top-0 left-0 right-0 z-10"
        style={{ height: 80 }}
      >
        <Link href="/driver/dashboard" className="text-gray-600 text-xl">
          <FaArrowLeft />
        </Link>

        <h1 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">
          {t.myTrips}
        </h1>

        <div className="relative">
          <FaBell className="text-gray-600 text-xl" />
          {newTripCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              {newTripCount}
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="flex-1 overflow-auto px-4 py-4 min-h-screen bg-gray-100"
        style={{ paddingTop: 90 }}
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "new", label: t.new },
            { key: "ongoing", label: t.ongoing },
            { key: "completed", label: t.completed },
          ].map((tab) => (
            <Link
              key={tab.key}
              href={`/driver/trips?tab=${tab.key}`}
              preserveState
              preserveScroll
              className={`px-4 py-2 rounded-full text-sm font-medium uppercase ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Trip List */}
        {filteredTrips.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            {t.noTrips}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border rounded-xl shadow p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold">
                    {trip.trip_no}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${badgeColors[trip.status]}`}
                  >
                    {t[trip.status].toUpperCase()}
                  </span>
                </div>

                <p className="font-semibold text-[15px]">
                  {trip.from} → {trip.to}
                </p>

                <div className="flex items-center text-sm mt-2 text-gray-600">
                  <FaCalendarAlt className="mr-2 text-gray-500" size={13} />
                  {t.created}: {trip.created_at}
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/driver/trips/${trip.trip_no}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {t.viewTrip}
                  </Link>
                  {trip.raw_status < 9 && (
                    <Link
                      href={`/driver/trips/${trip.trip_no}/update`}
                      className="border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm"
                    >
                      {t.updateStatus}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}