import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/common/Sidebar";
import { Navbar } from "../components/common/Navbar";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Fixed Deep Navy Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
