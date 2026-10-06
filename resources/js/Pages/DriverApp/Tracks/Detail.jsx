import React from "react";
import { Link } from "@inertiajs/inertia-react";
import { FaArrowLeft, FaTruck, FaBox, FaCheck, FaEdit } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/lang";

export default function TrackDetail({ track, statuses, container_types }) {

  const { language } = useLanguage();
  const t = translations[language];

  const getContainerType = (value) => {
    return (
      container_types?.find(
        (t2) => String(t2.value) === String(value)
      )?.label || t.na
    );
  };

  return (
    <div className="pb-32 bg-gray-100 min-h-screen">

      {/* Hide Scrollbar */}
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      {/* HEADER */}
      <div
        className="px-4 pt-6 pb-4 flex justify-between items-center bg-white shadow fixed top-0 left-0 right-0 z-10"
        style={{ height: 80 }}
      >
        <Link href="/driver/tracks" className="text-gray-600 text-xl">
          <FaArrowLeft />
        </Link>

        <h1 className="text-lg font-semibold">
          {t.trackDetail}
        </h1>

        <div className="w-10 h-10"></div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pt-24">

        {/* TRACK SUMMARY */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <p className="font-bold text-[15px]">
            {t.trackId}: {track.track_id}
          </p>

          <p className="text-gray-600 text-sm mt-1">
            {t.truck}: {track.truck?.truck_number ?? t.na}
          </p>

          <p className="text-gray-600 text-sm mt-1 truncate w-full">
            {t.driver}: {track.driver?.user?.name ?? t.na}
          </p>

          <p className="text-gray-600 text-sm mt-1">
            {t.createdAt}: {new Date(track.created_at).toLocaleString()}
          </p>
        </div>

        {/* STATUS PROGRESS */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center min-w-max relative">

            {statuses.map((status, index) => {
              const isCompleted =
                Number(track.status) >= Number(status.value);

              return (
                <div
                  key={status.value}
                  className="flex flex-col items-center relative px-4"
                >

                  {/* LINE */}
                  {index !== 0 && (
                    <div
                      className={`absolute top-4 left-0 -translate-x-1/2 w-full h-1 
                      ${Number(track.status) >= Number(status.value)
                          ? "bg-green-500"
                          : "bg-gray-300"
                        }`}
                      style={{ width: "100%" }}
                    />
                  )}

                  {/* CIRCLE */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10
                      ${isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                      }`}
                  >
                    {isCompleted ? <FaCheck size={10} /> : index + 1}
                  </div>

                  {/* LABEL */}
                  <p className="text-[11px] text-center mt-2 text-gray-600 whitespace-nowrap">
                    {language === 'th' ? status.label_th : status.label}
                  </p>
                </div>
              );
            })}

          </div>
        </div>

        {/* CONTAINER LIST */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold mb-3 flex items-center gap-2">
            <FaBox /> {t.containers}
          </p>

          {track.containers?.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {t.noContainers}
            </p>
          ) : (
            <div className="space-y-3">
              {track.containers.map((container) => (
                <Link
                  key={container.id}
                  href={`/driver/tracks/${track.track_id}/containers/${container.container_id}`}
                  className="block border rounded-lg p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {container.container_no}
                      </p>

                      <p className="text-sm text-gray-500">
                        {t.type}: {getContainerType(container.container_type)}
                      </p>
                    </div>

                    <FaTruck className="text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* UPDATE BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ bottom: '70px' }}>
        <Link
          href={`/driver/tracks/${track.track_id}/update`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white bg-green-600"
        >
          <FaEdit />
          {t.updateStatus}
        </Link>
      </div>

    </div>
  );
}