import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/Button";

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "There is currently no data to display in this view.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-[#E2E8F0]">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-[#0F172A] mb-1">{title}</h4>
      <p className="text-xs text-[#64748B] max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
