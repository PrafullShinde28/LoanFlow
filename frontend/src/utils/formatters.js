export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const STATUS_CONFIG = {
  APPLICATION_CREATED: {
    label: "Application Created",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
  },
  DOCUMENT_PENDING: {
    label: "Documents Pending",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  DOCUMENT_VERIFICATION: {
    label: "Verification In-Progress",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  ADDITIONAL_DOCUMENTS_REQUIRED: {
    label: "Re-upload Required",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    dotColor: "bg-orange-500",
  },
  ELIGIBILITY_CHECK: {
    label: "Eligibility Assessment",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
  },
  OFFICER_REVIEW: {
    label: "Officer Underwriting",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotColor: "bg-indigo-500",
  },
  MANAGER_APPROVAL: {
    label: "Manager Approval",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-300",
    dotColor: "bg-blue-600",
  },
  APPROVED: {
    label: "Approved",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  SANCTIONED: {
    label: "Sanction Issued",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    dotColor: "bg-teal-500",
  },
  DISBURSEMENT_PENDING: {
    label: "Disbursement Pending",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
    dotColor: "bg-amber-600",
  },
  DISBURSED: {
    label: "Disbursed",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dotColor: "bg-emerald-600",
  },
  REJECTED: {
    label: "Rejected",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
  },
};

export const getStatusMeta = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: status?.replace(/_/g, " ") || "Unknown",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      dotColor: "bg-slate-400",
    }
  );
};
