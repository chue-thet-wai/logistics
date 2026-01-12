import React, { useState } from "react";
import { Link } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import { FaArrowLeft } from "react-icons/fa";

export default function UpdateStatus({ job, statuses , latestLog }) {
  const [stage, setStage] = useState(job.status);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    notes: "",
    latitude: "",
    longitude: "",
    photo: null,

    fuel: {
      station: "",
      liter: "",
      amount: "",
      note: "",
      receipt: null,
    },

    toll: {
      gate: "",
      amount: "",
      note: "",
      receipt: null,
    },
  });

  // ================= CURRENT + NEXT STATUS =================
  const currentStatus = statuses.find((s) => s.value === job.status);
  const nextStatuses = statuses.filter((s) => s.value >= job.status);

  // ================= SUBMIT =================
  const submit = () => {
    setLoading(true);

    Inertia.post(
      `/driver/jobs/${job.id}/update`,
      {
        status: stage,
        notes: form.notes,
        latitude: form.latitude,
        longitude: form.longitude,
        photo: form.photo,

        fuel: form.fuel,
        toll: form.toll,
      },
      {
        forceFormData: true,
        onFinish: () => setLoading(false),
      }
    );
  };

  return (
    <div className="pb-24 min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}
      <div className="px-4 pt-6 pb-4 flex items-center bg-white shadow fixed top-0 left-0 right-0 z-10">
        <Link href={`/driver/jobs/${job.id}`} className="text-xl text-gray-600">
          <FaArrowLeft />
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold">
          Update Status
        </h1>
      </div>

      <div className="px-4 pt-24 space-y-4">
        {/* ================= JOB INFO ================= */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold">Shipment: {job.booking_id}</p>
          <p className="text-sm text-gray-600">
            Customer: {job.customer?.name}
          </p>
          <p className="text-sm mt-1">
            Current Stage:{" "}
            <span className="font-semibold">{currentStatus?.label}</span>
          </p>
        </div>

        {/* ================= STATUS ================= */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold mb-2">Select Next Stage</p>

          <select
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
            className="w-full border rounded-lg p-3"
          >
            {nextStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* ================= NOTES ================= */}
          <textarea
            placeholder="Job Notes..."
            className="w-full mt-3 border rounded-lg p-3 text-sm"
            rows="3"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {/* ================= LOCATION ================= */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Location</h3>
            <input
              placeholder="Latitude"
              className="w-full border rounded p-2 mb-2"
              value={form.latitude}
              onChange={(e) =>
                setForm({ ...form, latitude: e.target.value })
              }
            />
            <input
              placeholder="Longitude"
              className="w-full border rounded p-2"
              value={form.longitude}
              onChange={(e) =>
                setForm({ ...form, longitude: e.target.value })
              }
            />
          </div>

          {/* ================= PHOTO ================= */}
          <input
            type="file"
            accept="image/*"
            className="mt-4"
            onChange={(e) =>
              setForm({ ...form, photo: e.target.files[0] })
            }
          />
        </div>

        {/* ================= FUEL EXPENSE ================= */}
        {stage === 4 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">Fuel Expense</h3>

            <input
              placeholder="Fuel Station"
              className="w-full border rounded p-2 mb-2"
              onChange={(e) =>
                setForm({
                  ...form,
                  fuel: { ...form.fuel, station: e.target.value },
                })
              }
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Liter"
                className="border rounded p-2"
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuel: { ...form.fuel, liter: e.target.value },
                  })
                }
              />
              <input
                placeholder="Amount"
                className="border rounded p-2"
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuel: { ...form.fuel, amount: e.target.value },
                  })
                }
              />
            </div>

            <textarea
              placeholder="Fuel Note"
              className="w-full border rounded p-2 mt-2"
              rows="2"
              onChange={(e) =>
                setForm({
                  ...form,
                  fuel: { ...form.fuel, note: e.target.value },
                })
              }
            />

            <input
              type="file"
              className="mt-2"
              onChange={(e) =>
                setForm({
                  ...form,
                  fuel: { ...form.fuel, receipt: e.target.files[0] },
                })
              }
            />
          </div>
        )}

        {/* ================= TOLL EXPENSE ================= */}
        {stage === 5 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">Toll Expense</h3>

            <input
              placeholder="Toll Gate"
              className="w-full border rounded p-2 mb-2"
              onChange={(e) =>
                setForm({
                  ...form,
                  toll: { ...form.toll, gate: e.target.value },
                })
              }
            />

            <input
              placeholder="Amount"
              className="w-full border rounded p-2"
              onChange={(e) =>
                setForm({
                  ...form,
                  toll: { ...form.toll, amount: e.target.value },
                })
              }
            />

            <textarea
              placeholder="Toll Note"
              className="w-full border rounded p-2 mt-2"
              rows="2"
              onChange={(e) =>
                setForm({
                  ...form,
                  toll: { ...form.toll, note: e.target.value },
                })
              }
            />

            <input
              type="file"
              className="mt-2"
              onChange={(e) =>
                setForm({
                  ...form,
                  toll: { ...form.toll, receipt: e.target.files[0] },
                })
              }
            />
          </div>
        )}

        {/* ================= LATEST STATUS LOG ================= */}
        {latestLog && (
          <div className="p-4 mb-4">
            <p className="text-gray-600">
              {'GPS Location'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {latestLog.latitude}, {latestLog.longitude}
            </p>
            <p className="text-gray-600">
              {'Captured At'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(latestLog.created_at).toLocaleString()}
            </p>
          </div>
        )}


        {/* ================= SAVE ================= */}
        <button
          disabled={!stage || loading}
          onClick={submit}
          className={`w-full py-3 rounded-xl text-white ${
            stage ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          {loading ? "Saving..." : "Upload & Save"}
        </button>

        <Link
          href={`/driver/jobs/${job.id}`}
          className="block text-center text-blue-600 text-sm"
        >
          Back to Job Detail
        </Link>
      </div>
    </div>
  );
}
