import express from "express";
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
} from "../controllers/applicationController.js";
import {
  getDocuments,
  uploadDocumentRecord,
} from "../controllers/documentController.js";
import {
  runEligibility,
  getEligibility,
} from "../controllers/eligibilityController.js";
import {
  recommendApproval,
  recommendRejection,
  requestAdditionalDocuments,
  getReviews,
} from "../controllers/reviewController.js";
import {
  approveApplication,
  rejectApplication,
} from "../controllers/approvalController.js";
import { getSanctionByApplicationId } from "../controllers/sanctionController.js";
import {
  getDisbursementByApplicationId,
  processDisbursement,
} from "../controllers/disbursementController.js";
import { getApplicationHistory } from "../controllers/historyController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { uploadDocument } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Base application routes
router.get("/", requireAuth, getApplications);
router.post("/", requireAuth, createApplication);
router.get("/:id", requireAuth, getApplicationById);
router.put("/:id", requireAuth, requireRole("LOAN_OFFICER", "MANAGER", "ADMIN"), updateApplication);

// Document management on application
router.get("/:id/documents", requireAuth, getDocuments);
router.post(
  "/:id/documents",
  requireAuth,
  uploadDocument.single("file"),
  uploadDocumentRecord
);

// Eligibility Assessment
router.post("/:id/eligibility", requireAuth, requireRole("LOAN_OFFICER", "MANAGER", "ADMIN"), runEligibility);
router.get("/:id/eligibility", requireAuth, getEligibility);

// Underwriting & Officer Review
router.get("/:id/reviews", requireAuth, getReviews);
router.post("/:id/recommend", requireAuth, requireRole("LOAN_OFFICER", "ADMIN"), recommendApproval);
router.post("/:id/reject-officer", requireAuth, requireRole("LOAN_OFFICER", "ADMIN"), recommendRejection);
router.post("/:id/request-documents", requireAuth, requireRole("LOAN_OFFICER", "ADMIN"), requestAdditionalDocuments);

// Credit Committee / Manager Approval
router.post("/:id/approve", requireAuth, requireRole("MANAGER", "ADMIN"), approveApplication);
router.post("/:id/reject", requireAuth, requireRole("MANAGER", "ADMIN"), rejectApplication);

// Sanction & Disbursement
router.get("/:id/sanction", requireAuth, getSanctionByApplicationId);
router.post("/:id/sanction", requireAuth, requireRole("MANAGER", "ADMIN"), approveApplication); // alias for sanction creation
router.get("/:id/disbursement", requireAuth, getDisbursementByApplicationId);
router.post("/:id/disburse", requireAuth, requireRole("MANAGER", "ADMIN"), processDisbursement);

// History / Audit trail
router.get("/:id/history", requireAuth, getApplicationHistory);

export default router;
