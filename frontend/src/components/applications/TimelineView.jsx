import React from "react";
import { formatDateTime } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";
import { CheckCircle2, User, Clock, FileText, ArrowRight } from "lucide-react";

export const TimelineView = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed">
        No state transition history recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item, index) => {
        const isLatest = index === 0;
        return (
          <div key={item._id || index} className="relative group">
            {/* Timeline Node Dot */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isLatest
                  ? "bg-blue-600 border-white ring-4 ring-blue-100 text-white"
                  : "bg-white border-slate-300 text-slate-400 group-hover:border-blue-400"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isLatest ? "bg-white" : "bg-slate-400"
                }`}
              />
            </div>

            {/* Event Card */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F172A] tracking-tight">
                    {item.action?.replace(/_/g, " ")}
                  </span>
                  {item.previousStatus && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>{item.previousStatus}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                  <StatusBadge status={item.newStatus} />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(item.timestamp)}
                </div>
              </div>

              {item.remarks && (
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2 font-mono leading-relaxed">
                  "{item.remarks}"
                </p>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  By <strong className="text-slate-700">{item.performedBy?.name || "System"}</strong>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                  {item.role || item.performedBy?.role || "SYSTEM"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
