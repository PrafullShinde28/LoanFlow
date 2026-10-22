import mongoose from "mongoose";

const sanctionSchema = new mongoose.Schema(
  {
    sanctionNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    approvedAmount: {
      type: Number,
      required: true,
      min: 1000,
    },
    approvedTenureMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    interestRateAnnual: {
      type: Number,
      required: true,
    },
    monthlyEmi: {
      type: Number,
      required: true,
    },
    sanctionDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvalRemarks: {
      type: String,
      trim: true,
    },
    termsAndConditions: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Sanction = mongoose.model("Sanction", sanctionSchema);
export default Sanction;
