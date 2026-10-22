import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanProduct",
      required: true,
    },
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanEnquiry",
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: 1000,
    },
    requestedTenureMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "APPLICATION_CREATED",
        "DOCUMENT_PENDING",
        "DOCUMENT_VERIFICATION",
        "ADDITIONAL_DOCUMENTS_REQUIRED",
        "ELIGIBILITY_CHECK",
        "OFFICER_REVIEW",
        "MANAGER_APPROVAL",
        "APPROVED",
        "SANCTIONED",
        "DISBURSEMENT_PENDING",
        "DISBURSED",
        "REJECTED",
      ],
      default: "DOCUMENT_PENDING",
      index: true,
    },
    assignedOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    rejectionStage: {
      type: String,
      trim: true,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const LoanApplication = mongoose.model("LoanApplication", loanApplicationSchema);
export default LoanApplication;
