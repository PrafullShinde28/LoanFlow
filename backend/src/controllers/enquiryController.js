import LoanEnquiry from "../models/LoanEnquiry.js";
import LoanApplication from "../models/LoanApplication.js";
import LoanProduct from "../models/LoanProduct.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import { generateEnquiryNumber, generateApplicationNumber } from "../utils/idGenerators.js";
import { logStatusChange } from "../services/auditService.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const createEnquiry = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      mobile,
      loanProductId,
      requestedAmount,
      requestedTenureMonths,
      employmentType,
      monthlyIncome,
      purpose,
    } = req.body;

    if (!fullName || !email || !mobile || !loanProductId || !requestedAmount || !monthlyIncome) {
      return sendError(res, "Please fill in all mandatory enquiry fields.", [], 400);
    }

    const product = await LoanProduct.findById(loanProductId);
    if (!product) {
      return sendError(res, "Selected loan product does not exist.", [], 404);
    }

    const enquiryNumber = await generateEnquiryNumber();

    const enquiry = await LoanEnquiry.create({
      enquiryNumber,
      fullName,
      email: email.toLowerCase(),
      mobile,
      loanProductId,
      requestedAmount: Number(requestedAmount),
      requestedTenureMonths: Number(requestedTenureMonths) || 36,
      employmentType: employmentType || "SALARIED",
      monthlyIncome: Number(monthlyIncome),
      purpose: purpose || "Personal Funding",
      status: "NEW",
    });

    return sendSuccess(
      res,
      `Enquiry ${enquiryNumber} submitted successfully. Our loan officer will contact you shortly.`,
      { enquiry },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getEnquiries = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { enquiryNumber: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const enquiries = await LoanEnquiry.find(filter)
      .populate("loanProductId", "name code interestRateAnnual maxDtiPercent")
      .populate("contactedBy", "name email")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "Enquiries retrieved", { enquiries });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await LoanEnquiry.findById(req.params.id)
      .populate("loanProductId")
      .populate("contactedBy", "name email role");

    if (!enquiry) {
      return sendError(res, "Enquiry not found", [], 404);
    }

    return sendSuccess(res, "Enquiry retrieved", { enquiry });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiry = async (req, res, next) => {
  try {
    const { status, contactNotes } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (contactNotes) updateData.contactNotes = contactNotes;
    updateData.contactedBy = req.user._id;

    const enquiry = await LoanEnquiry.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate("loanProductId");

    if (!enquiry) {
      return sendError(res, "Enquiry not found", [], 404);
    }

    return sendSuccess(res, "Enquiry updated successfully", { enquiry });
  } catch (error) {
    next(error);
  }
};

export const convertEnquiry = async (req, res, next) => {
  try {
    const enquiry = await LoanEnquiry.findById(req.params.id).populate("loanProductId");
    if (!enquiry) {
      return sendError(res, "Enquiry not found", [], 404);
    }

    if (enquiry.status === "CONVERTED") {
      return sendError(res, "This enquiry has already been converted to an application.", [], 400);
    }

    // 1. Locate or create User for Customer
    let user = await User.findOne({ email: enquiry.email });
    if (!user) {
      user = await User.create({
        name: enquiry.fullName,
        email: enquiry.email,
        password: "Customer@123", // default demo initial password
        phone: enquiry.mobile,
        role: "CUSTOMER",
      });
    }

    // 2. Locate or create Customer record
    let customer = await Customer.findOne({ userId: user._id });
    if (!customer) {
      customer = await Customer.create({
        userId: user._id,
        fullName: enquiry.fullName,
        dateOfBirth: new Date("1995-05-15"),
        gender: "MALE",
        email: enquiry.email,
        phone: enquiry.mobile,
        address: {
          street: "123 Tech Park Road",
          city: "Pune",
          state: "Maharashtra",
          postalCode: "411057",
          country: "India",
        },
        panNumber: "ABCDE1234F",
        idProofNumber: "AADHAAR-8832-9912",
        employment: {
          employmentType: enquiry.employmentType || "SALARIED",
          employerName: "Cognizant Technology Solutions",
          monthlyIncome: enquiry.monthlyIncome,
          existingEmiObligations: 5000,
          experienceYears: 4,
        },
      });
    }

    // 3. Generate Loan Application
    const applicationNumber = await generateApplicationNumber();
    const application = await LoanApplication.create({
      applicationNumber,
      customerId: customer._id,
      userId: user._id,
      productId: enquiry.loanProductId._id,
      enquiryId: enquiry._id,
      requestedAmount: enquiry.requestedAmount,
      requestedTenureMonths: enquiry.requestedTenureMonths,
      purpose: enquiry.purpose || "Loan Origination from Enquiry",
      status: "DOCUMENT_PENDING",
      assignedOfficerId: req.user._id,
    });

    // 4. Update Enquiry record
    enquiry.status = "CONVERTED";
    enquiry.convertedApplicationId = application._id;
    enquiry.contactedBy = req.user._id;
    await enquiry.save();

    // 5. Audit Log
    await logStatusChange({
      applicationId: application._id,
      previousStatus: "APPLICATION_CREATED",
      newStatus: "DOCUMENT_PENDING",
      action: "ENQUIRY_CONVERTED",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Enquiry ${enquiry.enquiryNumber} converted into Loan Application ${applicationNumber} by Officer ${req.user.name}`,
      notifyUser: user._id,
      notifyTitle: "Application Created",
      notifyMessage: `Your loan application ${applicationNumber} has been initiated from your enquiry. Please submit required documents.`,
    });

    return sendSuccess(
      res,
      `Enquiry successfully converted to Loan Application ${applicationNumber}`,
      { application, enquiry },
      201
    );
  } catch (error) {
    next(error);
  }
};
