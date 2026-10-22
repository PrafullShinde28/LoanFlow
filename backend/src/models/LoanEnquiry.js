import mongoose from "mongoose";

const loanEnquirySchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    loanProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanProduct",
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: 1000,
    },
    requestedTenureMonths: {
      type: Number,
      default: 36,
      min: 1,
    },
    employmentType: {
      type: String,
      enum: ["SALARIED", "SELF_EMPLOYED", "BUSINESS", "STUDENT"],
      default: "SALARIED",
    },
    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "CONVERTED", "CLOSED"],
      default: "NEW",
      index: true,
    },
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    contactNotes: {
      type: String,
      trim: true,
    },
    convertedApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
    },
  },
  {
    timestamps: true,
  }
);

const LoanEnquiry = mongoose.model("LoanEnquiry", loanEnquirySchema);
export default LoanEnquiry;
