import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  User,
} from "lucide-react";
import { formatDateTime } from "../../utils/formatters";

export const Navbar = () => {
  const { user, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "MANAGER":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "LOAN_OFFICER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CUSTOMER":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const handleRoleSwitch = async (role) => {
    setShowRoleMenu(false);
    await quickLogin(role);
    window.location.href = "/dashboard";
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between z-20">
      {/* Search or Page Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">
          LOANFLOW System Engine
        </span>
        <span className="text-slate-300">/</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${getRoleBadgeStyle(
            user?.role
          )}`}
        >
          {user?.role?.replace("_", " ")}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 text-xs font-semibold transition-all"
            title="Switch demo user persona instantly"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Switch Role</span>
            <ChevronDown className="w-3 h-3 text-blue-600" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                1-Click Persona Switch
              </div>
              <button
                onClick={() => handleRoleSwitch("CUSTOMER")}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex flex-col"
              >
                <span className="font-semibold text-slate-800">Rahul Patil (Customer)</span>
                <span className="text-[10px] text-slate-400">Main Demo Applicant - ₹4L Loan</span>
              </button>
              <button
                onClick={() => handleRoleSwitch("LOAN_OFFICER")}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex flex-col"
              >
                <span className="font-semibold text-slate-800">Loan Officer</span>
                <span className="text-[10px] text-slate-400">Document Verification & Eligibility</span>
              </button>
              <button
                onClick={() => handleRoleSwitch("MANAGER")}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex flex-col"
              >
                <span className="font-semibold text-slate-800">Branch Manager</span>
                <span className="text-[10px] text-slate-400">Credit Sanctions & Disbursements</span>
              </button>
              <button
                onClick={() => handleRoleSwitch("ADMIN")}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex flex-col"
              >
                <span className="font-semibold text-slate-800">Super Admin</span>
                <span className="text-[10px] text-slate-400">Products & System Config</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.isRead ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">
                          {n.type === "SUCCESS" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : n.type === "WARNING" ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ) : n.type === "ERROR" ? (
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {formatDateTime(n.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name?.[0] || "U"}
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};
