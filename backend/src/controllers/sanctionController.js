import Sanction from "../models/Sanction.js";
import LoanApplication from "../models/LoanApplication.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const getSanctionByApplicationId = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const sanction = await Sanction.findOne({ applicationId })
      .populate("customerId")
      .populate("approvedBy", "name email");

    if (!sanction) {
      return sendError(res, "Sanction letter not generated yet for this application.", [], 404);
    }

    return sendSuccess(res, "Sanction details retrieved", { sanction });
  } catch (error) {
    next(error);
  }
};
