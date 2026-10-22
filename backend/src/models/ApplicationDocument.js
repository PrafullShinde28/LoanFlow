import mongoose from "mongoose";

const applicationDocumentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: [
        "IDENTITY_PROOF",
        "ADDRESS_PROOF",
        "INCOME_PROOF",
        "BANK_STATEMENT",
        "EMPLOYMENT_PROOF",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "UPLOADED", "UNDER_REVIEW", "VERIFIED", "REJECTED"],
      default: "UPLOADED",
      index: true,
    },
    verificationRemarks: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ApplicationDocument = mongoose.model(
  "ApplicationDocument",
  applicationDocumentSchema
);
export default ApplicationDocument;
