import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Shield,
  LayoutDashboard,
  FileText,
  PhoneCall,
  CheckSquare,
  Award,
  Banknote,
  Settings,
  Users,
  LogOut,
  PlusCircle,
  HelpCircle,
} from "lucide-react";

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role || "CUSTOMER";

  // Role-specific navigation items
  const customerNav = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Applications", path: "/my-applications", icon: FileText },
    { label: "Apply for Loan", path: "/apply", icon: PlusCircle },
    { label: "Submit Enquiry", path: "/enquiry", icon: HelpCircle },
  ];

  const officerNav = [
    { label: "Officer Workbench", path: "/dashboard", icon: LayoutDashboard },
    { label: "Enquiries & Leads", path: "/officer/enquiries", icon: PhoneCall },
    { label: "Loan Applications", path: "/officer/applications", icon: FileText },
  ];

  const managerNav = [
    { label: "Manager Overview", path: "/dashboard", icon: LayoutDashboard },
    { label: "Approval Queue", path: "/manager/approvals", icon: Award },
    { label: "Disbursement Queue", path: "/manager/disbursements", icon: Banknote },
    { label: "All Applications", path: "/officer/applications", icon: FileText },
  ];

  const adminNav = [
    { label: "Admin Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Loan Products", path: "/admin/products", icon: Settings },
    { label: "User Accounts", path: "/admin/users", icon: Users },
    { label: "All Applications", path: "/officer/applications", icon: FileText },
    { label: "Lead Pipeline", path: "/officer/enquiries", icon: PhoneCall },
  ];

  const navItems =
    role === "ADMIN"
      ? adminNav
      : role === "MANAGER"
      ? managerNav
      : role === "LOAN_OFFICER"
      ? officerNav
      : customerNav;

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between flex-shrink-0 border-r border-slate-800 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-white">
              LOANFLOW
            </span>
            <span className="text-[10px] text-blue-400 block tracking-tight -mt-0.5">
              Smart Loan Management
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 block">
            Navigation
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
            {user?.name?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-white block truncate">
              {user?.name}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};
