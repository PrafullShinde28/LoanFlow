import LoanApplication from "../models/LoanApplication.js";
import ApplicationDocument from "../models/ApplicationDocument.js";
import EligibilityAssessment from "../models/EligibilityAssessment.js";
import ApplicationReview from "../models/ApplicationReview.js";
import Sanction from "../models/Sanction.js";
import LoanProduct from "../models/LoanProduct.js";
import { generateSanctionNumber } from "../utils/idGenerators.js";
import { calculateEmi } from "../services/eligibilityEngine.js";
import { logStatusChange } from "../services/auditService.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

const REQUIRED_DOC_TYPES = [
  "IDENTITY_PROOF",
  "ADDRESS_PROOF",
  "INCOME_PROOF",
  "BANK_STATEMENT",
  "EMPLOYMENT_PROOF",
];

export const approveApplication = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { sanctionedAmount, sanctionedTenure, approvalRemarks } = req.body;

    const application = await LoanApplication.findById(applicationId)
      .populate("customerId")
      .populate("productId");

    if (!application) {
      return sendError(res, "Loan application not found", [], 404);
    }

    // 1. Guardrail: Must have all 5 documents verified
    const docs = await ApplicationDocument.find({ applicationId });
    const verifiedTypes = docs.filter((d) => d.status === "VERIFIED").map((d) => d.documentType);
    const missingDocs = REQUIRED_DOC_TYPES.filter((type) => !verifiedTypes.includes(type));
    if (missingDocs.length > 0) {
      return sendError(
        res,
        `Cannot approve application. Required documents not verified: ${missingDocs.join(", ")}`,
        [],
        422
      );
    }

    // 2. Guardrail: Must have eligibility assessment
    const eligibility = await EligibilityAssessment.findOne({ applicationId });
    if (!eligibility) {
      return sendError(res, "Cannot approve application. Eligibility assessment has not been conducted.", [], 422);
    }

    // 3. Guardrail: Must have officer recommendation
    const officerReview = await ApplicationReview.findOne({
      applicationId,
      recommendation: "RECOMMEND_APPROVAL",
    });
    if (!officerReview) {
      return sendError(res, "Cannot approve application. Missing formal Loan Officer recommendation for approval.", [], 422);
    }

    const finalAmount = Number(sanctionedAmount) || application.requestedAmount;
    const finalTenure = Number(sanctionedTenure) || application.requestedTenureMonths;
    const product = application.productId;

    // Validate boundaries
    if (finalAmount < product.minAmount || finalAmount > product.maxAmount) {
      return sendError(
        res,
        `Sanctioned amount ₹${finalAmount} is out of allowable product bounds (₹${product.minAmount} - ₹${product.maxAmount}).`,
        [],
        400
      );
    }

    const emi = calculateEmi(finalAmount, product.interestRateAnnual, finalTenure);
    const sanctionNumber = await generateSanctionNumber();

    // 60 days expiry from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 60);

    // Create Sanction record
    const sanction = await Sanction.create({
      sanctionNumber,
      applicationId: application._id,
      customerId: application.customerId._id,
      approvedAmount: finalAmount,
      approvedTenureMonths: finalTenure,
      interestRateAnnual: product.interestRateAnnual,
      monthlyEmi: emi,
      expiryDate,
      approvedBy: req.user._id,
      approvalRemarks: approvalRemarks || "Approved by credit committee.",
      termsAndConditions: [
        "Pre-payment penalty of 2% applicable if closed within 12 months.",
        "Monthly installment auto-debit on the 5th of every month.",
        "Loan disbursed directly to customer verified bank account.",
      ],
    });

    const oldStatus = application.status;
    application.status = "DISBURSEMENT_PENDING";
    application.assignedManagerId = req.user._id;
    await application.save();

    await logStatusChange({
      applicationId: application._id,
      previousStatus: oldStatus,
      newStatus: "APPROVED",
      action: "MANAGER_APPROVED",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Manager approved loan for ₹${finalAmount.toLocaleString("en-IN")} at ${product.interestRateAnnual}% APR. Tenure: ${finalTenure} months. Sanction ${sanctionNumber} generated.`,
      notifyUser: application.userId,
      notifyTitle: "Loan Sanctioned!",
      notifyMessage: `Congratulations! Your loan has been approved for ₹${finalAmount.toLocaleString("en-IN")}. Sanction Letter: ${sanctionNumber}. Ready for disbursement.`,
    });

    return sendSuccess(
      res,
      `Application approved and Sanction ${sanctionNumber} generated successfully!`,
      { application, sanction },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return sendError(res, "A detailed rejection reason is required (minimum 5 characters).", [], 400);
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return sendError(res, "Application not found", [], 404);
    }

    const oldStatus = application.status;
    application.status = "REJECTED";
    application.rejectionReason = reason.trim();
    application.rejectionStage = "MANAGER_APPROVAL";
    application.rejectedBy = req.user._id;
    await application.save();

    await logStatusChange({
      applicationId: application._id,
      previousStatus: oldStatus,
      newStatus: "REJECTED",
      action: "MANAGER_REJECTED",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Branch Manager rejected application: "${reason.trim()}"`,
      notifyUser: application.userId,
      notifyTitle: "Application Rejected",
      notifyMessage: `Your loan application was declined by the credit committee. Reason: ${reason.trim()}`,
    });

    return sendSuccess(res, "Application rejected by manager.", { application });
  } catch (error) {
    next(error);
  }
};
