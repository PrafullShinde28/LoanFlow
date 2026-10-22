import React from "react";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl select-none";

    const variants = {
      primary: "bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm active:bg-blue-800",
      secondary: "bg-slate-100 text-[#0F172A] hover:bg-slate-200 active:bg-slate-300",
      outline: "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50 hover:border-slate-300",
      ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
      danger: "bg-[#EF4444] text-white hover:bg-red-600 shadow-sm active:bg-red-700",
      success: "bg-[#10B981] text-white hover:bg-emerald-600 shadow-sm active:bg-emerald-700",
      dark: "bg-[#0F172A] text-white hover:bg-slate-800 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
