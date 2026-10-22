import React from "react";
import { cn } from "../../lib/utils";

export const Select = React.forwardRef(
  ({ className, label, error, helperText, children, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-[#0F172A]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
