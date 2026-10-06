import React, { useState } from "react";
import { Link } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import { FaArrowLeft } from "react-icons/fa";
import SearchableSelect from "@/components/SearchableSelect";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/lang";

export default function UpdateStatus({ trip, statuses, expense_types }) {

  const LAST_STATUS_VALUE = 9;
  const isFinalStage = Number(trip.status) === LAST_STATUS_VALUE;

  const { language } = useLanguage();
  const t = translations[language];

  const [stage, setStage] = useState(Number(trip.status));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    notes: "",
    latitude: "",
    longitude: "",
    photo: null,
    expenses: [],
  });

  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [newExpense, setNewExpense] = useState({
    //type: expense_types?.[0]?.value || "",
    type: "",
    title: "",
    amount: "",
    note: "",
    receipts: [],
  });

  const currentStatus = statuses.find(
    (s) => Number(s.value) === Number(trip.status)
  );

  const nextStatuses = statuses.filter(
    (s) => Number(s.value) >= Number(trip.status)
  );

  const getExpenseLabel = (value) => {
    const found = expense_types?.find(
      (t) => String(t.value) === String(value)
    );

    return (
      (language === 'th'
        ? (found?.label_th || found?.label)
        : found?.label) ||
      'N/A'
    );
  };

  const saveExpense = () => {
    const newErrors = {};

    if (!newExpense.type) newErrors.type = "Expense type is required.";
    if (!newExpense.amount && (!newExpense.receipts || newExpense.receipts.length === 0)) {
      newErrors.receipts = "Amount or at least one receipt is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setForm((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
    }));

    setNewExpense({
      type: expense_types?.[0]?.value || "",
      title: "",
      amount: "",
      note: "",
      receipts: [],
    });

    setErrors({});
    setShowExpenseForm(false);
  };

  const removeExpense = (index) => {
    setForm((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index),
    }));
  };

  const submit = () => {
    setLoading(true);

    Inertia.post(
      `/driver/trips/${trip.trip_id}/update`,
      {
        status: stage,
        notes: form.notes,
        latitude: form.latitude,
        longitude: form.longitude,
        photo: form.photo,
        expenses: form.expenses,
      },
      {
        forceFormData: true,
        onFinish: () => setLoading(false),
      }
    );
  };

  return (
    <div className="pb-24 min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="px-4 pt-6 pb-4 flex items-center bg-white shadow fixed top-0 left-0 right-0 z-10">
        <Link
          href={`/driver/trips/${trip.trip_id}`}
          className="text-xl text-gray-600"
        >
          <FaArrowLeft />
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold">
          {t.update_trip_status}
        </h1>
      </div>

      <div className="px-4 pt-24 space-y-4">

        {/* TRACK INFO */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold">
            {t.trip_id}: {trip.trip_id}
          </p>
          <p className="text-sm mt-1">
            {t.current_stage}:
            <span className="font-semibold ml-1">
              {language === 'th' ? currentStatus.label_th : currentStatus.label}
            </span>
          </p>
        </div>

        {/* STATUS FORM */}
        <div className="bg-white rounded-xl shadow p-4">

          <p className="font-semibold mb-2">{t.select_next_stage}</p>

          <select
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
            className="w-full border rounded-lg p-3"
          >
            {nextStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {language === 'th' ? s.label_th : s.label}
              </option>
            ))}
          </select>

          <textarea
            placeholder={t.notes}
            className="w-full mt-3 border rounded-lg p-3 text-sm"
            rows="3"
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-2 mt-3">
            <input
              placeholder={t.latitude}
              className="border rounded p-2"
              onChange={(e) =>
                setForm({ ...form, latitude: e.target.value })
              }
            />
            <input
              placeholder={t.longitude}
              className="border rounded p-2"
              onChange={(e) =>
                setForm({ ...form, longitude: e.target.value })
              }
            />
          </div>

          <input
            type="file"
            accept="image/*"
            className="mt-3"
            onChange={(e) =>
              setForm({ ...form, photo: e.target.files[0] })
            }
          />
        </div>

        {/* EXPENSES */}
        <div className="bg-white rounded-xl shadow p-4">

          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold">{t.expenses}</p>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="text-blue-600 text-sm"
            >
              + {t.add_expense}
            </button>
          </div>

          {showExpenseForm && (
            <div className="border rounded-lg p-3 mb-4 bg-gray-50">

              <SearchableSelect
                value={newExpense.type}
                options={expense_types.map((t) => ({
                  value: t.value,
                  label: language === 'th' ? (t.label_th || t.label) : t.label,
                }))}
                placeholder={t.search_expense_type}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    type: e.target.value,
                  })
                }
              />
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.type}
                </p>
              )}

              <input
                placeholder={t.title}
                className="w-full border rounded p-2 my-2"
                value={newExpense.title}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                placeholder={t.note}
                className="w-full mt-3 border rounded-lg p-3 text-sm"
                rows="3"
                value={newExpense.note}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    note: e.target.value,
                  })
                }
              />

              <input
                placeholder={t.amount}
                type="number"
                className="w-full border rounded p-2 mb-2"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    amount: e.target.value,
                  })
                }
              />

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  if (files.length > 3) {
                    setErrors({
                      receipts: "Maximum 3 receipt images allowed.",
                    });
                    return;
                  }

                  setNewExpense({
                    ...newExpense,
                    receipts: files,
                  });

                  setErrors({});
                }}
              />
              {errors.receipts && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.receipts}
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveExpense}
                  className="flex-1 bg-green-600 text-white py-2 rounded"
                >
                  {t.save_expense}
                </button>

                <button
                  onClick={() => {
                    setShowExpenseForm(false);
                    setErrors({});
                  }}
                  className="flex-1 bg-gray-300 py-2 rounded"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

          {form.expenses.length === 0 && (
            <p className="text-gray-500 text-sm">
              {t.no_expenses}
            </p>
          )}

          {form.expenses.map((expense, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 mb-2 flex justify-between"
            >
              <div>
                <p className="font-semibold">
                  {getExpenseLabel(expense.type)}
                </p>
                <p className="text-sm">{expense.title}</p>
                <p className="text-sm">
                  {t.amount}: {expense.amount}
                </p>
              </div>

              <button
                onClick={() => removeExpense(index)}
                className="text-red-500 text-sm"
              >
                {t.remove}
              </button>
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading || isFinalStage}
          onClick={submit}
          className={`w-full py-3 rounded-xl text-white ${
            isFinalStage
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600"
          }`}
        >
          {loading ? t.saving : t.upload_save}
        </button>

        <Link
          href={`/driver/trips/${trip.trip_id}`}
          className="block text-center text-blue-600 text-sm"
        >
          {t.back_trip}
        </Link>

      </div>
    </div>
  );
}