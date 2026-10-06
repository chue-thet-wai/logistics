import React from "react";
import { Link, usePage } from "@inertiajs/inertia-react";
import { FaArrowLeft, FaBell, FaCalendarAlt } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/lang";

export default function TracksPage() {
  const { auth, tracks = [] } = usePage().props;
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

  const transformedTracks = tracks.map((track) => ({
    id: track.id,
    track_no: track.track_id,
    from: track.containers?.[0]?.origin ?? "N/A",
    to: track.containers?.[0]?.destination ?? "N/A",
    created_at: track.created_at
      ? new Date(track.created_at).toLocaleString()
      : "N/A",
    status: mapStatus(track.status),
  }));

  const filteredTracks = transformedTracks.filter(
    (track) => track.status === activeTab
  );

  const newTrackCount = transformedTracks.filter(
    (track) => track.status === "new"
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
          {t.myTracks}
        </h1>

        <div className="relative">
          <FaBell className="text-gray-600 text-xl" />
          {newTrackCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              {newTrackCount}
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
              href={`/driver/tracks?tab=${tab.key}`}
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

        {/* Track List */}
        {filteredTracks.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            {t.noTracks}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className="bg-white border rounded-xl shadow p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold">
                    {track.track_no}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${badgeColors[track.status]}`}
                  >
                    {t[track.status].toUpperCase()}
                  </span>
                </div>

                <p className="font-semibold text-[15px]">
                  {track.from} → {track.to}
                </p>

                <div className="flex items-center text-sm mt-2 text-gray-600">
                  <FaCalendarAlt className="mr-2 text-gray-500" size={13} />
                  {t.created}: {track.created_at}
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/driver/tracks/${track.track_no}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {t.viewTrack}
                  </Link>

                  <Link
                    href={`/driver/tracks/${track.track_no}/update`}
                    className="border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm"
                  >
                    {t.updateStatus}
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