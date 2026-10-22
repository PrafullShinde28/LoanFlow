import React, { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { applicationApi } from "../../api/applicationApi";
import { formatCurrency } from "../../utils/formatters";
import { useNotification } from "../../context/NotificationContext";
import { CheckCheck, XCircle, Award } from "lucide-react";

export const ApprovalModal = ({
  isOpen,
  onClose,
  application,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [sanctionedAmount, setSanctionedAmount] = useState(
    application?.requestedAmount || 0
  );
  const [sanctionedTenure, setSanctionedTenure] = useState(
    application?.requestedTenureMonths || 36
  );
  const [approvalRemarks, setApprovalRemarks] = useState(
    "Approved based on pristine KYC records, confirmed employment, and passing DTI eligibility."
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [mode, setMode] = useState("APPROVE"); // "APPROVE" or "REJECT"
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const res = await applicationApi.approveApplication(application._id, {
        sanctionedAmount: Number(sanctionedAmount),
        sanctionedTenure: Number(sanctionedTenure),
        approvalRemarks,
      });

      if (res.success) {
        showToast("Application approved and formal Sanction generated!", "success");
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || "Approval failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      showToast("Please provide a comprehensive rejection justification", "warning");
      return;
    }

    try {
      setIsLoading(true);
      const res = await applicationApi.rejectApplication(application._id, {
        reason: rejectionReason,
      });

      if (res.success) {
        showToast("Application rejected by manager", "info");
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || "Rejection failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Credit Committee / Manager Final Decision"
      description="Issue official sanction decree or record executive rejection."
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Toggle Mode */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("APPROVE")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "APPROVE"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" /> Sanction & Approve Loan
          </button>
          <button
            type="button"
            onClick={() => setMode("REJECT")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "REJECT"
                ? "bg-white text-red-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <XCircle className="w-4 h-4 text-red-600" /> Decline / Reject Application
          </button>
        </div>

        {mode === "APPROVE" ? (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
              <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Dual-Control Compliance Check</p>
                <p className="text-blue-700 mt-0.5">
                  Approving will automatically issue a formal Sanction record (SANC-2026-XXXX) and move the application directly to fund disbursement queue.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Sanctioned Loan Amount (₹)"
                type="number"
                value={sanctionedAmount}
                onChange={(e) => setSanctionedAmount(e.target.value)}
                helperText={`Requested: ${formatCurrency(application?.requestedAmount)}`}
              />
              <Input
                label="Approved Tenure (Months)"
                type="number"
                value={sanctionedTenure}
                onChange={(e) => setSanctionedTenure(e.target.value)}
                helperText={`Requested: ${application?.requestedTenureMonths} months`}
              />
            </div>

            <Input
              label="Manager Sanction Remarks"
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleApprove}
                isLoading={isLoading}
              >
                Confirm Sanction & Approve
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-red-600">
                Executive Rejection Reason *
              </label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl border border-red-200 bg-red-50/20 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="State specific credit rationale for loan denial..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={isLoading}
                disabled={!rejectionReason || rejectionReason.trim().length < 5}
              >
                Reject Application
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
