import EligibilityAssessment from "../models/EligibilityAssessment.js";
import LoanApplication from "../models/LoanApplication.js";
import ApplicationDocument from "../models/ApplicationDocument.js";
import Customer from "../models/Customer.js";
import LoanProduct from "../models/LoanProduct.js";
import { assessEligibility } from "../services/eligibilityEngine.js";
import { logStatusChange } from "../services/auditService.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

const REQUIRED_DOC_TYPES = [
  "IDENTITY_PROOF",
  "ADDRESS_PROOF",
  "INCOME_PROOF",
  "BANK_STATEMENT",
  "EMPLOYMENT_PROOF",
];

export const runEligibility = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { customObligations, customIncome } = req.body;

    const application = await LoanApplication.findById(applicationId)
      .populate("customerId")
      .populate("productId");

    if (!application) {
      return sendError(res, "Loan application not found", [], 404);
    }

    // 1. Guardrail: Must verify documents before running eligibility assessment
    const documents = await ApplicationDocument.find({ applicationId });
    const verifiedTypes = documents
      .filter((d) => d.status === "VERIFIED")
      .map((d) => d.documentType);

    const missingDocs = REQUIRED_DOC_TYPES.filter((type) => !verifiedTypes.includes(type));
    if (missingDocs.length > 0) {
      return sendError(
        res,
        `Cannot run eligibility assessment. Missing or unverified documents: ${missingDocs.join(", ")}`,
        [],
        422
      );
    }

    const customer = application.customerId;
    const product = application.productId;

    const monthlyIncome = Number(customIncome) || customer.employment?.monthlyIncome || 0;
    const existingObligations = Number(customObligations) !== undefined && Number(customObligations) !== null
      ? Number(customObligations)
      : customer.employment?.existingEmiObligations || 0;

    const assessmentResult = assessEligibility({
      monthlyIncome,
      existingObligations,
      requestedAmount: application.requestedAmount,
      requestedTenure: application.requestedTenureMonths,
      loanProduct: product,
    });

    // Upsert assessment record
    let assessment = await EligibilityAssessment.findOne({ applicationId });
    if (assessment) {
      Object.assign(assessment, assessmentResult, {
        assessedBy: req.user._id,
        assessedAt: new Date(),
      });
      await assessment.save();
    } else {
      assessment = await EligibilityAssessment.create({
        applicationId,
        ...assessmentResult,
        assessedBy: req.user._id,
        assessedAt: new Date(),
      });
    }

    // Advance status to OFFICER_REVIEW
    const oldStatus = application.status;
    application.status = "OFFICER_REVIEW";
    await application.save();

    await logStatusChange({
      applicationId: application._id,
      previousStatus: oldStatus,
      newStatus: "OFFICER_REVIEW",
      action: "ELIGIBILITY_ASSESSED",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Eligibility engine completed: ${assessmentResult.result}. EMI: ₹${assessmentResult.estimatedEmi}, DTI: ${assessmentResult.debtToIncomeRatio}% (Max allowed: ${assessmentResult.maxDtiAllowed}%).`,
      notifyUser: application.userId,
      notifyTitle: "Eligibility Assessed",
      notifyMessage: `Eligibility check completed with result: ${assessmentResult.result}. Dossier submitted for officer review.`,
    });

    return sendSuccess(
      res,
      `Eligibility assessment completed: ${assessment.result}`,
      { assessment }
    );
  } catch (error) {
    next(error);
  }
};

export const getEligibility = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const assessment = await EligibilityAssessment.findOne({ applicationId }).populate("assessedBy", "name email");

    if (!assessment) {
      return sendError(res, "Eligibility assessment has not been generated for this application yet.", [], 404);
    }

    return sendSuccess(res, "Eligibility assessment retrieved", { assessment });
  } catch (error) {
    next(error);
  }
};
