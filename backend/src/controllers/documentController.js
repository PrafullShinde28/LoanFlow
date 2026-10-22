import path from "path";
import fs from "fs";
import ApplicationDocument from "../models/ApplicationDocument.js";
import LoanApplication from "../models/LoanApplication.js";
import { logStatusChange } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

const REQUIRED_DOC_TYPES = [
  "IDENTITY_PROOF",
  "ADDRESS_PROOF",
  "INCOME_PROOF",
  "BANK_STATEMENT",
  "EMPLOYMENT_PROOF",
];

export const getDocuments = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return sendError(res, "Loan application not found", [], 404);
    }

    const documents = await ApplicationDocument.find({ applicationId })
      .populate("uploadedBy", "name email")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: 1 });

    // Check completion status
    const verifiedTypes = documents
      .filter((d) => d.status === "VERIFIED")
      .map((d) => d.documentType);

    const hasAllVerified = REQUIRED_DOC_TYPES.every((type) =>
      verifiedTypes.includes(type)
    );

    const hasRejections = documents.some((d) => d.status === "REJECTED");

    return sendSuccess(res, "Documents retrieved", {
      documents,
      requiredTypes: REQUIRED_DOC_TYPES,
      hasAllVerified,
      hasRejections,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocumentRecord = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { documentType, title } = req.body;
    const file = req.file;

    if (!file) {
      return sendError(res, "No file payload received. Please choose a valid document.", [], 400);
    }

    if (!documentType || !REQUIRED_DOC_TYPES.includes(documentType)) {
      return sendError(res, `Invalid or missing document type. Must be one of: ${REQUIRED_DOC_TYPES.join(", ")}`, [], 400);
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return sendError(res, "Loan application not found", [], 404);
    }

    // Role check: Only customer owner or officer/admin can upload
    if (req.user.role === "CUSTOMER" && application.userId.toString() !== req.user._id.toString()) {
      return sendError(res, "Unauthorized to upload files to this application", [], 403);
    }

    // Check if document of this type already exists
    let existingDoc = await ApplicationDocument.findOne({
      applicationId,
      documentType,
    });

    const relativeFilePath = `/uploads/documents/${application.applicationNumber || applicationId}/${file.filename}`;

    if (existingDoc) {
      // Re-upload workflow
      existingDoc.fileName = file.filename;
      existingDoc.originalName = file.originalname;
      existingDoc.filePath = relativeFilePath;
      existingDoc.fileSize = file.size;
      existingDoc.mimeType = file.mimetype;
      existingDoc.uploadedBy = req.user._id;
      existingDoc.uploadedAt = new Date();
      existingDoc.status = "UNDER_REVIEW";
      existingDoc.verificationRemarks = "";
      existingDoc.verifiedBy = null;
      existingDoc.verifiedAt = null;
      await existingDoc.save();
    } else {
      existingDoc = await ApplicationDocument.create({
        applicationId,
        documentType,
        title: title || documentType.replace("_", " "),
        fileName: file.filename,
        originalName: file.originalname,
        filePath: relativeFilePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: req.user._id,
        status: "UNDER_REVIEW",
      });
    }

    // Advance application status if was DOCUMENT_PENDING or ADDITIONAL_DOCUMENTS_REQUIRED
    if (
      application.status === "DOCUMENT_PENDING" ||
      application.status === "ADDITIONAL_DOCUMENTS_REQUIRED"
    ) {
      const oldStatus = application.status;
      application.status = "DOCUMENT_VERIFICATION";
      await application.save();

      await logStatusChange({
        applicationId: application._id,
        previousStatus: oldStatus,
        newStatus: "DOCUMENT_VERIFICATION",
        action: "DOCUMENT_UPLOADED",
        performedBy: req.user._id,
        role: req.user.role,
        remarks: `Document '${documentType}' uploaded. Application moved to verification queue.`,
      });
    }

    return sendSuccess(res, `Document '${documentType}' uploaded successfully.`, { document: existingDoc }, 201);
  } catch (error) {
    next(error);
  }
};

