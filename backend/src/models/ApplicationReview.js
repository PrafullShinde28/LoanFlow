import mongoose from "mongoose";

const applicationReviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
      enum: ["RECOMMEND_APPROVAL", "RECOMMEND_REJECTION", "REQUEST_DOCUMENTS"],
    },
    creditRemarks: {
      type: String,
      required: true,
      trim: true,
    },
    riskScore: {
      type: Number,
      min: 300,
      max: 900,
      default: 750,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ApplicationReview = mongoose.model(
  "ApplicationReview",
  applicationReviewSchema
);
export default ApplicationReview;
