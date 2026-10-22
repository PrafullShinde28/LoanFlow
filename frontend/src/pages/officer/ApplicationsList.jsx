import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/applicationApi";
import { productApi } from "../../api/productApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

export const ApplicationsList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productApi.getProducts().then((res) => {
      if (res.success) setProducts(res.data.products);
    });
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await applicationApi.getApplications({
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        productId: productFilter || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });

      if (res.success) {
        setApplications(res.data.applications || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, productFilter, sortBy, sortOrder, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Loan Applications Registry
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Complete institutional repository of loan files across all lifecycle and underwriting phases.
          </p>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by Application # (e.g. LOAN-2026-0001)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="DOCUMENT_PENDING">Documents Pending</option>
                <option value="DOCUMENT_VERIFICATION">Verification In-Progress</option>
                <option value="ADDITIONAL_DOCUMENTS_REQUIRED">Re-upload Required</option>
                <option value="OFFICER_REVIEW">Officer Review</option>
                <option value="MANAGER_APPROVAL">Manager Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="DISBURSEMENT_PENDING">Disbursement Pending</option>
                <option value="DISBURSED">Disbursed</option>
                <option value="REJECTED">Rejected</option>
              </Select>
            </div>

            <div>
              <Select
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [b, o] = e.target.value.split("-");
                  setSortBy(b);
                  setSortOrder(o);
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="requestedAmount-desc">Highest Amount</option>
                <option value="requestedAmount-asc">Lowest Amount</option>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          {applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Loan Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Officer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell className="font-mono font-bold text-xs text-blue-600">
                      {app.applicationNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {app.customerId?.fullName || app.userId?.name}
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
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {app.assignedOfficerId?.name || "Unassigned"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/applications/${app._id}`)}
                        className="text-xs h-7 px-2.5"
                      >
                        Open Dossier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              No applications match the search/filter parameters.
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-[#E2E8F0] bg-slate-50/50 text-xs text-slate-600">
              <span>
                Page {page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 px-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
