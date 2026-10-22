import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/applicationApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Banknote, ArrowUpRight } from "lucide-react";

export const DisbursementQueue = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await applicationApi.getApplications({
          status: "DISBURSEMENT_PENDING",
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
            Loan Disbursement Operations Queue
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Applications with approved sanctions ready for NEFT/RTGS fund transfers and bank transaction settlement.
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
                  <TableHead>Sanctioned Amount</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Approved By</TableHead>
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
                    <TableCell className="text-xs font-bold text-emerald-700">
                      {formatCurrency(app.requestedAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {app.requestedTenureMonths} Mo
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {app.assignedManagerId?.name || "Branch Manager"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => navigate(`/applications/${app._id}`)}
                        className="text-xs h-7 px-3 gap-1"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Execute Disbursement
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              No applications are currently awaiting disbursement.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
