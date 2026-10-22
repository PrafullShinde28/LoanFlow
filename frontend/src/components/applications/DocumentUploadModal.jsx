import React, { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { UploadCloud, FileText } from "lucide-react";
import { documentApi } from "../../api/documentApi";
import { useNotification } from "../../context/NotificationContext";

export const DocumentUploadModal = ({
  isOpen,
  onClose,
  applicationId,
  preselectedType,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [docType, setDocType] = useState(preselectedType || "IDENTITY_PROOF");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast("Please choose a file to upload", "warning");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("documentType", preselectedType || docType);
      formData.append("title", title || (preselectedType || docType).replace("_", " "));
      formData.append("file", file);

      const res = await documentApi.uploadDocument(applicationId, formData);
      if (res.success) {
        showToast("Document uploaded successfully", "success");
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || "Failed to upload document", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={preselectedType ? `Re-upload ${preselectedType.replace("_", " ")}` : "Upload Verification Document"}
      description="Upload official identity, income, or bank records (PDF, PNG, JPG up to 5MB)."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!preselectedType && (
          <Select
            label="Document Category"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            <option value="IDENTITY_PROOF">Identity Proof (Aadhaar / Passport / PAN)</option>
            <option value="ADDRESS_PROOF">Address Proof (Utility Bill / Agreement)</option>
            <option value="INCOME_PROOF">Income Proof (Salary Slips / Form 16 / ITR)</option>
            <option value="BANK_STATEMENT">Bank Statement (Last 6 Months)</option>
            <option value="EMPLOYMENT_PROOF">Employment Proof (ID Card / Offer Letter)</option>
          </Select>
        )}

        <Input
          label="Document Label / Title (Optional)"
          placeholder="e.g. Aadhaar Card Front & Back"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
          <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700 mb-1">
            Click to select or drag and drop file here
          </p>
          <p className="text-[11px] text-slate-400 mb-3">
            Supported formats: PDF, JPG, PNG (Max 5MB)
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            id="file-upload"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label
            htmlFor="file-upload"
            className="inline-flex cursor-pointer text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all"
          >
            Choose File
          </label>
          {file && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 max-w-sm mx-auto">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{file.name}</span> ({(file.size / 1024).toFixed(0)} KB)
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isUploading} disabled={!file}>
            Upload Document
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
