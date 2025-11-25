import React, { useState } from "react";
import { Link } from "../../components";
import { ChevronDown, ChevronRight } from "lucide-react";

const CollapsibleCard = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-xl shadow-sm bg-white mb-4 overflow-hidden m-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full px-5 py-3 bg-gray-50 hover:bg-gray-100 transition"
      >
        <span className="font-semibold text-gray-700">{title}</span>
        {open ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {open && <div className="px-5 py-4 border-t">{children}</div>}
    </div>
  );
};

const JobShow = ({ job, pageTitle }) => {
  const Value = ({ children }) => <p>{children || "-"}</p>;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center h-14 px-6 py-2 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
        <Link href="/jobs">Job List</Link>
      </div>

      {/* Basic Shipment Info */}
      <CollapsibleCard title="Basic Shipment Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Shipment ID</span>
            <Value>{job.shipment_id}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Booking ID</span>
            <Value>{job.booking_id}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Customer</span>
            <Value>{job.lead?.customer?.name}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Category</span>
            <Value>{job.category}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Mode</span>
            <Value>{job.mode}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">ETA</span>
            <Value>{job.eta}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Origin</span>
            <Value>{job.origin}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Destination</span>
            <Value>{job.destination}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">BL Number</span>
            <Value>{job.bl_number}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Free Days</span>
            <Value>{job.free_day}</Value>
          </div>
        </div>
      </CollapsibleCard>

      {/* Operational Instructions */}
      <CollapsibleCard title="Operational Instructions">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Pickup Date</span>
            <Value>{job.operational_pickup_date}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Container Info</span>
            <Value>{job.operational_container_info}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Gate Pass Info</span>
            <Value>{job.operational_gatepass_info}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Receiving Confirmation</span>
            <Value>{job.operational_receiving_confirmation}</Value>
          </div>
        </div>
      </CollapsibleCard>

      {/* Detention Information */}
      <CollapsibleCard title="Detention Information">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Free Days</span>
            <Value>{job.detention_free_days}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Used Days</span>
            <Value>{job.detention_used_days}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Extra Days</span>
            <Value>{job.detention_extra_days}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Rate</span>
            <Value>{job.detention_rate}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Total</span>
            <Value>{job.detention_total}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Remarks</span>
            <Value>{job.detention_remark}</Value>
          </div>
        </div>
      </CollapsibleCard>

      {/* Demurrage Information */}
      <CollapsibleCard title="Demurrage Information">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Free Days</span>
            <Value>{job.demurrage_free_days}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Used Days</span>
            <Value>{job.demurrage_used_days}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Extra Days</span>
            <Value>{job.demurrage_extra_days}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Rate</span>
            <Value>{job.demurrage_rate}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Total</span>
            <Value>{job.demurrage_total}</Value>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Remarks</span>
            <Value>{job.demurrage_remark}</Value>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
};

export default JobShow;