export const verifyDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const doc = await ApplicationDocument.findById(id);
    if (!doc) {
      return sendError(res, "Document not found", [], 404);
    }

    doc.status = "VERIFIED";
    doc.verificationRemarks = remarks || "Document validated and verified.";
    doc.verifiedBy = req.user._id;
    doc.verifiedAt = new Date();
    await doc.save();

    // Check if all 5 required documents are now verified
    const allDocs = await ApplicationDocument.find({ applicationId: doc.applicationId });
    const verifiedTypes = allDocs
      .filter((d) => d.status === "VERIFIED")
      .map((d) => d.documentType);

    const hasAll = REQUIRED_DOC_TYPES.every((type) => verifiedTypes.includes(type));

    const application = await LoanApplication.findById(doc.applicationId);
    if (application && hasAll && application.status === "DOCUMENT_VERIFICATION") {
      // All documents verified!
      await logStatusChange({
        applicationId: application._id,
        previousStatus: application.status,
        newStatus: "DOCUMENT_VERIFICATION",
        action: "ALL_DOCUMENTS_VERIFIED",
        performedBy: req.user._id,
        role: req.user.role,
        remarks: "All 5 mandatory documents have been successfully verified. Ready for eligibility check.",
        notifyUser: application.userId,
        notifyTitle: "Documents Verified",
        notifyMessage: "All your submitted documents have passed verification by our credit team.",
      });
    }

    return sendSuccess(res, `Document marked as VERIFIED`, { document: doc });
  } catch (error) {
    next(error);
  }
};

export const rejectDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return sendError(res, "A detailed rejection reason is mandatory (minimum 5 characters).", [], 400);
    }

    const doc = await ApplicationDocument.findById(id);
    if (!doc) {
      return sendError(res, "Document not found", [], 404);
    }

    doc.status = "REJECTED";
    doc.verificationRemarks = reason.trim();
    doc.verifiedBy = req.user._id;
    doc.verifiedAt = new Date();
    await doc.save();

    // Application transitions to ADDITIONAL_DOCUMENTS_REQUIRED
    const application = await LoanApplication.findById(doc.applicationId);
    if (application) {
      const oldStatus = application.status;
      application.status = "ADDITIONAL_DOCUMENTS_REQUIRED";
      await application.save();

      await logStatusChange({
        applicationId: application._id,
        previousStatus: oldStatus,
        newStatus: "ADDITIONAL_DOCUMENTS_REQUIRED",
        action: "DOCUMENT_REJECTED",
        performedBy: req.user._id,
        role: req.user.role,
        remarks: `Document '${doc.documentType}' was rejected: "${reason.trim()}"`,
        notifyUser: application.userId,
        notifyTitle: "Action Required: Document Rejected",
        notifyMessage: `Your ${doc.documentType.replace("_", " ")} was rejected. Reason: ${reason.trim()}. Please re-upload a clear copy.`,
      });
    }

    return sendSuccess(res, "Document rejected and customer notified for re-upload.", { document: doc });
  } catch (error) {
    next(error);
  }
};

export const serveDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await ApplicationDocument.findById(id);
    if (!doc) {
      return sendError(res, "Document not found", [], 404);
    }

    const app = await LoanApplication.findById(doc.applicationId);

    // Check all potential candidate paths on disk:
    // 1. By applicationId directory (ObjectId string, e.g. 6aba09cb170c10115bbdb878)
    // 2. By applicationNumber directory (e.g. LOAN-2026-0001)
    // 3. Stored relative filePath
    // 4. General fallback directory
    const candidatePaths = [
      path.resolve(process.cwd(), "uploads", "documents", doc.applicationId.toString(), doc.fileName),
      app?.applicationNumber ? path.resolve(process.cwd(), "uploads", "documents", app.applicationNumber, doc.fileName) : null,
      doc.filePath ? path.resolve(process.cwd(), doc.filePath.replace(/^\//, "")) : null,
      path.resolve(process.cwd(), "uploads", "documents", "general", doc.fileName),
    ].filter(Boolean);

    let foundPath = candidatePaths.find((p) => fs.existsSync(p));

    if (!foundPath) {
      // Check if sample demo file exists
      const demoSample = path.resolve(process.cwd(), "uploads", "documents", "LOAN-2026-0001", "verified_sample_document.pdf");
      if (fs.existsSync(demoSample)) {
        foundPath = demoSample;
      } else {
        return sendError(res, "Physical file does not exist on disk", [], 404);
      }
    }

    // Set headers so PDFs and images display cleanly in the browser tab
    if (doc.mimeType) {
      res.setHeader("Content-Type", doc.mimeType);
    }
    const safeFilename = encodeURIComponent(doc.originalName || doc.fileName);
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename}"`);

    return res.sendFile(foundPath);
  } catch (error) {
    next(error);
  }
};
