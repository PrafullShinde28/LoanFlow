import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/applicationApi";
import { documentApi } from "../../api/documentApi";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { ApplicationTracker } from "../../components/applications/ApplicationTracker";
import { StatusBadge } from "../../components/common/StatusBadge";
import { TimelineView } from "../../components/applications/TimelineView";
import { DocumentUploadModal } from "../../components/applications/DocumentUploadModal";
import { DocumentVerificationModal } from "../../components/applications/DocumentVerificationModal";
import { EligibilityModal } from "../../components/applications/EligibilityModal";
import { ApprovalModal } from "../../components/applications/ApprovalModal";
import { DisbursementModal } from "../../components/applications/DisbursementModal";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Tabs } from "../../components/ui/Tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Alert } from "../../components/ui/Alert";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";
import {
  FileText,
  User,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Calculator,
  Award,
  ArrowUpRight,
  Clock,
  ArrowLeft,
  XCircle,
  Eye,
  Check,
} from "lucide-react";

export const ApplicationDossier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sanction, setSanction] = useState(null);
  const [disbursement, setDisbursement] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState(null);
  const [verifyDocModal, setVerifyDocModal] = useState({ isOpen: false, doc: null });
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isDisbursementOpen, setIsDisbursementOpen] = useState(false);

  const fetchApplicationData = async () => {
    try {
      setIsLoading(true);
      const res = await applicationApi.getApplicationById(id);
      if (res.success) {
        setApplication(res.data.application);
      }

      // Fetch related sub-resources
      const [docsRes, eligRes, reviewsRes, sanctionRes, disbRes, histRes] =
        await Promise.allSettled([
          documentApi.getDocuments(id),
          applicationApi.getEligibility(id),
          applicationApi.getReviews(id),
          applicationApi.getSanction(id),
          applicationApi.getDisbursement(id),
          applicationApi.getHistory(id),
        ]);

      if (docsRes.status === "fulfilled" && docsRes.value.success) {
        setDocuments(docsRes.value.data.documents || []);
      }
      if (eligRes.status === "fulfilled" && eligRes.value.success) {
        setEligibility(eligRes.value.data.assessment);
      }
      if (reviewsRes.status === "fulfilled" && reviewsRes.value.success) {
        setReviews(reviewsRes.value.data.reviews || []);
      }
      if (sanctionRes.status === "fulfilled" && sanctionRes.value.success) {
        setSanction(sanctionRes.value.data.sanction);
      }
      if (disbRes.status === "fulfilled" && disbRes.value.success) {
        setDisbursement(disbRes.value.data.disbursement);
      }
      if (histRes.status === "fulfilled" && histRes.value.success) {
        setHistory(histRes.value.data.history || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load application dossier", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-1/3" />
        <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-base font-semibold">Application Not Found</h3>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const role = user?.role;
  const status = application.status;
  const isOfficer = role === "LOAN_OFFICER" || role === "ADMIN";
  const isManager = role === "MANAGER" || role === "ADMIN";
  const isCustomer = role === "CUSTOMER";

  const allRequiredDocTypes = [
    "IDENTITY_PROOF",
    "ADDRESS_PROOF",
    "INCOME_PROOF",
    "BANK_STATEMENT",
    "EMPLOYMENT_PROOF",
  ];

  const verifiedCount = documents.filter((d) => d.status === "VERIFIED").length;
  const hasAllDocsVerified = allRequiredDocTypes.every((t) =>
    documents.some((d) => d.documentType === t && d.status === "VERIFIED")
  );

  const tabsConfig = [
    { id: "overview", label: "Overview" },
    { id: "customer", label: "Customer Dossier" },
    { id: "loan", label: "Loan Terms" },
    { id: "documents", label: "Documents", count: documents.length },
    { id: "eligibility", label: "Eligibility Engine" },
    { id: "review", label: "Officer Review" },
    { id: "approval", label: "Manager Approval" },
    { id: "sanction", label: "Sanction Letter" },
    { id: "disbursement", label: "Disbursement" },
    { id: "timeline", label: "Audit Timeline", count: history.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </button>

        {/* Top Context-Sensitive Actions Bar */}
        <div className="flex items-center gap-2">
          {isCustomer && (status === "DOCUMENT_PENDING" || status === "ADDITIONAL_DOCUMENTS_REQUIRED") && (
            <Button
              size="sm"
              onClick={() => {
                setUploadDocType(null);
                setIsUploadOpen(true);
              }}
              className="gap-1.5"
            >
              <UploadCloud className="w-4 h-4" /> Upload Proof
            </Button>
          )}

          {isOfficer && hasAllDocsVerified && (status === "DOCUMENT_VERIFICATION" || status === "ELIGIBILITY_CHECK") && (
            <Button
              size="sm"
              onClick={() => setIsEligibilityOpen(true)}
              className="gap-1.5"
            >
              <Calculator className="w-4 h-4" /> Run Eligibility
            </Button>
          )}

          {isOfficer && eligibility && status === "OFFICER_REVIEW" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setActiveTab("review");
              }}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Recommendation
            </Button>
          )}

          {isManager && status === "MANAGER_APPROVAL" && (
            <Button
              size="sm"
              variant="success"
              onClick={() => setIsApprovalOpen(true)}
              className="gap-1.5"
            >
              <Award className="w-4 h-4" /> Sanction / Approve
            </Button>
          )}

          {isManager && (status === "DISBURSEMENT_PENDING" || status === "APPROVED") && (
            <Button
              size="sm"
              variant="success"
              onClick={() => setIsDisbursementOpen(true)}
              className="gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" /> Disburse Funds
            </Button>
          )}
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm tracking-wider text-blue-400 font-bold">
                {application.applicationNumber}
              </span>
              <StatusBadge status={application.status} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {application.customerId?.fullName || application.userId?.name}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>{application.productId?.name}</span>
              <span>•</span>
              <span>Applied {formatDate(application.createdAt)}</span>
              {application.enquiryId && (
                <>
                  <span>•</span>
                  <span>Origin: Lead {application.enquiryId.enquiryNumber}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Requested Loan
              </span>
              <span className="text-xl font-bold text-white">
                {formatCurrency(application.requestedAmount)}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Tenure
              </span>
              <span className="text-xl font-bold text-white">
                {application.requestedTenureMonths} Mo
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Rate (APR)
              </span>
              <span className="text-xl font-bold text-emerald-400">
                {application.productId?.interestRateAnnual}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 9-Stage Controlled Workflow Progress Tracker */}
      <ApplicationTracker status={application.status} />

      {/* Rejection Alert if applicable */}
      {application.status === "REJECTED" && (
        <Alert variant="danger" title="Application Declined">
          <p className="font-semibold mt-0.5">
            Reason: {application.rejectionReason || "Criteria not met during credit assessment."}
          </p>
          <p className="text-slate-600 mt-1">Stage: {application.rejectionStage || "Credit Committee"}</p>
        </Alert>
      )}

      {/* Additional documents required alert */}
      {application.status === "ADDITIONAL_DOCUMENTS_REQUIRED" && (
        <Alert variant="warning" title="Document Re-upload Required">
          One or more uploaded documents were rejected by our credit verification team. Please inspect the Documents tab below to see the reviewer remarks and upload replacement documents.
        </Alert>
      )}

      {/* Tabs Navigation */}
      <Tabs tabs={tabsConfig} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Dossier Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Application Code</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {application.applicationNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Loan Product</span>
                    <span className="font-semibold text-slate-800">
                      {application.productId?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Loan Purpose</span>
                    <span className="font-semibold text-slate-800">
                      {application.purpose}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Gross Monthly Income</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(application.customerId?.employment?.monthlyIncome)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Current Debts</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(application.customerId?.employment?.existingEmiObligations)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Assigned Officer</span>
                    <span className="font-semibold text-slate-800">
                      {application.assignedOfficerId?.name || "Pending Assignment"}
                    </span>
                  </div>
                </div>

                {/* Progress Checklist */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Verification Stage-Gates
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">
                        1. Mandatory KYC & Income Proofs (5 required)
                      </span>
                      <span
                        className={`font-bold ${
                          hasAllDocsVerified ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {verifiedCount} of 5 Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">
                        2. Quantitative Financial Eligibility Check
                      </span>
                      <span
                        className={`font-bold ${
                          eligibility?.result === "ELIGIBLE"
                            ? "text-emerald-600"
                            : eligibility
                            ? "text-red-600"
                            : "text-slate-400"
                        }`}
                      >
                        {eligibility ? eligibility.result : "Pending Execution"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">
                        3. Credit Underwriter Formal Recommendation
                      </span>
                      <span
                        className={`font-bold ${
                          reviews.length > 0 ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {reviews.length > 0 ? reviews[0].recommendation : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">
                        4. Branch Manager Sanction Decree
                      </span>
                      <span
                        className={`font-bold ${
                          sanction ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {sanction ? sanction.sanctionNumber : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">
                        5. Final Fund Disbursement
                      </span>
                      <span
                        className={`font-bold ${
                          disbursement ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {disbursement ? "DISBURSED" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick Action Box */}
            <Card>
              <CardHeader>
                <CardTitle>Next Step Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-3">
                {status === "DOCUMENT_PENDING" && (
                  <p>
                    All 5 required documents must be submitted by the customer before credit verification can commence.
                  </p>
                )}
                {status === "DOCUMENT_VERIFICATION" && (
                  <p>
                    Credit officer must inspect and mark each document as Verified. If any document is defective, reject with reason.
                  </p>
                )}
                {status === "ADDITIONAL_DOCUMENTS_REQUIRED" && (
                  <p className="text-amber-800 font-medium">
                    Awaiting customer to upload replacement files for rejected proofs.
                  </p>
                )}
                {status === "OFFICER_REVIEW" && (
                  <p>
                    Eligibility passed! Credit officer should review the complete profile and submit formal approval recommendation.
                  </p>
                )}
                {status === "MANAGER_APPROVAL" && (
                  <p className="text-blue-700 font-medium">
                    Application is ready for Branch Manager executive sanction decision.
                  </p>
                )}
                {status === "DISBURSEMENT_PENDING" && (
                  <p className="text-emerald-700 font-medium">
                    Sanction issued! Manager or finance officer can execute fund transfer.
                  </p>
                )}
                {status === "DISBURSED" && (
                  <p className="text-emerald-700 font-bold">
                    Loan fully disbursed! Repayment schedule active.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Sanction Snapshot if available */}
            {sanction && (
              <Card className="border-emerald-200 bg-emerald-50/30">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" /> Active Sanction
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sanction Code:</span>
                    <span className="font-mono font-bold text-slate-800">{sanction.sanctionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approved Amount:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(sanction.approvedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approved Tenure:</span>
                    <span className="font-semibold text-slate-800">{sanction.approvedTenureMonths} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly EMI:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(sanction.monthlyEmi)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER DOSSIER */}
      {activeTab === "customer" && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Personal & Financial Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Demographic Coordinates
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Full Name</span>
                  <span className="font-semibold text-slate-800">{application.customerId?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Birth</span>
                  <span className="font-semibold text-slate-800">{formatDate(application.customerId?.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gender</span>
                  <span className="font-semibold text-slate-800">{application.customerId?.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mobile Phone</span>
                  <span className="font-semibold text-slate-800">{application.customerId?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email Address</span>
                  <span className="font-semibold text-slate-800">{application.customerId?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PAN Tax Identifier</span>
                  <span className="font-semibold text-slate-800 font-mono">{application.customerId?.panNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Identity Proof Ref</span>
                  <span className="font-semibold text-slate-800">{application.customerId?.idProofNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">City / State</span>
                  <span className="font-semibold text-slate-800">
                    {application.customerId?.address?.city}, {application.customerId?.address?.state}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Employment & Financial Capabilities
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Employment Category</span>
                  <span className="font-semibold text-slate-800">
                    {application.customerId?.employment?.employmentType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Employer Name</span>
                  <span className="font-semibold text-slate-800">
                    {application.customerId?.employment?.employerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Monthly Gross Salary</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(application.customerId?.employment?.monthlyIncome)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Existing Debt Obligations</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(application.customerId?.employment?.existingEmiObligations)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: LOAN TERMS */}
      {activeTab === "loan" && (
        <Card>
          <CardHeader>
            <CardTitle>Loan Product Parameters & Policy Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Product Name</span>
                <span className="font-semibold text-slate-800">{application.productId?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Product Code</span>
                <span className="font-mono font-semibold text-slate-800">{application.productId?.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Interest Rate (APR)</span>
                <span className="font-bold text-blue-600 text-sm">{application.productId?.interestRateAnnual}% p.a.</span>
              </div>
              <div>
                <span className="text-slate-400 block">Policy Max DTI</span>
                <span className="font-bold text-slate-800">{application.productId?.maxDtiPercent || 50}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Allowable Loan Range</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(application.productId?.minAmount)} - {formatCurrency(application.productId?.maxAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Allowable Tenure Range</span>
                <span className="font-semibold text-slate-800">
                  {application.productId?.minTenureMonths} to {application.productId?.maxTenureMonths} Months
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Minimum Income Threshold</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(application.productId?.minMonthlyIncome)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Processing Fee</span>
                <span className="font-semibold text-slate-800">
                  {application.productId?.processingFeePercent || 1.0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: DOCUMENTS MANAGEMENT & VERIFICATION */}
      {activeTab === "documents" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mandatory Document Verification Dossier</CardTitle>
              <p className="text-xs text-slate-500">
                All 5 proofs must achieve VERIFIED state before underwriting eligibility can proceed.
              </p>
            </div>
            {isCustomer && (
              <Button
                size="sm"
                onClick={() => {
                  setUploadDocType(null);
                  setIsUploadOpen(true);
                }}
                className="gap-1.5"
              >
                <UploadCloud className="w-4 h-4" /> Upload Document
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Required Proof</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewer Remarks</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRequiredDocTypes.map((type) => {
                  const doc = documents.find((d) => d.documentType === type);

                  return (
                    <TableRow key={type}>
                      <TableCell className="font-semibold text-xs">
                        {type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="text-xs">
                        {doc ? (
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-medium text-slate-800 truncate max-w-[160px]">
                              {doc.originalName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not yet submitted</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {doc ? formatDateTime(doc.uploadedAt) : "—"}
                      </TableCell>
                      <TableCell>
                        {doc ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              doc.status === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : doc.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {doc.status}
                          </span>
                        ) : (
                          <span className="inline-flex text-[11px] text-slate-400 font-medium">
                            PENDING
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs max-w-xs">
                        {doc?.verificationRemarks ? (
                          <span
                            className={
                              doc.status === "REJECTED"
                                ? "text-red-600 font-semibold"
                                : "text-slate-600"
                            }
                          >
                            {doc.verificationRemarks}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {doc && (
                            <a
                              href={documentApi.getDocumentUrl(doc._id)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-600"
                              title="Inspect File"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {isCustomer && (!doc || doc.status === "REJECTED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setUploadDocType(type);
                                setIsUploadOpen(true);
                              }}
                              className="text-xs h-7 px-2"
                            >
                              {doc?.status === "REJECTED" ? "Re-upload" : "Upload"}
                            </Button>
                          )}

                          {isOfficer && doc && doc.status !== "VERIFIED" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => setVerifyDocModal({ isOpen: true, doc })}
                              className="text-xs h-7 px-2"
                            >
                              Review & Verify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: ELIGIBILITY ENGINE */}
      {activeTab === "eligibility" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Automated Financial Eligibility Engine</CardTitle>
              <p className="text-xs text-slate-500">
                Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1). Evaluates dynamic DTI against product limit.
              </p>
            </div>
            {isOfficer && (
              <Button
                size="sm"
                onClick={() => setIsEligibilityOpen(true)}
                className="gap-1.5"
              >
                <Calculator className="w-4 h-4" /> Recalculate Assessment
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {eligibility ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">
                      Assessment Result
                    </span>
                    <span
                      className={`text-xl font-extrabold ${
                        eligibility.result === "ELIGIBLE"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {eligibility.result}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Evaluated by Officer</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {eligibility.assessedBy?.name || "Credit Underwriter"} ({formatDate(eligibility.assessedAt)})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-lg border">
                    <span className="text-slate-400 block uppercase text-[10px]">Monthly Income</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(eligibility.monthlyIncome)}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <span className="text-slate-400 block uppercase text-[10px]">Estimated EMI</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(eligibility.estimatedEmi)}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <span className="text-slate-400 block uppercase text-[10px]">Total Monthly Debt</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(eligibility.totalMonthlyObligations)}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <span className="text-slate-400 block uppercase text-[10px]">Debt-to-Income (DTI)</span>
                    <span
                      className={`text-sm font-extrabold ${
                        eligibility.debtToIncomeRatio <= eligibility.maxDtiAllowed
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {eligibility.debtToIncomeRatio}%
                      <span className="text-[10px] text-slate-400 block font-normal">
                        Max Allowed: {eligibility.maxDtiAllowed}%
                      </span>
                    </span>
                  </div>
                </div>

                {/* Rule Breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Deterministic Policy Rule Checklist
                  </h4>
                  <div className="space-y-2">
                    {eligibility.ruleResults?.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-3 rounded-lg border bg-slate-50/50"
                      >
                        <div className="flex items-center gap-2">
                          {r.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-semibold text-slate-800">{r.rule}</span>
                          <span className="text-slate-500 text-[11px]">— {r.description}</span>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            r.passed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.passed ? "COMPLIANT" : "BREACHED"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                Eligibility engine has not been triggered yet. All 5 documents must be verified first.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 6: OFFICER REVIEW & RECOMMENDATION */}
      {activeTab === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Underwriting Appraisal & Officer Recommendation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-slate-50 rounded-xl border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {rev.recommendation?.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Submitted {formatDateTime(rev.reviewedAt)} by {rev.officerId?.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border font-mono">
                      "{rev.creditRemarks}"
                    </p>
                    <div className="text-[11px] text-slate-500">
                      Credit Bureau Risk Score: <strong>{rev.riskScore} / 900</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : isOfficer ? (
              <OfficerRecommendationForm
                applicationId={application._id}
                onSuccess={fetchApplicationData}
              />
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                Credit officer appraisal has not been submitted yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 7: MANAGER APPROVAL */}
      {activeTab === "approval" && (
        <Card>
          <CardHeader>
            <CardTitle>Executive Credit Approval & Dual-Control Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sanction ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Loan Approved & Sanctioned
                </span>
                <p className="text-slate-700">
                  Approved By: <strong>{sanction.approvedBy?.name}</strong> on {formatDate(sanction.sanctionDate)}
                </p>
                <p className="text-slate-700">Remarks: "{sanction.approvalRemarks}"</p>
              </div>
            ) : isManager && status === "MANAGER_APPROVAL" ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  You are reviewing this application with dual-control executive authority. Ensure verified proofs and eligibility ratios are fully compliant.
                </p>
                <Button variant="success" onClick={() => setIsApprovalOpen(true)}>
                  Open Executive Approval Panel
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                Awaiting previous underwriting stages to complete before manager approval.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 8: SANCTION LETTER */}
      {activeTab === "sanction" && (
        <Card>
          <CardHeader>
            <CardTitle>Official Loan Sanction Letter</CardTitle>
          </CardHeader>
          <CardContent>
            {sanction ? (
              <div className="p-6 bg-white rounded-xl border border-slate-300 shadow-sm space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <span className="text-base font-extrabold text-[#0F172A] tracking-tight">
                      LOANFLOW FINANCIAL SERVICES
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase">Sanction & Commitment Letter</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-blue-600">{sanction.sanctionNumber}</span>
                    <p className="text-[10px] text-slate-400">Date: {formatDate(sanction.sanctionDate)}</p>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-slate-700">
                  <p>
                    Dear <strong>{application.customerId?.fullName}</strong>,
                  </p>
                  <p>
                    We are pleased to inform you that your request for a{" "}
                    <strong>{application.productId?.name}</strong> has been officially sanctioned under the following terms:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Sanctioned Amount</span>
                    <span className="text-base font-bold text-emerald-700">
                      {formatCurrency(sanction.approvedAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Sanctioned Tenure</span>
                    <span className="text-base font-bold text-slate-800">
                      {sanction.approvedTenureMonths} Months
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Annual Interest Rate</span>
                    <span className="text-base font-bold text-blue-600">
                      {sanction.interestRateAnnual}% p.a.
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Estimated Monthly Installment</span>
                    <span className="text-base font-bold text-slate-800">
                      {formatCurrency(sanction.monthlyEmi)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px]">Terms & Conditions:</span>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    {sanction.termsAndConditions?.map((term, i) => (
                      <li key={i}>{term}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                Sanction letter will be generated automatically upon branch manager approval.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 9: DISBURSEMENT */}
      {activeTab === "disbursement" && (
        <Card>
          <CardHeader>
            <CardTitle>Disbursement Execution & Fund Settlement</CardTitle>
          </CardHeader>
          <CardContent>
            {disbursement ? (
              <div className="p-6 bg-emerald-50/50 rounded-xl border border-emerald-200 max-w-xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-950">Funds Disbursed</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-emerald-800">
                    {disbursement.disbursementNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Disbursed Amount</span>
                    <span className="text-base font-bold text-emerald-800">
                      {formatCurrency(disbursement.disbursedAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Method</span>
                    <span className="font-semibold text-slate-800">{disbursement.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Transaction Reference / UTR</span>
                    <span className="font-mono font-bold text-slate-800">{disbursement.bankReferenceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Settlement Date</span>
                    <span className="font-semibold text-slate-800">{formatDate(disbursement.disbursementDate)}</span>
                  </div>
                </div>
              </div>
            ) : (status === "DISBURSEMENT_PENDING" || status === "APPROVED") && isManager ? (
              <div className="text-center p-6 space-y-4">
                <p className="text-xs text-slate-600">
                  Sanction is active. Manager or finance officer can execute direct fund disbursement now.
                </p>
                <Button variant="success" onClick={() => setIsDisbursementOpen(true)} className="gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Trigger Fund Disbursement
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                Disbursement can only occur following official sanction offer acceptance.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 10: AUDIT TIMELINE */}
      {activeTab === "timeline" && (
        <Card>
          <CardHeader>
            <CardTitle>Immutable Lifecycle Audit Trail</CardTitle>
            <p className="text-xs text-slate-500">
              Chronological log of every state transition, actor role, timestamp, and justification.
            </p>
          </CardHeader>
          <CardContent>
            <TimelineView history={history} />
          </CardContent>
        </Card>
      )}

      {/* Dynamic Action Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        applicationId={application._id}
        preselectedType={uploadDocType}
        onSuccess={fetchApplicationData}
      />

      <DocumentVerificationModal
        isOpen={verifyDocModal.isOpen}
        onClose={() => setVerifyDocModal({ isOpen: false, doc: null })}
        document={verifyDocModal.doc}
        onSuccess={fetchApplicationData}
      />

      <EligibilityModal
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
        application={application}
        onSuccess={fetchApplicationData}
      />

      <ApprovalModal
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        application={application}
        onSuccess={fetchApplicationData}
      />

      <DisbursementModal
        isOpen={isDisbursementOpen}
        onClose={() => setIsDisbursementOpen(false)}
        application={application}
        sanction={sanction}
        onSuccess={fetchApplicationData}
      />
    </div>
  );
};

// Subcomponent: Officer Recommendation Form
const OfficerRecommendationForm = ({ applicationId, onSuccess }) => {
  const { showToast } = useNotification();
  const [remarks, setRemarks] = useState(
    "Verified all submitted identity and income documents against official databases. CIBIL score is robust and DTI ratio is within policy bounds. Strongly recommend approval."
  );
  const [score, setScore] = useState(780);
  const [decision, setDecision] = useState("APPROVE");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (decision === "APPROVE") {
        await applicationApi.recommendApproval(applicationId, {
          creditRemarks: remarks,
          riskScore: Number(score),
        });
        showToast("Approval recommendation forwarded to branch manager", "success");
      } else {
        await applicationApi.recommendRejection(applicationId, {
          reason: remarks,
          riskScore: Number(score),
        });
        showToast("Rejection recorded", "info");
      }
      onSuccess();
    } catch (err) {
      showToast(err.message || "Failed to submit recommendation", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border space-y-4 max-w-xl">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
        Submit Underwriting Recommendation
      </h4>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDecision("APPROVE")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
            decision === "APPROVE"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-600"
          }`}
        >
          Recommend Approval
        </button>
        <button
          type="button"
          onClick={() => setDecision("REJECT")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
            decision === "REJECT"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-slate-600"
          }`}
        >
          Recommend Rejection
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Credit Risk Score (300 - 900)
        </label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          min={300}
          max={900}
          className="w-full h-9 rounded-lg border px-3 text-xs"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Credit Appraisal Remarks
        </label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full rounded-lg border p-2.5 text-xs text-slate-800"
          required
        />
      </div>

      <Button type="submit" isLoading={isLoading} variant={decision === "APPROVE" ? "primary" : "danger"}>
        Submit Appraisal to Manager
      </Button>
    </form>
  );
};
