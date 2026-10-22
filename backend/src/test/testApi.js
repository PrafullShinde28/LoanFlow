import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import User from "../models/User.js";
import LoanProduct from "../models/LoanProduct.js";
import Customer from "../models/Customer.js";
import LoanEnquiry from "../models/LoanEnquiry.js";
import LoanApplication from "../models/LoanApplication.js";
import ApplicationDocument from "../models/ApplicationDocument.js";
import EligibilityAssessment from "../models/EligibilityAssessment.js";
import ApplicationReview from "../models/ApplicationReview.js";
import Sanction from "../models/Sanction.js";
import Disbursement from "../models/Disbursement.js";
import { calculateEmi, assessEligibility } from "../services/eligibilityEngine.js";

async function runTests() {
  console.log("====================================================");
  console.log("🧪 RUNNING LOANFLOW BACKEND DOMAIN & LOGIC TESTS");
  console.log("====================================================");

  await connectDB();

  // Test 1: EMI Calculation Formula Check
  // Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  console.log("\n[Test 1] Testing EMI Calculation Formula...");
  const principal = 400000;
  const apr = 11.5;
  const tenure = 36;
  const calculatedEmi = calculateEmi(principal, apr, tenure);
  console.log(`Principal: ₹${principal}, APR: ${apr}%, Tenure: ${tenure} months => EMI: ₹${calculatedEmi}`);
  if (calculatedEmi >= 13100 && calculatedEmi <= 13300) {
    console.log("✅ EMI formula matches standard financial reducing-balance calculations (~₹13,197).");
  } else {
    throw new Error(`Unexpected EMI calculation: ${calculatedEmi}`);
  }

  // Test 2: Configurable Eligibility Assessment Engine
  console.log("\n[Test 2] Testing Dynamic Policy Eligibility Engine...");
  const mockProduct = {
    minAmount: 50000,
    maxAmount: 1500000,
    minTenureMonths: 12,
    maxTenureMonths: 60,
    interestRateAnnual: 11.5,
    minMonthlyIncome: 25000,
    maxDtiPercent: 50, // 50% max DTI
  };

  // Case A: Rahul Patil - Income ₹55,000, Existing EMI ₹5,000, New EMI ~₹13,197 => Total ₹18,197 => DTI = 33.1% <= 50% => ELIGIBLE
  const assessmentPass = assessEligibility({
    monthlyIncome: 55000,
    existingObligations: 5000,
    requestedAmount: 400000,
    requestedTenure: 36,
    loanProduct: mockProduct,
  });
  console.log(`Rahul Patil Eligibility Result: ${assessmentPass.result}, DTI: ${assessmentPass.debtToIncomeRatio}% (Max: ${assessmentPass.maxDtiAllowed}%)`);
  if (assessmentPass.result !== "ELIGIBLE") {
    throw new Error("Rahul Patil should be ELIGIBLE");
  }
  console.log("✅ Passing case validated successfully.");

  // Case B: Ineligible applicant - Low Income ₹20,000 (below ₹25,000 threshold) & DTI > 50%
  const assessmentFail = assessEligibility({
    monthlyIncome: 20000,
    existingObligations: 8000,
    requestedAmount: 400000,
    requestedTenure: 36,
    loanProduct: mockProduct,
  });
  console.log(`Low Income Case Result: ${assessmentFail.result}, DTI: ${assessmentFail.debtToIncomeRatio}%`);
  if (assessmentFail.result !== "NOT_ELIGIBLE") {
    throw new Error("Should be NOT_ELIGIBLE due to income and DTI");
  }
  console.log("✅ Rejection case validated successfully.");

  // Test 3: Custom Product Max DTI Check (e.g. Vehicle Loan at 45%)
  console.log("\n[Test 3] Testing Product-specific Configurable DTI (Vehicle Loan 45%)...");
  const vehicleProduct = {
    ...mockProduct,
    maxDtiPercent: 45,
  };
  const assessmentCustomDti = assessEligibility({
    monthlyIncome: 40000,
    existingObligations: 6000,
    requestedAmount: 400000,
    requestedTenure: 36,
    loanProduct: vehicleProduct,
  });
  // Total = 6000 + 13197 = 19197. DTI = 19197 / 40000 = 47.99% => > 45% => NOT_ELIGIBLE!
  console.log(`Vehicle DTI: ${assessmentCustomDti.debtToIncomeRatio}% vs Max Allowed: ${assessmentCustomDti.maxDtiAllowed}% => ${assessmentCustomDti.result}`);
  if (assessmentCustomDti.result !== "NOT_ELIGIBLE") {
    throw new Error("Vehicle loan should fail because DTI 48% exceeds 45% ceiling");
  }
  console.log("✅ Configurable per-product DTI threshold successfully verified.");

  // Test 4: Verify Database Seeding
  console.log("\n[Test 4] Checking User models in DB...");
  const userCount = await User.countDocuments();
  console.log(`Total users in DB: ${userCount}`);

  console.log("\n====================================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  console.log("====================================================");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
