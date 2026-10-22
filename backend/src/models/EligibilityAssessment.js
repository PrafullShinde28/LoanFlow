import mongoose from "mongoose";

const eligibilityAssessmentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      unique: true,
      index: true,
    },
    monthlyIncome: {
      type: Number,
      required: true,
    },
    existingMonthlyObligations: {
      type: Number,
      required: true,
      default: 0,
    },
    requestedAmount: {
      type: Number,
      required: true,
    },
    tenureMonths: {
      type: Number,
      required: true,
    },
    interestRateAnnual: {
      type: Number,
      required: true,
    },
    estimatedEmi: {
      type: Number,
      required: true,
    },
    totalMonthlyObligations: {
      type: Number,
      required: true,
    },
    debtToIncomeRatio: {
      type: Number,
      required: true, // percentage e.g. 32.5
    },
    maxDtiAllowed: {
      type: Number,
      required: true, // configurable from product e.g. 50
    },
    result: {
      type: String,
      enum: ["ELIGIBLE", "NOT_ELIGIBLE"],
      required: true,
      index: true,
    },
    ruleResults: [
      {
        rule: { type: String, required: true },
        description: { type: String },
        passed: { type: Boolean, required: true },
        threshold: { type: mongoose.Schema.Types.Mixed },
        actual: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const EligibilityAssessment = mongoose.model(
  "EligibilityAssessment",
  eligibilityAssessmentSchema
);
export default EligibilityAssessment;
