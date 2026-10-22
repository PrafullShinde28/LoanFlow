import React, { useEffect } from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export const Dialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Body */}
      <div
        className={cn(
          "relative bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-h-[90vh] flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150",
          maxWidth
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
            {description && (
              <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
