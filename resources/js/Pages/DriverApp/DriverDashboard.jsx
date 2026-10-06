import React, { useState, useRef, useEffect } from "react";
import { Link, usePage } from "@inertiajs/inertia-react";
import {
  FaBoxOpen,
  FaTruckMoving,
  FaCheck,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/lang";

export default function DriverDashboard({
  pageTitle,
  new: newTrips,
  active,
  done,
  trips = [],
  statuses = [],
}) {

  const { auth } = usePage().props;
  const user = auth?.user;

  const { language, changeLanguage } = useLanguage();
  const t = translations[language];

  const statusMap = statuses.reduce((map, s) => {
    map[s.value] = language === 'th' ? s.label_th : s.label;
    return map;
  }, {});

  const statusColor = {
    0: "bg-gray-200 text-gray-700",
    1: "bg-yellow-200 text-yellow-700",
    2: "bg-blue-200 text-blue-700",
    3: "bg-purple-200 text-purple-700",
    4: "bg-indigo-200 text-indigo-700",
    5: "bg-cyan-200 text-cyan-700",
    6: "bg-orange-200 text-orange-700",
    7: "bg-green-200 text-green-700",
    8: "bg-green-200 text-green-700",
    9: "bg-green-200 text-green-700",
  };

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="px-4 pt-6 pb-4 flex justify-between items-center bg-white shadow fixed top-0 left-0 right-0 z-10 h-20">
        
        <h1 className="text-lg font-semibold truncate w-full">
          {t.hi}, {user?.name}
        </h1>

        <div className="flex items-center gap-3">


          <div className="relative" ref={menuRef}>
            <img
              src={user?.avatar || "/assets/images/profile.jpg"}
              onClick={() => setOpenMenu(!openMenu)}
              className="w-10 h-10 rounded-full cursor-pointer"
              alt="profile"
            />

            {openMenu && (
              <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow border">
                
                <Link
                  href="/driver/settings"
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100"
                >
                  <FaCog /> {t.settings}
                </Link>

                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt /> {t.logout}
                </Link>

              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 pt-24">

        {/* Welcome Card */}
        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <h2 className="font-semibold truncate w-full">
            {t.welcome}, {user?.name}
          </h2>
          <p className="text-sm text-gray-500">
            {t.summaryText}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/driver/trips?tab=new"
            className="bg-blue-500 text-white p-3 rounded-xl text-center"
          >
            <FaBoxOpen className="mx-auto" />
            <p>{newTrips} {t.new}</p>
          </Link>

          <Link
            href="/driver/trips?tab=ongoing"
            className="bg-green-500 text-white p-3 rounded-xl text-center"
          >
            <FaTruckMoving className="mx-auto" />
            <p>{active} {t.active}</p>
          </Link>

          <Link
            href="/driver/trips?tab=completed"
            className="bg-gray-500 text-white p-3 rounded-xl text-center"
          >
            <FaCheck className="mx-auto" />
            <p>{done} {t.done}</p>
          </Link>
        </div>

        {/* Latest Trips */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">
            {t.latestTrips}
          </h3>

          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow p-4 mb-3">
              <h4 className="font-bold">
                {trip.trip_no ?? `${t.trip} # ${trip.trip_id}`}
              </h4>

              {trip.origin && trip.destination && (
                <p className="text-sm text-gray-600">
                  {trip.origin} → {trip.destination}
                </p>
              )}

              <div className="flex justify-between items-center mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColor[trip.status]
                  }`}
                >
                  {statusMap[trip.status]}
                </span>
                <FaTruckMoving className="text-blue-500" />
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/driver/trips"
          className="text-blue-600 text-sm font-medium mt-2 mb-6 block px-2 py-6"
        >
          {t.viewAllTrips} →
        </Link>

      </div>
    </div>
  );
}