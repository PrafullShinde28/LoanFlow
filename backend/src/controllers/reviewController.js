import ApplicationReview from "../models/ApplicationReview.js";
import LoanApplication from "../models/LoanApplication.js";
import EligibilityAssessment from "../models/EligibilityAssessment.js";
import { logStatusChange } from "../services/auditService.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const recommendApproval = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { creditRemarks, riskScore = 750 } = req.body;

    if (!creditRemarks || creditRemarks.trim().length < 5) {
      return sendError(res, "Credit appraisal remarks are required (minimum 5 characters).", [], 400);
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return sendError(res, "Application not found", [], 404);
    }

    // Guardrail: Eligibility must exist
    const eligibility = await EligibilityAssessment.findOne({ applicationId });
    if (!eligibility) {
      return sendError(
        res,
        "Cannot submit recommendation before executing eligibility assessment.",
        [],
        422
      );
    }

    const review = await ApplicationReview.create({
      applicationId,
      officerId: req.user._id,
      recommendation: "RECOMMEND_APPROVAL",
      creditRemarks: creditRemarks.trim(),
      riskScore: Number(riskScore) || 750,
    });

    const oldStatus = application.status;
    application.status = "MANAGER_APPROVAL";
    application.assignedOfficerId = req.user._id;
    await application.save();

    await logStatusChange({
      applicationId: application._id,
      previousStatus: oldStatus,
      newStatus: "MANAGER_APPROVAL",
      action: "OFFICER_RECOMMENDED_APPROVAL",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Officer recommended approval. Score: ${riskScore}. Notes: "${creditRemarks.trim()}"`,
      notifyUser: application.userId,
      notifyTitle: "Recommended for Approval",
      notifyMessage: "Your loan application has been favorably recommended and escalated for Branch Manager sanction.",
    });

    return sendSuccess(
      res,
      "Approval recommendation submitted. Application moved to Manager Approval queue.",
      { review, application }
    );
  } catch (error) {
    next(error);
  }
};

export const recommendRejection = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { reason, riskScore = 500 } = req.body;

    if (!reason || reason.trim().length < 5) {
      return sendError(res, "A detailed rejection reason is mandatory (minimum 5 characters).", [], 400);
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return sendError(res, "Application not found", [], 404);
    }

    const review = await ApplicationReview.create({
      applicationId,
      officerId: req.user._id,
      recommendation: "RECOMMEND_REJECTION",
      creditRemarks: reason.trim(),
      riskScore: Number(riskScore) || 500,
    });

    const oldStatus = application.status;
    application.status = "REJECTED";
    application.rejectionReason = reason.trim();
    application.rejectionStage = "OFFICER_REVIEW";
    application.rejectedBy = req.user._id;
    await application.save();

    await logStatusChange({
      applicationId: application._id,
      previousStatus: oldStatus,
      newStatus: "REJECTED",
      action: "OFFICER_REJECTED",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Officer rejected application. Reason: "${reason.trim()}"`,
      notifyUser: application.userId,
      notifyTitle: "Application Rejected",
      notifyMessage: `Your loan application has been declined. Reason: ${reason.trim()}`,
    });

    return sendSuccess(res, "Application rejected by loan officer.", { review, application });
  } catch (error) {
    next(error);
  }
};

export const requestAdditionalDocuments = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { remarks } = req.body;

    if (!remarks || remarks.trim().length < 5) {
      return sendError(res, "Please specify which additional documents or clarifications are required.", [], 400);
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return sendError(res, "Application not found", [], 404);
    }

    const oldStatus = application.status;
    application.status = "ADDITIONAL_DOCUMENTS_REQUIRED";
    await application.save();

    await logStatusChange({
      applicationId: application._id,
      previousStatus: oldStatus,
      newStatus: "ADDITIONAL_DOCUMENTS_REQUIRED",
      action: "OFFICER_REQUESTED_DOCUMENTS",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Officer requested additional information: "${remarks.trim()}"`,
      notifyUser: application.userId,
      notifyTitle: "Additional Documents Required",
      notifyMessage: `Our underwriter requires additional documents: ${remarks.trim()}`,
    });

    return sendSuccess(res, "Application marked for additional documents.", { application });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const reviews = await ApplicationReview.find({ applicationId })
      .populate("officerId", "name email")
      .sort({ reviewedAt: -1 });

    return sendSuccess(res, "Reviews retrieved", { reviews });
  } catch (error) {
    next(error);
  }
};
