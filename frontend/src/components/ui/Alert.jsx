import React from "react";
import { cn } from "../../lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export const Alert = ({
  variant = "info",
  title,
  children,
  className,
}) => {
  const configs = {
    info: {
      bg: "bg-blue-50/70 border-blue-200 text-blue-900",
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    },
    success: {
      bg: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50/70 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    },
    danger: {
      bg: "bg-red-50/70 border-red-200 text-red-900",
      icon: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    },
  };

  const current = configs[variant] || configs.info;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl border text-sm",
        current.bg,
        className
      )}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

export const Progress = ({ value = 0, max = 100, className, barColor = "bg-blue-600" }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full bg-slate-100 rounded-full h-2 overflow-hidden", className)}>
      <div
        className={cn("h-full transition-all duration-300 rounded-full", barColor)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  );
};
