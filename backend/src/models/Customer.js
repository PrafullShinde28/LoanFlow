import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    idProofNumber: {
      type: String,
      required: true,
      trim: true,
    },
    employment: {
      employmentType: {
        type: String,
        enum: ["SALARIED", "SELF_EMPLOYED", "BUSINESS", "STUDENT"],
        required: true,
        default: "SALARIED",
      },
      employerName: {
        type: String,
        required: true,
        trim: true,
      },
      monthlyIncome: {
        type: Number,
        required: true,
        min: 0,
      },
      existingEmiObligations: {
        type: Number,
        default: 0,
        min: 0,
      },
      experienceYears: {
        type: Number,
        default: 1,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
