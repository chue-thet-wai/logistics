import { useState } from "react";
import { FaArrowLeft, FaEdit, FaChevronRight } from "react-icons/fa";
import { Link } from "@inertiajs/inertia-react";

export default function DriverSettings({ driver }) {
  const [language, setLanguage] = useState("English");
  const [notifications, setNotifications] = useState(true);

  const initials = driver?.name
    ? driver.name.split(" ").map(w => w[0]).join("")
    : "DR";

  return (
    <div className="min-h-screen bg-gray-100 pb-24">

      {/* HEADER */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between bg-white shadow fixed top-0 left-0 right-0 z-10">
        <Link href="/driver/dashboard" className="text-xl">
          <FaArrowLeft />
        </Link>

        <h1 className="text-lg font-semibold">Settings</h1>

        <Link href="/driver/settings/edit">
          <FaEdit size={18} />
        </Link>
      </div>

      <div className="p-4 pt-24">

        {/* PROFILE */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {initials}
          </div>

          <h2 className="mt-3 font-semibold">{driver?.name}</h2>
          <p className="text-gray-500">Truck: {driver?.truck_number}</p>
          <p className="text-gray-500">📞 {driver?.phone}</p>
        </div>

        {/* SETTINGS */}
        <div className="bg-white mt-4 rounded-xl shadow divide-y">

          {/* LANGUAGE */}
          <div className="flex items-center justify-between px-4 py-4">
            <span className="font-medium">Language</span>
            <div className="flex items-center gap-2 text-gray-500">
              <span>{language}</span>
              <FaChevronRight size={14} />
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className="flex items-center justify-between px-4 py-4">
            <span className="font-medium">Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5 shadow" />
            </label>
          </div>

          {/* VERSION */}
          <div className="flex items-center justify-between px-4 py-4">
            <span className="font-medium">App Version</span>
            <span className="text-gray-500">v2.0</span>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="mt-6">
          <Link
            href="/logout"
            method="post"
            as="button"
            className="w-full py-3 text-red-600 border border-red-600 rounded-xl"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
