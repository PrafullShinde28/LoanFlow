import mongoose from "mongoose";

const disbursementSchema = new mongoose.Schema(
  {
    disbursementNumber: {
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
    sanctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sanction",
      required: true,
    },
    disbursedAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    disbursementDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["NEFT", "RTGS", "IMPS", "CHEQUE"],
      default: "NEFT",
    },
    bankReferenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    accountNumberMasked: {
      type: String,
      required: true,
      trim: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Disbursement = mongoose.model("Disbursement", disbursementSchema);
export default Disbursement;
