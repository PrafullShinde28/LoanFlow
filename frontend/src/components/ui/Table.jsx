import React from "react";
import { cn } from "../../lib/utils";

export const Table = ({ className, children, ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table
        className={cn("w-full text-left text-sm text-[#0F172A]", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ className, children, ...props }) => {
  return (
    <thead
      className={cn("bg-slate-50/80 border-b border-[#E2E8F0] text-xs font-semibold text-slate-500 uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ className, children, ...props }) => {
  return (
    <tbody className={cn("divide-y divide-[#E2E8F0] bg-white", className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ className, children, ...props }) => {
  return (
    <tr
      className={cn("hover:bg-slate-50/80 transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ className, children, ...props }) => {
  return (
    <th className={cn("px-4 py-3 font-semibold", className)} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ className, children, ...props }) => {
  return (
    <td className={cn("px-4 py-3.5 align-middle", className)} {...props}>
      {children}
    </td>
  );
};
