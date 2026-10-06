import React, { useState } from "react";
import { Link } from "@inertiajs/inertia-react";
import {
  FaArrowLeft,
  FaPaperclip,
  FaBox,
  FaTruck,
  FaMapMarkerAlt
} from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/lang";

export default function ContainerDetail({ track, container }) {

  const { language } = useLanguage();
  const t = translations[language];

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const Field = ({ label, value }) => (
    <div className="mb-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 break-words">
        {value || "-"}
      </p>
    </div>
  );

  const Section = ({ icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="px-4 pt-6 pb-4 bg-white shadow-sm flex items-center sticky top-0 z-10">
        <Link href={`/driver/tracks/${track.track_id}`} className="text-gray-600 text-lg">
          <FaArrowLeft />
        </Link>

        <h1 className="text-lg font-semibold ml-4">
          {t.containerDetail}
        </h1>
      </div>

      <div className="p-4">

        {/* BASIC INFO */}
        <Section icon={<FaBox />} title={t.basicInfo}>
          <Field label={t.containerNo} value={container.container_no} />
          <Field label={t.productCategory} value={container.product_category} />
        </Section>

        {/* PICKUP INFO */}
        <Section icon={<FaMapMarkerAlt />} title={t.pickupInfo}>
          <Field label={t.pickupDate} value={formatDate(container.pickup_date)} />
          <Field label={t.pickupAddress} value={container.pickup_address} />
          <Field label={t.pickupPerson} value={container.pickup_contact_person} />
          <Field label={t.pickupPhone} value={container.pickup_contact_phone} />
        </Section>

        {/* DELIVERY INFO */}
        <Section icon={<FaTruck />} title={t.deliveryInfo}>
          <Field label={t.deliveryAddress} value={container.delivery_address} />
          <Field label={t.deliveryPerson} value={container.delivery_contact_person} />
          <Field label={t.deliveryPhone} value={container.delivery_contact_phone} />
        </Section>

        {/* BILLING */}
        <Section icon={<FaBox />} title={t.billingRemark}>
          <Field label={t.billingCustomer} value={container.billing_customer} />
          <Field label={t.remark} value={container.remark} />
        </Section>

        {/* ATTACHMENTS */}
        <Section icon={<FaPaperclip />} title={t.attachments}>
          {container.files && container.files.length > 0 ? (
            <div className="space-y-2">
              {container.files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition text-sm cursor-pointer"
                >
                  <FaPaperclip />
                  {file.file_name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {t.noAttachments}
            </p>
          )}
        </Section>

        {/* FILE PREVIEW */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl w-[90%] max-w-4xl p-4 relative">

              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
              >
                ✕
              </button>

              <h2 className="text-sm font-semibold mb-3">
                {selectedFile.file_name}
              </h2>

              <div className="w-full h-[500px]">

                {selectedFile.file_name.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                  <img
                    src={selectedFile.file_url}
                    alt="preview"
                    className="w-full h-full object-contain"
                  />
                ) :

                selectedFile.file_name.match(/\.pdf$/i) ? (
                  <iframe
                    src={selectedFile.file_url}
                    title="pdf"
                    className="w-full h-full"
                  />
                ) :

                selectedFile.file_name.match(/\.(txt|csv)$/i) ? (
                  <iframe
                    src={selectedFile.file_url}
                    title="text"
                    className="w-full h-full bg-gray-50"
                  />
                ) :

                selectedFile.file_name.match(/\.(xls|xlsx)$/i) ? (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedFile.file_url)}`}
                    title="excel"
                    className="w-full h-full"
                  />
                ) : (

                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-gray-500">
                      {t.previewNotAvailable} <br />
                      <a
                        href={selectedFile.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {t.downloadFile}
                      </a>
                    </p>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}