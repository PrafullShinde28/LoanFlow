import LoanApplication from "../models/LoanApplication.js";
import LoanProduct from "../models/LoanProduct.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import { generateApplicationNumber } from "../utils/idGenerators.js";
import { logStatusChange } from "../services/auditService.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const getApplications = async (req, res, next) => {
  try {
    const {
      status,
      productId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Customer can only view their own applications
    if (req.user.role === "CUSTOMER") {
      filter.userId = req.user._id;
    }

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (productId) {
      filter.productId = productId;
    }

    if (search) {
      filter.$or = [
        { applicationNumber: { $regex: search, $options: "i" } },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalApplications = await LoanApplication.countDocuments(filter);

    let query = LoanApplication.find(filter)
      .populate("customerId")
      .populate("userId", "name email phone")
      .populate("productId")
      .populate("assignedOfficerId", "name email")
      .populate("assignedManagerId", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const applications = await query.exec();

    return sendSuccess(res, "Applications retrieved", {
      applications,
      pagination: {
        total: totalApplications,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalApplications / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await LoanApplication.findById(req.params.id)
      .populate({
        path: "customerId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate("userId", "name email phone")
      .populate("productId")
      .populate("enquiryId")
      .populate("assignedOfficerId", "name email")
      .populate("assignedManagerId", "name email");

    if (!application) {
      return sendError(res, "Loan application not found", [], 404);
    }

    // Role security check
    if (req.user.role === "CUSTOMER" && application.userId._id.toString() !== req.user._id.toString()) {
      return sendError(res, "Access denied to this loan dossier", [], 403);
    }

    return sendSuccess(res, "Loan application dossier retrieved", { application });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const {
      productId,
      requestedAmount,
      requestedTenureMonths,
      purpose,
      // Optional customer demographic info to update or create
      customerDetails,
    } = req.body;

    if (!productId || !requestedAmount || !requestedTenureMonths || !purpose) {
      return sendError(res, "Missing mandatory loan application parameters", [], 400);
    }

    const product = await LoanProduct.findById(productId);
    if (!product || !product.isActive) {
      return sendError(res, "Invalid or inactive loan product selected", [], 400);
    }

    // Find or create customer profile
    let customer = await Customer.findOne({ userId: req.user._id });
    if (!customer && customerDetails) {
      customer = await Customer.create({
        userId: req.user._id,
        fullName: customerDetails.fullName || req.user.name,
        dateOfBirth: customerDetails.dateOfBirth || new Date("1995-01-01"),
        gender: customerDetails.gender || "MALE",
        email: req.user.email,
        phone: customerDetails.phone || req.user.phone || "9876543210",
        address: customerDetails.address || {
          street: "Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "India",
        },
        panNumber: (customerDetails.panNumber || "ABCDE1234F").toUpperCase(),
        idProofNumber: customerDetails.idProofNumber || "ID-12345678",
        employment: customerDetails.employment || {
          employmentType: "SALARIED",
          employerName: "Tech Enterprise",
          monthlyIncome: 50000,
          existingEmiObligations: 0,
          experienceYears: 3,
        },
      });
    } else if (!customer) {
      return sendError(
        res,
        "Customer profile must be completed before submitting an application.",
        [],
        400
      );
    }

    const applicationNumber = await generateApplicationNumber();

    const application = await LoanApplication.create({
      applicationNumber,
      customerId: customer._id,
      userId: req.user._id,
      productId: product._id,
      requestedAmount: Number(requestedAmount),
      requestedTenureMonths: Number(requestedTenureMonths),
      purpose,
      status: "DOCUMENT_PENDING",
    });

    await logStatusChange({
      applicationId: application._id,
      previousStatus: "APPLICATION_CREATED",
      newStatus: "DOCUMENT_PENDING",
      action: "APPLICATION_INITIATED",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Direct application ${applicationNumber} submitted by customer. Awaiting document uploads.`,
      notifyUser: req.user._id,
      notifyTitle: "Application Created",
      notifyMessage: `Your loan application ${applicationNumber} has been created. Please upload required verification documents.`,
    });

    return sendSuccess(
      res,
      `Application ${applicationNumber} created successfully.`,
      { application },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      return sendError(res, "Application not found", [], 404);
    }

    // Assign officer or manager
    const { assignedOfficerId, assignedManagerId, purpose } = req.body;
    if (assignedOfficerId) application.assignedOfficerId = assignedOfficerId;
    if (assignedManagerId) application.assignedManagerId = assignedManagerId;
    if (purpose) application.purpose = purpose;

    await application.save();

    return sendSuccess(res, "Application updated", { application });
  } catch (error) {
    next(error);
  }
};
