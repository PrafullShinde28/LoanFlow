import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";

// Auth views
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Shared view
import { ApplicationDossier } from "./pages/shared/ApplicationDossier";

// Customer views
import { CustomerDashboard } from "./pages/customer/CustomerDashboard";
import { MyApplications } from "./pages/customer/MyApplications";
import { ApplyLoan } from "./pages/customer/ApplyLoan";
import { SubmitEnquiry } from "./pages/customer/SubmitEnquiry";

// Officer views
import { OfficerDashboard } from "./pages/officer/OfficerDashboard";
import { EnquiriesList } from "./pages/officer/EnquiriesList";
import { ApplicationsList } from "./pages/officer/ApplicationsList";

// Manager views
import { ManagerDashboard } from "./pages/manager/ManagerDashboard";
import { ApprovalQueue } from "./pages/manager/ApprovalQueue";
import { DisbursementQueue } from "./pages/manager/DisbursementQueue";

// Admin views
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ProductManagement } from "./pages/admin/ProductManagement";
import { UserManagement } from "./pages/admin/UserManagement";

// Dynamic Dashboard Resolver based on logged-in role
const DynamicDashboard = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "MANAGER":
      return <ManagerDashboard />;
    case "LOAN_OFFICER":
      return <OfficerDashboard />;
    case "CUSTOMER":
    default:
      return <CustomerDashboard />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Portal Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DynamicDashboard />} />
                <Route path="/applications/:id" element={<ApplicationDossier />} />
                <Route path="/enquiry" element={<SubmitEnquiry />} />

                {/* Customer routes */}
                <Route path="/my-applications" element={<MyApplications />} />
                <Route path="/apply" element={<ApplyLoan />} />

                {/* Officer & Management routes */}
                <Route path="/officer/enquiries" element={<EnquiriesList />} />
                <Route path="/officer/applications" element={<ApplicationsList />} />

                {/* Manager routes */}
                <Route path="/manager/approvals" element={<ApprovalQueue />} />
                <Route path="/manager/disbursements" element={<DisbursementQueue />} />

                {/* Admin routes */}
                <Route path="/admin/products" element={<ProductManagement />} />
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
