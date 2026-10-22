import React, { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { documentApi } from "../../api/documentApi";
import { useNotification } from "../../context/NotificationContext";
import { Check, XCircle, ExternalLink, FileText } from "lucide-react";

export const DocumentVerificationModal = ({
  isOpen,
  onClose,
  document,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [mode, setMode] = useState("VERIFY"); // "VERIFY" or "REJECT"
  const [isLoading, setIsLoading] = useState(false);

  if (!document) return null;

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      const res = await documentApi.verifyDocument(document._id, remarks);
      if (res.success) {
        showToast(`Document ${document.documentType} verified successfully`, "success");
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || "Failed to verify document", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      showToast("Please provide a specific rejection reason (min 5 chars)", "warning");
      return;
    }

    try {
      setIsLoading(true);
      const res = await documentApi.rejectDocument(document._id, rejectionReason);
      if (res.success) {
        showToast("Document rejected and customer notified", "info");
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || "Failed to reject document", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fileUrl = documentApi.getDocumentUrl(document._id);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Proof: ${document.title || document.documentType}`}
      description="Inspect uploaded document file and issue underwriter verification."
    >
      <div className="space-y-4">
        {/* Document Metadata card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">File Name:</span>
            <span className="font-semibold text-slate-800 truncate max-w-xs">{document.originalName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type:</span>
            <span className="font-semibold text-slate-800">{document.documentType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">File Size:</span>
            <span className="font-semibold text-slate-800">{(document.fileSize / 1024).toFixed(0)} KB</span>
          </div>
          <div className="pt-2 flex justify-end">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:border-blue-300 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open / Download File
            </a>
          </div>
        </div>

        {/* Action Selector */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("VERIFY")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "VERIFY"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Check className="w-3.5 h-3.5" /> Approve / Verify
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
            <XCircle className="w-3.5 h-3.5" /> Reject with Reason
          </button>
        </div>

        {mode === "VERIFY" ? (
          <div className="space-y-3">
            <Input
              label="Verification Notes (Optional)"
              placeholder="e.g. Verified with PAN / Aadhaar portal."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleVerify}
                isLoading={isLoading}
              >
                Mark Document Verified
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-red-600">
                Mandatory Rejection Reason *
              </label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-xl border border-red-200 bg-red-50/20 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Explain clearly why this document is unacceptable (e.g. Blurry scan, pages missing, expired document)..."
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
                Reject Document & Request Re-upload
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
