import React from "react";
import { cn } from "../../lib/utils";

export const Tabs = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto no-scrollbar",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all",
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
