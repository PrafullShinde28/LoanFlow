import LoanEnquiry from "../models/LoanEnquiry.js";
import LoanApplication from "../models/LoanApplication.js";
import Sanction from "../models/Sanction.js";
import Disbursement from "../models/Disbursement.js";

const currentYear = new Date().getFullYear();

export const generateEnquiryNumber = async () => {
  const count = await LoanEnquiry.countDocuments();
  const sequence = String(count + 1).padStart(4, "0");
  return `ENQ-${currentYear}-${sequence}`;
};

export const generateApplicationNumber = async () => {
  const count = await LoanApplication.countDocuments();
  const sequence = String(count + 1).padStart(4, "0");
  return `LOAN-${currentYear}-${sequence}`;
};

export const generateSanctionNumber = async () => {
  const count = await Sanction.countDocuments();
  const sequence = String(count + 1).padStart(4, "0");
  return `SANC-${currentYear}-${sequence}`;
};

export const generateDisbursementNumber = async () => {
  const count = await Disbursement.countDocuments();
  const sequence = String(count + 1).padStart(4, "0");
  return `DISB-${currentYear}-${sequence}`;
};
