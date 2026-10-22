import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/applicationApi";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { PlusCircle, ArrowRight } from "lucide-react";

export const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await applicationApi.getApplications();
        if (res.success) {
          setApplications(res.data.applications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            My Loan Applications
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time status updates, document checklists, and sanction offer decrees.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/apply")} className="gap-1.5">
          <PlusCircle className="w-4 h-4" /> New Loan Application
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Loan Product</TableHead>
                  <TableHead>Requested Amount</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
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
                        className="text-xs h-7 px-3"
                      >
                        Open Dossier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 space-y-3">
              <p>No loan applications found.</p>
              <Button size="sm" onClick={() => navigate("/apply")}>
                Apply Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
