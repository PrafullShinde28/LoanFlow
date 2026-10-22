import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

dotenv.config();

import User from "../models/User.js";
import Customer from "../models/Customer.js";
import LoanProduct from "../models/LoanProduct.js";
import LoanEnquiry from "../models/LoanEnquiry.js";
import LoanApplication from "../models/LoanApplication.js";
import ApplicationDocument from "../models/ApplicationDocument.js";
import EligibilityAssessment from "../models/EligibilityAssessment.js";
import ApplicationReview from "../models/ApplicationReview.js";
import Sanction from "../models/Sanction.js";
import Disbursement from "../models/Disbursement.js";
import ApplicationStatusHistory from "../models/ApplicationStatusHistory.js";
import Notification from "../models/Notification.js";
import { calculateEmi } from "../services/eligibilityEngine.js";
import connectDB from "../config/db.js";

const seedDatabase = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await connectDB();
    console.log("Connected to database successfully.");

    // Clean existing data
    console.log("Cleaning existing records...");
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      LoanProduct.deleteMany({}),
      LoanEnquiry.deleteMany({}),
      LoanApplication.deleteMany({}),
      ApplicationDocument.deleteMany({}),
      EligibilityAssessment.deleteMany({}),
      ApplicationReview.deleteMany({}),
      Sanction.deleteMany({}),
      Disbursement.deleteMany({}),
      ApplicationStatusHistory.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log("Cleared existing collections.");

    // 1. Create Core Users
    console.log("Creating standard demo users...");
    const adminUser = await User.create({
      name: "Super Admin",
      email: "admin@loanflow.com",
      password: "Admin@123",
      phone: "+91 98200 11001",
      role: "ADMIN",
    });

    const officerUser = await User.create({
      name: "Sanjay Verma (Credit Officer)",
      email: "officer@loanflow.com",
      password: "Officer@123",
      phone: "+91 98200 22002",
      role: "LOAN_OFFICER",
    });

    const managerUser = await User.create({
      name: "Anjali Deshmukh (Branch Manager)",
      email: "manager@loanflow.com",
      password: "Manager@123",
      phone: "+91 98200 33003",
      role: "MANAGER",
    });

    // Main Demo Customer: Rahul Patil
    const rahulUser = await User.create({
      name: "Rahul Patil",
      email: "customer@loanflow.com",
      password: "Customer@123",
      phone: "+91 98765 43210",
      role: "CUSTOMER",
    });

    // Additional Customer 2: Priya Sharma (Home Loan)
    const priyaUser = await User.create({
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: "Customer@123",
      phone: "+91 98765 54321",
      role: "CUSTOMER",
    });

    // Additional Customer 3: Amit Kulkarni (Vehicle Loan)
    const amitUser = await User.create({
      name: "Amit Kulkarni",
      email: "amit.kulkarni@example.com",
      password: "Customer@123",
      phone: "+91 98765 67890",
      role: "CUSTOMER",
    });

    // Additional Customer 4: Sneha Rao (Education Loan)
    const snehaUser = await User.create({
      name: "Sneha Rao",
      email: "sneha.rao@example.com",
      password: "Customer@123",
      phone: "+91 98765 78901",
      role: "CUSTOMER",
    });

    console.log("Users created.");

    // 2. Create Customers
    console.log("Creating customer demographic profiles...");
    const rahulCustomer = await Customer.create({
      userId: rahulUser._id,
      fullName: "Rahul Patil",
      dateOfBirth: new Date("1993-08-14"),
      gender: "MALE",
      email: rahulUser.email,
      phone: rahulUser.phone,
      address: {
        street: "B-402 Marvel Imperial, Baner Road",
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411045",
        country: "India",
      },
      panNumber: "ABCDE1234F",
      idProofNumber: "AADHAAR-8921-4432-1102",
      employment: {
        employmentType: "SALARIED",
        employerName: "Tech Mahindra Ltd.",
        monthlyIncome: 55000,
        existingEmiObligations: 5000,
        experienceYears: 5,
      },
    });

    const priyaCustomer = await Customer.create({
      userId: priyaUser._id,
      fullName: "Priya Sharma",
      dateOfBirth: new Date("1989-11-20"),
      gender: "FEMALE",
      email: priyaUser.email,
      phone: priyaUser.phone,
      address: {
        street: "Flat 1201, Green Glades, Powai",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400076",
        country: "India",
      },
      panNumber: "PQXYZ9876K",
      idProofNumber: "PASSPORT-Z1299834",
      employment: {
        employmentType: "SALARIED",
        employerName: "Tata Consultancy Services",
        monthlyIncome: 95000,
        existingEmiObligations: 12000,
        experienceYears: 8,
      },
    });

    const amitCustomer = await Customer.create({
      userId: amitUser._id,
      fullName: "Amit Kulkarni",
      dateOfBirth: new Date("1996-03-05"),
      gender: "MALE",
      email: amitUser.email,
      phone: amitUser.phone,
      address: {
        street: "14/A Shivajinagar",
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411005",
        country: "India",
      },
      panNumber: "AMITK5544P",
      idProofNumber: "AADHAAR-3321-7788-9900",
      employment: {
        employmentType: "SALARIED",
        employerName: "Infosys Technologies",
        monthlyIncome: 42000,
        existingEmiObligations: 3000,
        experienceYears: 3,
      },
    });

    const snehaCustomer = await Customer.create({
      userId: snehaUser._id,
      fullName: "Sneha Rao",
      dateOfBirth: new Date("2000-09-12"),
      gender: "FEMALE",
      email: snehaUser.email,
      phone: snehaUser.phone,
      address: {
        street: "88 Indiranagar 100ft Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560038",
        country: "India",
      },
      panNumber: "SNEHR7722M",
      idProofNumber: "PASSPORT-P8912443",
      employment: {
        employmentType: "STUDENT",
        employerName: "Co-applicant: Ramesh Rao (Father)",
        monthlyIncome: 80000,
        existingEmiObligations: 8000,
        experienceYears: 0,
      },
    });

    // 3. Create Loan Products with dynamic policy thresholds
    console.log("Creating loan products...");
    const personalLoan = await LoanProduct.create({
      code: "PL-001",
      name: "Personal Loan",
      description: "Quick personal financing for emergencies, debt consolidation, or weddings.",
      category: "PERSONAL",
      minAmount: 50000,
      maxAmount: 1500000,
      minTenureMonths: 12,
      maxTenureMonths: 60,
      interestRateAnnual: 11.5,
      minMonthlyIncome: 25000,
      maxDtiPercent: 50,
      processingFeePercent: 1.5,
      isActive: true,
    });

    const homeLoan = await LoanProduct.create({
      code: "HL-001",
      name: "Home Loan",
      description: "Competitive home purchase, construction, or renovation funding.",
      category: "HOME",
      minAmount: 500000,
      maxAmount: 15000000,
      minTenureMonths: 60,
      maxTenureMonths: 360,
      interestRateAnnual: 8.5,
      minMonthlyIncome: 40000,
      maxDtiPercent: 55, // Higher allowable DTI for secured mortgages
      processingFeePercent: 0.5,
      isActive: true,
    });

    const educationLoan = await LoanProduct.create({
      code: "EL-001",
      name: "Education Loan",
      description: "Support for undergraduate and postgraduate domestic & international studies.",
      category: "EDUCATION",
      minAmount: 100000,
      maxAmount: 5000000,
      minTenureMonths: 12,
      maxTenureMonths: 120,
      interestRateAnnual: 9.0,
      minMonthlyIncome: 20000,
      maxDtiPercent: 50,
      processingFeePercent: 1.0,
      isActive: true,
    });

    const vehicleLoan = await LoanProduct.create({
      code: "VL-001",
      name: "Vehicle Loan",
      description: "Affordable financing for new four-wheelers and two-wheelers.",
      category: "VEHICLE",
      minAmount: 100000,
      maxAmount: 3500000,
      minTenureMonths: 12,
      maxTenureMonths: 84,
      interestRateAnnual: 9.5,
      minMonthlyIncome: 30000,
      maxDtiPercent: 45,
      processingFeePercent: 1.0,
      isActive: true,
    });

    // 4. Create Sample Enquiries
    console.log("Creating enquiries...");
    const enquiry1 = await LoanEnquiry.create({
      enquiryNumber: "ENQ-2026-0001",
      fullName: "Rahul Patil",
      email: "customer@loanflow.com",
      mobile: "+91 98765 43210",
      loanProductId: personalLoan._id,
      requestedAmount: 400000,
      requestedTenureMonths: 36,
      employmentType: "SALARIED",
      monthlyIncome: 55000,
      purpose: "Home Refurbishment and Electronics",
      status: "CONVERTED",
      contactedBy: officerUser._id,
      contactNotes: "Applicant verified on phone call. Excellent credit profile. Converted to loan application.",
    });

    const enquiry2 = await LoanEnquiry.create({
      enquiryNumber: "ENQ-2026-0002",
      fullName: "Vikas Joshi",
      email: "vikas.joshi@example.com",
      mobile: "+91 98221 44556",
      loanProductId: vehicleLoan._id,
      requestedAmount: 850000,
      requestedTenureMonths: 60,
      employmentType: "SALARIED",
      monthlyIncome: 65000,
      purpose: "New SUV purchase (Hyundai Creta)",
      status: "NEW",
    });

    const enquiry3 = await LoanEnquiry.create({
      enquiryNumber: "ENQ-2026-0003",
      fullName: "Deepa Nair",
      email: "deepa.nair@example.com",
      mobile: "+91 99300 88776",
      loanProductId: homeLoan._id,
      requestedAmount: 6500000,
      requestedTenureMonths: 240,
      employmentType: "SALARIED",
      monthlyIncome: 120000,
      purpose: "Ready-to-move apartment purchase",
      status: "CONTACTED",
      contactedBy: officerUser._id,
      contactNotes: "Customer requested callbacks after 6 PM to discuss interest rates.",
    });

    // 5. Ensure sample mock document directory exists
    const uploadsRoot = path.resolve(process.cwd(), "uploads", "documents");
    const demoAppFolder = path.join(uploadsRoot, "LOAN-2026-0001");
    if (!fs.existsSync(demoAppFolder)) {
      fs.mkdirSync(demoAppFolder, { recursive: true });
    }

    // Write a dummy PDF/sample text file so file downloads succeed
    const sampleDocPath = path.join(demoAppFolder, "verified_sample_document.pdf");
    if (!fs.existsSync(sampleDocPath)) {
      fs.writeFileSync(
        sampleDocPath,
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF"
      );
    }

    // 6. Create Applications at diverse stages
    console.log("Creating applications across lifecycle states...");

    // APP 1: Main Demo Lead - Rahul Patil (LOAN-2026-0001) - At MANAGER_APPROVAL stage
    const rahulApp = await LoanApplication.create({
      applicationNumber: "LOAN-2026-0001",
      customerId: rahulCustomer._id,
      userId: rahulUser._id,
      productId: personalLoan._id,
      enquiryId: enquiry1._id,
      requestedAmount: 400000,
      requestedTenureMonths: 36,
      purpose: "Personal Loan for Home Renovation",
      status: "MANAGER_APPROVAL",
      assignedOfficerId: officerUser._id,
      assignedManagerId: managerUser._id,
    });
    enquiry1.convertedApplicationId = rahulApp._id;
    await enquiry1.save();

    // Attach 5 verified documents for Rahul Patil
    const docTypes = [
      { type: "IDENTITY_PROOF", title: "Aadhaar Card (Front & Back)", file: "aadhaar_rahul_patil.pdf" },
      { type: "ADDRESS_PROOF", title: "Electricity Bill (Jan 2026)", file: "utility_bill_baner.pdf" },
      { type: "INCOME_PROOF", title: "Salary Slips (Last 3 Months)", file: "salary_slips_q4.pdf" },
      { type: "BANK_STATEMENT", title: "HDFC Bank Statement (6 Months)", file: "hdfc_bank_statement.pdf" },
      { type: "EMPLOYMENT_PROOF", title: "Tech Mahindra Employee Badge & Offer Letter", file: "employment_badge.pdf" },
    ];

    for (const d of docTypes) {
      await ApplicationDocument.create({
        applicationId: rahulApp._id,
        documentType: d.type,
        title: d.title,
        fileName: "verified_sample_document.pdf",
        originalName: d.file,
        filePath: `/uploads/documents/LOAN-2026-0001/verified_sample_document.pdf`,
        fileSize: 45210,
        mimeType: "application/pdf",
        uploadedBy: rahulUser._id,
        status: "VERIFIED",
        verificationRemarks: "Verified against original document records.",
        verifiedBy: officerUser._id,
        verifiedAt: new Date(Date.now() - 3600000 * 5),
      });
    }

    // Eligibility Assessment for Rahul Patil
    // EMI = 400000 * 0.009583 * (1+0.009583)^36 / ((1+0.009583)^36 - 1) = approx ₹13,197
    const rahulEmi = calculateEmi(400000, personalLoan.interestRateAnnual, 36);
    const rahulTotalObligations = rahulCustomer.employment.existingEmiObligations + rahulEmi; // 5000 + 13197 = 18197
    const rahulDti = Math.round((rahulTotalObligations / rahulCustomer.employment.monthlyIncome) * 1000) / 10; // 33.1%

    await EligibilityAssessment.create({
      applicationId: rahulApp._id,
      monthlyIncome: rahulCustomer.employment.monthlyIncome,
      existingMonthlyObligations: rahulCustomer.employment.existingEmiObligations,
      requestedAmount: rahulApp.requestedAmount,
      tenureMonths: rahulApp.requestedTenureMonths,
      interestRateAnnual: personalLoan.interestRateAnnual,
      estimatedEmi: rahulEmi,
      totalMonthlyObligations: rahulTotalObligations,
      debtToIncomeRatio: rahulDti,
      maxDtiAllowed: personalLoan.maxDtiPercent,
      result: "ELIGIBLE",
      ruleResults: [
        {
          rule: "MIN_INCOME",
          description: "Applicant gross monthly income must meet product minimum requirement",
          passed: true,
          threshold: personalLoan.minMonthlyIncome,
          actual: rahulCustomer.employment.monthlyIncome,
        },
        {
          rule: "AMOUNT_BOUNDS",
          description: "Requested loan amount must be within product limits",
          passed: true,
          threshold: { min: personalLoan.minAmount, max: personalLoan.maxAmount },
          actual: rahulApp.requestedAmount,
        },
        {
          rule: "TENURE_BOUNDS",
          description: "Requested loan tenure must be within product limits",
          passed: true,
          threshold: { min: personalLoan.minTenureMonths, max: personalLoan.maxTenureMonths },
          actual: rahulApp.requestedTenureMonths,
        },
        {
          rule: "DTI_THRESHOLD",
          description: `Total debt obligations cannot exceed product max DTI threshold of ${personalLoan.maxDtiPercent}%`,
          passed: true,
          threshold: personalLoan.maxDtiPercent,
          actual: rahulDti,
        },
      ],
      notes: `Applicant meets all underwriting criteria with DTI of ${rahulDti}% well within policy ceiling of ${personalLoan.maxDtiPercent}%.`,
      assessedBy: officerUser._id,
    });

    // Officer Recommendation for Rahul Patil
    await ApplicationReview.create({
      applicationId: rahulApp._id,
      officerId: officerUser._id,
      recommendation: "RECOMMEND_APPROVAL",
      creditRemarks: "CIBIL Score: 780. Stable corporate IT employment with Tech Mahindra for 5 years. DTI is comfortable at 33.1%. All 5 KYC and income proofs physically cross-checked. Strongly recommended for full approval of ₹4,00,000.",
      riskScore: 780,
    });

    // History for Rahul Patil
    await ApplicationStatusHistory.create([
      {
        applicationId: rahulApp._id,
        previousStatus: "APPLICATION_CREATED",
        newStatus: "DOCUMENT_PENDING",
        action: "ENQUIRY_CONVERTED",
        performedBy: officerUser._id,
        role: "LOAN_OFFICER",
        remarks: "Enquiry ENQ-2026-0001 qualified and converted to loan dossier.",
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        applicationId: rahulApp._id,
        previousStatus: "DOCUMENT_PENDING",
        newStatus: "DOCUMENT_VERIFICATION",
        action: "DOCUMENTS_SUBMITTED",
        performedBy: rahulUser._id,
        role: "CUSTOMER",
        remarks: "All 5 required KYC & employment proofs uploaded.",
        timestamp: new Date(Date.now() - 3600000 * 18),
      },
      {
        applicationId: rahulApp._id,
        previousStatus: "DOCUMENT_VERIFICATION",
        newStatus: "DOCUMENT_VERIFICATION",
        action: "ALL_DOCUMENTS_VERIFIED",
        performedBy: officerUser._id,
        role: "LOAN_OFFICER",
        remarks: "All documents inspected and verified against registry standards.",
        timestamp: new Date(Date.now() - 3600000 * 8),
      },
      {
        applicationId: rahulApp._id,
        previousStatus: "DOCUMENT_VERIFICATION",
        newStatus: "ELIGIBILITY_CHECK",
        action: "ELIGIBILITY_CALCULATED",
        performedBy: officerUser._id,
        role: "LOAN_OFFICER",
        remarks: `Eligibility rules evaluated. Result: ELIGIBLE. DTI: ${rahulDti}%.`,
        timestamp: new Date(Date.now() - 3600000 * 6),
      },
      {
        applicationId: rahulApp._id,
        previousStatus: "ELIGIBILITY_CHECK",
        newStatus: "MANAGER_APPROVAL",
        action: "OFFICER_RECOMMENDED",
        performedBy: officerUser._id,
        role: "LOAN_OFFICER",
        remarks: "Appraisal dossier finalized with favorable recommendation for credit manager sanction.",
        timestamp: new Date(Date.now() - 3600000 * 4),
      },
    ]);

    // APP 2: Priya Sharma (Home Loan) - DISBURSED state
    const priyaApp = await LoanApplication.create({
      applicationNumber: "LOAN-2026-0002",
      customerId: priyaCustomer._id,
      userId: priyaUser._id,
      productId: homeLoan._id,
      requestedAmount: 4500000,
      requestedTenureMonths: 180,
      purpose: "Purchase of 2BHK Apartment",
      status: "DISBURSED",
      assignedOfficerId: officerUser._id,
      assignedManagerId: managerUser._id,
    });

    const priyaSanction = await Sanction.create({
      sanctionNumber: "SANC-2026-0001",
      applicationId: priyaApp._id,
      customerId: priyaCustomer._id,
      approvedAmount: 4500000,
      approvedTenureMonths: 180,
      interestRateAnnual: 8.5,
      monthlyEmi: calculateEmi(4500000, 8.5, 180),
      sanctionDate: new Date(Date.now() - 3600000 * 72),
      expiryDate: new Date(Date.now() + 3600000 * 24 * 60),
      approvedBy: managerUser._id,
      approvalRemarks: "Approved at prime home loan rate. Property valuation report verified.",
      termsAndConditions: [
        "Mortgage lien on Powai property until full closure.",
        "Monthly ECS / NACH auto-debit mandatory.",
      ],
    });

    await Disbursement.create({
      disbursementNumber: "DISB-2026-0001",
      applicationId: priyaApp._id,
      sanctionId: priyaSanction._id,
      disbursedAmount: 4500000,
      disbursementDate: new Date(Date.now() - 3600000 * 24),
      paymentMethod: "RTGS",
      bankReferenceNumber: "RTGS-HDFC-9988221100",
      accountNumberMasked: "XXXX-XXXX-9912",
      processedBy: managerUser._id,
      remarks: "Direct RTGS disbursement to developer escrow account.",
    });

    // APP 3: Amit Kulkarni (Vehicle Loan) - ADDITIONAL_DOCUMENTS_REQUIRED (for document rejection demo)
    const amitApp = await LoanApplication.create({
      applicationNumber: "LOAN-2026-0003",
      customerId: amitCustomer._id,
      userId: amitUser._id,
      productId: vehicleLoan._id,
      requestedAmount: 600000,
      requestedTenureMonths: 48,
      purpose: "Honda City Car Loan",
      status: "ADDITIONAL_DOCUMENTS_REQUIRED",
      assignedOfficerId: officerUser._id,
    });

    // Amit has 2 verified docs, and 1 rejected doc with reason!
    await ApplicationDocument.create([
      {
        applicationId: amitApp._id,
        documentType: "IDENTITY_PROOF",
        title: "PAN Card",
        fileName: "verified_sample_document.pdf",
        originalName: "pan_amit.pdf",
        filePath: "/uploads/documents/LOAN-2026-0001/verified_sample_document.pdf",
        fileSize: 32000,
        mimeType: "application/pdf",
        uploadedBy: amitUser._id,
        status: "VERIFIED",
        verificationRemarks: "PAN verified on Income Tax NSDL portal.",
        verifiedBy: officerUser._id,
      },
      {
        applicationId: amitApp._id,
        documentType: "BANK_STATEMENT",
        title: "Bank Statement",
        fileName: "verified_sample_document.pdf",
        originalName: "blurry_bank_statement.pdf",
        filePath: "/uploads/documents/LOAN-2026-0001/verified_sample_document.pdf",
        fileSize: 41000,
        mimeType: "application/pdf",
        uploadedBy: amitUser._id,
        status: "REJECTED",
        verificationRemarks: "Document is unclear and pages 3-4 are missing. Please upload a high-resolution, digitally stamped 6-month statement.",
        verifiedBy: officerUser._id,
      },
    ]);

    // APP 4: Sneha Rao (Education Loan) - DOCUMENT_PENDING state
    await LoanApplication.create({
      applicationNumber: "LOAN-2026-0004",
      customerId: snehaCustomer._id,
      userId: snehaUser._id,
      productId: educationLoan._id,
      requestedAmount: 1200000,
      requestedTenureMonths: 84,
      purpose: "M.S. in Computer Science at Georgia Tech",
      status: "DOCUMENT_PENDING",
    });

    // 7. Seed Notifications
    console.log("Creating demo notifications...");
    await Notification.create([
      {
        recipientId: rahulUser._id,
        applicationId: rahulApp._id,
        title: "Stage Gate Update",
        message: "Your application LOAN-2026-0001 has been recommended by the credit officer and is in final manager review.",
        type: "INFO",
        isRead: false,
      },
      {
        recipientId: amitUser._id,
        applicationId: amitApp._id,
        title: "Action Required: Bank Statement Rejected",
        message: "Your bank statement was rejected: Document is unclear and pages 3-4 are missing. Please re-upload.",
        type: "WARNING",
        isRead: false,
      },
      {
        recipientId: priyaUser._id,
        applicationId: priyaApp._id,
        title: "Loan Disbursed!",
        message: "Loan funds of ₹45,00,000 have been disbursed via RTGS. Ref: RTGS-HDFC-9988221100.",
        type: "SUCCESS",
        isRead: true,
      },
      {
        recipientId: managerUser._id,
        applicationId: rahulApp._id,
        title: "Pending Approval",
        message: "Application LOAN-2026-0001 for Rahul Patil (₹4,00,000) is awaiting your credit sanction decision.",
        type: "INFO",
        isRead: false,
      },
    ]);

    console.log("====================================================");
    console.log("DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("====================================================");
    console.log("Demo Credentials Available:");
    console.log("  • ADMIN:    admin@loanflow.com    / Admin@123");
    console.log("  • OFFICER:  officer@loanflow.com  / Officer@123");
    console.log("  • MANAGER:  manager@loanflow.com  / Manager@123");
    console.log("  • CUSTOMER: customer@loanflow.com / Customer@123 (Rahul Patil - ₹4,00,000 Personal Loan)");
    console.log("====================================================");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
