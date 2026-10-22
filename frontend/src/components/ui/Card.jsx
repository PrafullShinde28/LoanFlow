import React from "react";
import { cn } from "../../lib/utils";

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("px-6 py-4 border-b border-[#E2E8F0] flex flex-col gap-1", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3
      className={cn("text-base font-semibold text-[#0F172A] tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p className={cn("text-xs text-[#64748B]", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "px-6 py-3 bg-slate-50/50 border-t border-[#E2E8F0] flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
