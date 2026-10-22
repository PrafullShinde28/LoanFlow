import ApplicationStatusHistory from "../models/ApplicationStatusHistory.js";
import LoanApplication from "../models/LoanApplication.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const getApplicationHistory = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return sendError(res, "Loan application not found", [], 404);
    }

    const history = await ApplicationStatusHistory.find({ applicationId })
      .populate("performedBy", "name email role")
      .sort({ timestamp: -1 });

    return sendSuccess(res, "Application history retrieved", { history });
  } catch (error) {
    next(error);
  }
};
