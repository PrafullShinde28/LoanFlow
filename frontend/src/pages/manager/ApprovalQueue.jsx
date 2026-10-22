import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/applicationApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Award, ArrowRight } from "lucide-react";

export const ApprovalQueue = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await applicationApi.getApplications({
          status: "MANAGER_APPROVAL",
        });
        if (res.success) {
          setApplications(res.data.applications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueue();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Executive Approval Queue
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Applications with 100% verified proofs, passing eligibility assessment, and formal underwriter recommendation.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Requested Loan</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Underwriting Officer</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
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
                        className="text-xs h-7 px-3 gap-1"
                      >
                        <Award className="w-3.5 h-3.5" /> Open Sanction Dossier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              No applications are currently awaiting manager approval.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
