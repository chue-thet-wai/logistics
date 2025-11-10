import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/inertia-react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../utils/lang";
import {
  FaShippingFast,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserTie,
} from "react-icons/fa";

const StatCard = ({ icon, label, value, color, subValue }) => (
  <div className="bg-white shadow-lg rounded-2xl px-5 py-4 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full bg-${color}-100 text-${color}-500`}
      >
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
    </div>
    <div className="mt-3 text-lg font-bold text-gray-800">
      {value}{" "}
      {subValue && (
        <span className="text-gray-400 font-semibold text-base ml-1">
          / {subValue}
        </span>
      )}
    </div>
  </div>
);

const Dashboard = ({ stats }) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/shipments/active">
          <StatCard
            icon={<FaShippingFast size={16} />}
            label="Active"
            value={stats.activeCount || 38}
            color="blue"
          />
        </Link>

        <Link href="/shipments/completed">
          <StatCard
            icon={<FaCheckCircle size={16} />}
            label="Completed"
            value={stats.completedCount || 38}
            color="green"
          />
        </Link>

        <Link href="/shipments/delay">
          <StatCard
            icon={<FaExclamationTriangle size={16} />}
            label="Delays"
            value={stats.delayCount || 6}
            color="orange"
          />
        </Link>

        <Link href="/drivers">
          <StatCard
            icon={<FaUserTie size={16} />}
            label="Drivers On"
            value={stats.driversOn || 14}
            subValue={stats.totalDrivers || 20}
            color="gray"
          />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
