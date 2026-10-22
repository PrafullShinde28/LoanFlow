import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enquiryApi } from "../../api/enquiryApi";
import { useNotification } from "../../context/NotificationContext";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Search, UserCheck, PhoneCall, Check, Filter } from "lucide-react";

export const EnquiriesList = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      const res = await enquiryApi.getEnquiries({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      if (res.success) {
        setEnquiries(res.data.enquiries || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load enquiries", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleMarkContacted = async (id) => {
    try {
      const res = await enquiryApi.updateEnquiry(id, {
        status: "CONTACTED",
        contactNotes: "Called applicant; confirmed interest and eligibility prerequisites.",
      });
      if (res.success) {
        showToast("Enquiry marked as CONTACTED", "success");
        fetchEnquiries();
      }
    } catch (err) {
      showToast(err.message || "Update failed", "error");
    }
  };

  const handleConvert = async (id) => {
    try {
      const res = await enquiryApi.convertEnquiry(id);
      if (res.success) {
        showToast("Enquiry successfully converted to Loan Application!", "success");
        fetchEnquiries();
        if (res.data?.application?._id) {
          navigate(`/applications/${res.data.application._id}`);
        }
      }
    } catch (err) {
      showToast(err.message || "Conversion failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Customer Enquiries & Lead Pipeline
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Qualify incoming customer loan enquiries and convert valid leads into formal loan files.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search by Enquiry #, Customer Name, Mobile, Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="CLOSED">CLOSED</option>
              </Select>
            </div>
            <Button type="submit" size="sm" className="w-full sm:w-auto gap-1.5">
              <Search className="w-4 h-4" /> Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Enquiries Data Table */}
      <Card>
        <CardContent className="p-0">
          {enquiries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enquiry #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mobile / Email</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enq) => (
                  <TableRow key={enq._id}>
                    <TableCell className="font-mono font-bold text-xs text-blue-600">
                      {enq.enquiryNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {enq.fullName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{enq.mobile}</div>
                      <div className="text-[10px] text-slate-400">{enq.email}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-800">
                      {enq.loanProductId?.name}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-800">
                      {formatCurrency(enq.requestedAmount)}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-emerald-700">
                      {formatCurrency(enq.monthlyIncome)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          enq.status === "CONVERTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : enq.status === "CONTACTED"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {enq.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {enq.status === "NEW" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkContacted(enq._id)}
                            className="text-xs h-7 px-2"
                          >
                            Mark Contacted
                          </Button>
                        )}
                        {enq.status !== "CONVERTED" ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleConvert(enq._id)}
                            className="text-xs h-7 px-2.5 gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Convert to Loan
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/applications/${
                                  enq.convertedApplicationId?._id ||
                                  enq.convertedApplicationId
                                }`
                              )
                            }
                            className="text-xs h-7 px-2"
                          >
                            View Loan
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              No enquiries match the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
