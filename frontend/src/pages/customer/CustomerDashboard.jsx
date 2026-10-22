import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  CreditCard,
  Building2,
} from "lucide-react";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getCustomerDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    totalApplications: 0,
    pending: 0,
    approved: 0,
    disbursed: 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Track your ongoing loan applications, document checklists, and sanction offers.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/enquiry")}
            className="gap-1.5"
          >
            Check Loan Offers
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/apply")}
            className="gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Apply for Loan
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Total Applications
            </span>
            <span className="text-xl font-bold text-slate-800">
              {stats.totalApplications}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              In Progress
            </span>
            <span className="text-xl font-bold text-amber-600">
              {stats.pending}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Sanctioned
            </span>
            <span className="text-xl font-bold text-purple-600">
              {stats.approved}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Disbursed
            </span>
            <span className="text-xl font-bold text-emerald-600">
              {stats.disbursed}
            </span>
          </div>
        </Card>
      </div>

      {/* Recent Applications Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Active Applications</CardTitle>
          <Link
            to="/my-applications"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {data?.recentApplications?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Loan Product</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentApplications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell className="font-mono font-bold text-blue-600 text-xs">
                      {app.applicationNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {app.productId?.name}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-800">
                      {formatCurrency(app.requestedAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {app.requestedTenureMonths} Mo
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(app.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/applications/${app._id}`)}
                        className="text-xs h-7 px-2.5"
                      >
                        Track Progress
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 space-y-3">
              <p className="text-xs text-slate-500">You don't have any loan applications yet.</p>
              <Button size="sm" onClick={() => navigate("/apply")}>
                Start New Application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
