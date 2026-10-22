import mongoose from "mongoose";

const loanProductSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["PERSONAL", "HOME", "EDUCATION", "VEHICLE"],
      required: true,
    },
    minAmount: {
      type: Number,
      required: true,
      min: 1000,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    minTenureMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    maxTenureMonths: {
      type: Number,
      required: true,
    },
    interestRateAnnual: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    minMonthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDtiPercent: {
      type: Number,
      required: true,
      default: 50,
      min: 10,
      max: 90,
    },
    processingFeePercent: {
      type: Number,
      default: 1.0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const LoanProduct = mongoose.model("LoanProduct", loanProductSchema);
export default LoanProduct;
