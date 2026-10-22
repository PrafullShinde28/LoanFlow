import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShieldAlert,
  Award,
  XCircle,
  Banknote,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

const COLORS = ["#10B981", "#EF4444", "#2563EB", "#F59E0B"];

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getManagerDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
    pendingDisbursement: 0,
    disbursed: 0,
    totalDisbursedAmount: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Credit Committee & Branch Manager Portal
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Dual-control executive credit underwriting, sanction letter generation, and disbursement management.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/manager/approvals")}
          >
            Approval Queue ({stats.pendingApprovals})
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={() => navigate("/manager/disbursements")}
            className="gap-1.5"
          >
            <Banknote className="w-4 h-4" /> Disbursement Queue ({stats.pendingDisbursement})
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Pending Approvals
            </span>
            <span className="text-xl font-bold text-blue-600">
              {stats.pendingApprovals}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Sanctioned
            </span>
            <span className="text-xl font-bold text-emerald-600">
              {stats.approved}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Declined
            </span>
            <span className="text-xl font-bold text-red-600">
              {stats.rejected}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Pending Transfer
            </span>
            <span className="text-xl font-bold text-amber-600">
              {stats.pendingDisbursement}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Total Disbursed
            </span>
            <span className="text-sm font-bold text-emerald-800 truncate block">
              {formatCurrency(stats.totalDisbursedAmount)}
            </span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Committee Decisions</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data?.approvalComparison?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.approvalComparison}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, count }) => `${name} (${count})`}
                    labelLine={false}
                  >
                    {data.approvalComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No decision data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Volume Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data?.productDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.productDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No product distribution data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manager Approval Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Applications Awaiting Executive Sanction</CardTitle>
            <p className="text-xs text-slate-500">
              Loan officer recommendations and verified files awaiting final branch manager sign-off.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/manager/approvals")}
          >
            View All ({stats.pendingApprovals})
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {data?.pendingApprovals?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.pendingApprovals.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell className="font-mono font-bold text-xs text-blue-600">
                      {app.applicationNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {app.customerId?.fullName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {app.productId?.name}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-800">
                      {formatCurrency(app.requestedAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {app.requestedTenureMonths} Mo
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {app.assignedOfficerId?.name || "Credit Officer"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/applications/${app._id}`)}
                        className="text-xs h-7 px-3"
                      >
                        Review & Sanction
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No applications pending manager review.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
