import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/lang";

export default function NotificationPage({ notifications }) {
  const { auth } = usePage().props;
  const user = auth?.user;

  const { language } = useLanguage();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState("all");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notificationsState, setNotifications] = useState(notifications);

  // Filter notifications
  const filtered =
    activeTab === "all"
      ? notificationsState
      : activeTab === "unread"
      ? notificationsState.filter((n) => !n.read)
      : notificationsState.filter((n) => n.read);

  // Actions
  const markSingleAsRead = (id) => {
    Inertia.post(`/driver/notifications/read/${id}`);
    setNotifications(
      notificationsState.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    Inertia.post(`/driver/notifications/read-all`);
    setNotifications(notificationsState.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    Inertia.delete(`/driver/notifications/${id}`);
    setNotifications(notificationsState.filter((n) => n.id !== id));
  };

  const deleteAllNotifications = () => {
    Inertia.delete(`/driver/notifications`);
    setNotifications([]);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">

      {/* HEADER */}
      <div
        className="px-4 pt-6 pb-4 flex justify-between items-center bg-white shadow fixed top-0 left-0 right-0 z-10"
        style={{ height: 80 }}
      >
        <Link href="/driver/dashboard" className="text-gray-600 text-xl">
          <FaArrowLeft />
        </Link>

        <h1 className="text-lg font-semibold">
          {t.notifications}
        </h1>

        <button
          onClick={deleteAllNotifications}
          className="text-red-500 text-xl"
          title={t.deleteAll}
        >
          <FaTrash />
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-4 overflow-y-auto" style={{ paddingTop: 100 }}>

        {/* TABS */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "all", label: t.all },
            { key: "unread", label: t.unread },
            { key: "read", label: t.read },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markSingleAsRead(item.id)}
              className={`rounded-lg shadow p-4 flex items-start relative cursor-pointer ${
                item.read ? "bg-gray-200" : "bg-white"
              }`}
            >
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    item.read ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.time}
                </p>
              </div>

              {/* Delete Single */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(item.id);
                }}
                className="text-red-500 hover:text-red-700 p-1 absolute right-3 top-3"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="fixed left-4 right-4 bg-white shadow p-4 flex justify-between items-center z-10 rounded-lg"
        style={{ bottom: "70px" }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {t.pushNotifications}
          </span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={() => setPushEnabled(!pushEnabled)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-blue-600 text-sm font-medium"
        >
          {t.markAllRead}
        </button>
      </div>
    </div>
  );
}