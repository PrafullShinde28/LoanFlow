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
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Settings,
  ShieldCheck,
} from "lucide-react";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await dashboardApi.getAdminDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  const stats = data?.stats || {
    totalCustomers: 0,
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    disbursed: 0,
    totalDisbursedAmount: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Enterprise Administration & Oversight
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Global operational throughput, loan portfolio distribution, and system configuration.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/admin/products")}
            className="gap-1.5"
          >
            <Settings className="w-4 h-4" /> Loan Products
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/admin/users")}
            className="gap-1.5"
          >
            <Users className="w-4 h-4" /> User Management
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Total Customers
          </span>
          <span className="text-xl font-bold text-slate-800">
            {stats.totalCustomers}
          </span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Total Applications
          </span>
          <span className="text-xl font-bold text-slate-800">
            {stats.totalApplications}
          </span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            In Underwriting
          </span>
          <span className="text-xl font-bold text-amber-600">
            {stats.pending}
          </span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Approved / Sanctioned
          </span>
          <span className="text-xl font-bold text-blue-600">
            {stats.approved}
          </span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Declined
          </span>
          <span className="text-xl font-bold text-red-600">
            {stats.rejected}
          </span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Disbursed Volume
          </span>
          <span className="text-sm font-bold text-emerald-700 truncate block">
            {formatCurrency(stats.totalDisbursedAmount)}
          </span>
        </Card>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Lifecycle Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data?.statusDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Share by Loan Product</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data?.productDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.productDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {data.productDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Institutional Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Enterprise Applications</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/officer/applications")}
          >
            Full Registry
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {data?.recentApplications?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentApplications.map((app) => (
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
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No recent applications recorded.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
