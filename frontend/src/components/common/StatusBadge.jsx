import React from "react";
import { getStatusMeta } from "../../utils/formatters";
import { cn } from "../../lib/utils";

export const StatusBadge = ({ status, className }) => {
  const meta = getStatusMeta(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs select-none",
        meta.badgeColor,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", meta.dotColor)} />
      {meta.label}
    </span>
  );
};
