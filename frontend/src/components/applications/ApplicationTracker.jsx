import React from "react";
import { Check, Clock, AlertCircle, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

// Standard 9 stages
const WORKFLOW_STAGES = [
  { id: "ENQUIRY", label: "Enquiry" },
  { id: "APPLICATION", label: "Application" },
  { id: "DOCUMENTS", label: "Documents" },
  { id: "VERIFICATION", label: "Verification" },
  { id: "ELIGIBILITY", label: "Eligibility" },
  { id: "OFFICER_REVIEW", label: "Officer Review" },
  { id: "MANAGER_APPROVAL", label: "Manager Approval" },
  { id: "SANCTION", label: "Sanction" },
  { id: "DISBURSEMENT", label: "Disbursement" },
];

// Map application status to stage index
const getStageIndex = (status) => {
  switch (status) {
    case "APPLICATION_CREATED":
      return 1;
    case "DOCUMENT_PENDING":
      return 2;
    case "DOCUMENT_VERIFICATION":
      return 3;
    case "ADDITIONAL_DOCUMENTS_REQUIRED":
      return 3; // In verification / exception
    case "ELIGIBILITY_CHECK":
      return 4;
    case "OFFICER_REVIEW":
      return 5;
    case "MANAGER_APPROVAL":
      return 6;
    case "APPROVED":
      return 7;
    case "SANCTIONED":
      return 7;
    case "DISBURSEMENT_PENDING":
      return 8;
    case "DISBURSED":
      return 9; // All completed
    case "REJECTED":
      return -1;
    default:
      return 1;
  }
};

export const ApplicationTracker = ({ status, className }) => {
  const isRejected = status === "REJECTED";
  const currentIndex = getStageIndex(status);

  return (
    <div className={cn("w-full bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Application Lifecycle Tracker
        </h4>
        {isRejected ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" /> Application Rejected
          </span>
        ) : (
          <span className="text-xs font-semibold text-blue-600">
            Stage {Math.min(currentIndex, 9)} of 9
          </span>
        )}
      </div>

      {/* Responsive Horizontal Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
          {WORKFLOW_STAGES.map((stage, idx) => {
            let state = "UPCOMING"; // UPCOMING, CURRENT, COMPLETED, WAITING, FAILED

            if (isRejected) {
              state = idx === currentIndex ? "FAILED" : idx < currentIndex ? "COMPLETED" : "UPCOMING";
            } else if (idx < currentIndex) {
              state = "COMPLETED";
            } else if (idx === currentIndex) {
              state =
                status === "ADDITIONAL_DOCUMENTS_REQUIRED" || status === "DOCUMENT_PENDING"
                  ? "WAITING"
                  : "CURRENT";
            } else {
              state = "UPCOMING";
            }

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center min-w-[76px] flex-1 text-center relative group"
              >
                {/* Stepper Circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs z-10",
                    state === "COMPLETED" && "bg-emerald-600 text-white ring-4 ring-emerald-50",
                    state === "CURRENT" && "bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse",
                    state === "WAITING" && "bg-amber-500 text-white ring-4 ring-amber-100",
                    state === "FAILED" && "bg-red-600 text-white ring-4 ring-red-100",
                    state === "UPCOMING" && "bg-slate-100 text-slate-400 border border-slate-300"
                  )}
                >
                  {state === "COMPLETED" && <Check className="w-4 h-4 stroke-[3]" />}
                  {state === "CURRENT" && <span className="w-2.5 h-2.5 bg-white rounded-full" />}
                  {state === "WAITING" && <Clock className="w-4 h-4" />}
                  {state === "FAILED" && <AlertCircle className="w-4 h-4" />}
                  {state === "UPCOMING" && <Circle className="w-3.5 h-3.5 fill-slate-300 text-transparent" />}
                </div>

                {/* Stage Label */}
                <span
                  className={cn(
                    "text-[11px] font-semibold mt-2 transition-colors",
                    state === "COMPLETED" && "text-emerald-700",
                    state === "CURRENT" && "text-blue-700 font-bold",
                    state === "WAITING" && "text-amber-700 font-bold",
                    state === "FAILED" && "text-red-700 font-bold",
                    state === "UPCOMING" && "text-slate-400 font-normal"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
