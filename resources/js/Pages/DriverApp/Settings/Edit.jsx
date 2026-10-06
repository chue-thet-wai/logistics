import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/inertia-react";
import { FaArrowLeft } from "react-icons/fa";
import {
  FormWrapper,
  Label,
  Input,
  Button,
  Textarea,
  Select,
} from "@/components";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/lang";

export default function Edit({
  driver,
  routes = [],
  checkpoints = [],
  statuses = [],
}) {

  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: driver?.name || "",
    phone: driver?.phone || "",
    status: driver?.status || "0",
    route: driver?.route || "",
    checkpoint: driver?.checkpoint || "",
    remark: driver?.remark || "",
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const filteredCheckpoints = checkpoints.filter(
    (c) => c.route_id == formData.route
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "route" ? { checkpoint: "" } : {}),
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setProcessing(true);

    Inertia.put("/driver/settings", formData, {
      onError: (err) => {
        setErrors(err);
        setProcessing(false);
      },
      onSuccess: () => {
        Inertia.visit("/driver/settings");
        setProcessing(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between bg-white shadow fixed top-0 left-0 right-0 z-10">
        <Link href="/driver/settings" className="text-xl">
          <FaArrowLeft />
        </Link>

        <h1 className="text-lg font-semibold">
          {t.editDriver}
        </h1>

        <div />
      </div>

      {/* FORM */}
      <div className="pt-24 px-4 pb-10">
        <FormWrapper onSubmit={submit}>

          <div className="grid grid-cols-1 gap-4">

            {/* Name */}
            <div>
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">{t.status}</Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statuses}
                placeholder={t.selectStatus}
                error={errors.status}
              />
            </div>

            {/* Route */}
            <div>
              <Label htmlFor="route">{t.route}</Label>
              <Select
                name="route"
                value={formData.route}
                onChange={handleChange}
                options={routes.map((r) => ({
                  value: r.id,
                  label: r.name,
                }))}
                placeholder={t.selectRoute}
                error={errors.route}
              />
            </div>

            {/* Checkpoint */}
            <div>
              <Label htmlFor="checkpoint">{t.checkpoint}</Label>
              <Select
                name="checkpoint"
                value={formData.checkpoint}
                onChange={handleChange}
                options={filteredCheckpoints.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder={t.selectCheckpoint}
                disabled={!formData.route}
                error={errors.checkpoint}
              />
            </div>

            {/* Remark */}
            <div>
              <Label htmlFor="remark">{t.remark}</Label>
              <Textarea
                id="remark"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                error={errors.remark}
                rows={3}
              />
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => Inertia.visit("/driver/settings")}
              disabled={processing}
            >
              {t.cancel}
            </Button>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 rounded-xl text-white bg-green-600"
            >
              {processing ? t.saving : t.save}
            </button>
          </div>

        </FormWrapper>
      </div>
    </div>
  );
}