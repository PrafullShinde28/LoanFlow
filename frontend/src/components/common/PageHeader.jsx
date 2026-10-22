import React from "react";

export const PageHeader = ({ title, description, actions, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4 border-b border-[#E2E8F0]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[#64748B] mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      {children}
    </div>
  );
};
