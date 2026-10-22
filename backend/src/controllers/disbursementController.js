import Disbursement from "../models/Disbursement.js";
import Sanction from "../models/Sanction.js";
import LoanApplication from "../models/LoanApplication.js";
import { generateDisbursementNumber } from "../utils/idGenerators.js";
import { logStatusChange } from "../services/auditService.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const getDisbursementByApplicationId = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const disbursement = await Disbursement.findOne({ applicationId })
      .populate("sanctionId")
      .populate("processedBy", "name email");

    if (!disbursement) {
      return sendError(res, "Disbursement has not been processed for this application.", [], 404);
    }

    return sendSuccess(res, "Disbursement details retrieved", { disbursement });
  } catch (error) {
    next(error);
  }
};

export const processDisbursement = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const {
      amount,
      paymentMethod = "NEFT",
      bankReferenceNumber,
      accountNumberMasked,
      remarks,
    } = req.body;

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return sendError(res, "Loan application not found", [], 404);
    }

    if (application.status !== "DISBURSEMENT_PENDING" && application.status !== "APPROVED") {
      return sendError(
        res,
        `Cannot disburse loan in '${application.status}' state. Must be in DISBURSEMENT_PENDING status.`,
        [],
        400
      );
    }

    const sanction = await Sanction.findOne({ applicationId });
    if (!sanction) {
      return sendError(res, "No active sanction found for this application.", [], 404);
    }

    const disburseAmount = Number(amount) || sanction.approvedAmount;

    // Hard Business Rule: Disbursed amount cannot exceed sanctioned amount
    if (disburseAmount > sanction.approvedAmount) {
      return sendError(
        res,
        `Disbursement amount (₹${disburseAmount.toLocaleString("en-IN")}) cannot exceed the sanctioned amount of ₹${sanction.approvedAmount.toLocaleString("en-IN")}.`,
        [],
        400
      );
    }

    if (disburseAmount <= 0) {
      return sendError(res, "Disbursement amount must be greater than zero.", [], 400);
    }

    const refNumber = bankReferenceNumber || `UTR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const accMasked = accountNumberMasked || "XXXX-XXXX-4921";
    const disbursementNumber = await generateDisbursementNumber();

    const disbursement = await Disbursement.create({
      disbursementNumber,
      applicationId: application._id,
      sanctionId: sanction._id,
      disbursedAmount: disburseAmount,
      paymentMethod,
      bankReferenceNumber: refNumber,
      accountNumberMasked: accMasked,
      processedBy: req.user._id,
      remarks: remarks || "Loan funds successfully transferred to verified customer account.",
    });

    const oldStatus = application.status;
    application.status = "DISBURSED";
    await application.save();

    await logStatusChange({
      applicationId: application._id,
      previousStatus: oldStatus,
      newStatus: "DISBURSED",
      action: "LOAN_DISBURSED",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Loan of ₹${disburseAmount.toLocaleString("en-IN")} disbursed via ${paymentMethod}. Bank Ref: ${refNumber}. Account: ${accMasked}.`,
      notifyUser: application.userId,
      notifyTitle: "Loan Disbursed!",
      notifyMessage: `Great news! ₹${disburseAmount.toLocaleString("en-IN")} has been disbursed to your account. UTR: ${refNumber}.`,
    });

    return sendSuccess(
      res,
      `Loan successfully disbursed! Ref: ${refNumber}`,
      { disbursement, application },
      201
    );
  } catch (error) {
    next(error);
  }
};
