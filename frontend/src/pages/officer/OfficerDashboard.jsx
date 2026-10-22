import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import { enquiryApi } from "../../api/enquiryApi";
import { useNotification } from "../../context/NotificationContext";
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
  FileCheck2,
  Clock,
  Calculator,
  ArrowRight,
  PhoneCall,
  UserCheck,
} from "lucide-react";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"];

export const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getOfficerDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleConvertEnquiry = async (enquiryId) => {
    try {
      const res = await enquiryApi.convertEnquiry(enquiryId);
      if (res.success) {
        showToast("Enquiry successfully converted to formal loan application!", "success");
        fetchDashboard();
        if (res.data?.application?._id) {
          navigate(`/applications/${res.data.application._id}`);
        }
      }
    } catch (err) {
      showToast(err.message || "Failed to convert enquiry", "error");
    }
  };

  const stats = data?.stats || {
    newEnquiries: 0,
    applicationsUnderReview: 0,
    documentsPending: 0,
    eligibilityPending: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Loan Officer Workbench
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Qualify incoming customer enquiries, inspect documents, run financial eligibility, and forward appraisals.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/officer/enquiries")}
          className="gap-1.5"
        >
          <PhoneCall className="w-4 h-4" /> Manage All Enquiries
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              New Enquiries
            </span>
            <span className="text-xl font-bold text-slate-800">
              {stats.newEnquiries}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Under Review
            </span>
            <span className="text-xl font-bold text-purple-600">
              {stats.applicationsUnderReview}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Docs Pending
            </span>
            <span className="text-xl font-bold text-amber-600">
              {stats.documentsPending}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Ready for Verification
            </span>
            <span className="text-xl font-bold text-emerald-600">
              {stats.eligibilityPending}
            </span>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applications by Status</CardTitle>
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
                No status data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications by Loan Product</CardTitle>
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                No product distribution data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unconverted Enquiries Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Incoming Enquiries Requiring Qualification</CardTitle>
            <p className="text-xs text-slate-500">
              Convert verified customer leads directly into formal loan applications.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/officer/enquiries")}
          >
            All Enquiries
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {data?.pendingEnquiries?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enquiry #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.pendingEnquiries.map((enq) => (
                  <TableRow key={enq._id}>
                    <TableCell className="font-mono font-bold text-xs text-blue-600">
                      {enq.enquiryNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {enq.fullName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {enq.mobile}
                    </TableCell>
                    <TableCell className="text-xs text-slate-800">
                      {enq.loanProductId?.name}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-800">
                      {formatCurrency(enq.requestedAmount)}
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {enq.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleConvertEnquiry(enq._id)}
                        className="text-xs h-7 px-2.5 gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Convert to Loan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No new unassigned enquiries in pipeline.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
