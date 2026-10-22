import LoanApplication from "../models/LoanApplication.js";
import LoanEnquiry from "../models/LoanEnquiry.js";
import LoanProduct from "../models/LoanProduct.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Disbursement from "../models/Disbursement.js";
import ApplicationDocument from "../models/ApplicationDocument.js";
import { sendSuccess } from "../utils/responseFormatter.js";

export const getCustomerDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const applications = await LoanApplication.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    const totalApplications = applications.length;
    const pending = applications.filter((a) =>
      [
        "DOCUMENT_PENDING",
        "DOCUMENT_VERIFICATION",
        "ADDITIONAL_DOCUMENTS_REQUIRED",
        "ELIGIBILITY_CHECK",
        "OFFICER_REVIEW",
        "MANAGER_APPROVAL",
      ].includes(a.status)
    ).length;

    const approved = applications.filter((a) =>
      ["APPROVED", "SANCTIONED", "DISBURSEMENT_PENDING"].includes(a.status)
    ).length;

    const disbursed = applications.filter((a) => a.status === "DISBURSED").length;

    return sendSuccess(res, "Customer dashboard data", {
      stats: {
        totalApplications,
        pending,
        approved,
        disbursed,
      },
      recentApplications: applications.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

export const getOfficerDashboard = async (req, res, next) => {
  try {
    const newEnquiriesCount = await LoanEnquiry.countDocuments({ status: "NEW" });
    const underReviewCount = await LoanApplication.countDocuments({
      status: {
        $in: [
          "DOCUMENT_VERIFICATION",
          "ADDITIONAL_DOCUMENTS_REQUIRED",
          "ELIGIBILITY_CHECK",
          "OFFICER_REVIEW",
        ],
      },
    });
    const docPendingCount = await LoanApplication.countDocuments({
      status: "DOCUMENT_PENDING",
    });
    const eligibilityPendingCount = await LoanApplication.countDocuments({
      status: "DOCUMENT_VERIFICATION",
    });

    // Aggregation: Applications by Status
    const statusAgg = await LoanApplication.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusDistribution = statusAgg.map((s) => ({
      name: s._id.replace(/_/g, " "),
      status: s._id,
      count: s.count,
    }));

    // Aggregation: Applications by Loan Product
    const productAgg = await LoanApplication.aggregate([
      {
        $lookup: {
          from: "loanproducts",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $group: { _id: "$product.name", count: { $sum: 1 } } },
    ]);
    const productDistribution = productAgg.map((p) => ({
      name: p._id,
      count: p.count,
    }));

    const recentApplications = await LoanApplication.find()
      .populate("customerId")
      .populate("productId")
      .sort({ createdAt: -1 })
      .limit(6);

    const pendingEnquiries = await LoanEnquiry.find({ status: { $in: ["NEW", "CONTACTED"] } })
      .populate("loanProductId")
      .sort({ createdAt: -1 })
      .limit(5);

    return sendSuccess(res, "Officer dashboard data", {
      stats: {
        newEnquiries: newEnquiriesCount,
        applicationsUnderReview: underReviewCount,
        documentsPending: docPendingCount,
        eligibilityPending: eligibilityPendingCount,
      },
      statusDistribution,
      productDistribution,
      recentApplications,
      pendingEnquiries,
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerDashboard = async (req, res, next) => {
  try {
    const pendingApprovalsCount = await LoanApplication.countDocuments({
      status: "MANAGER_APPROVAL",
    });
    const approvedCount = await LoanApplication.countDocuments({
      status: { $in: ["APPROVED", "SANCTIONED"] },
    });
    const rejectedCount = await LoanApplication.countDocuments({
      status: "REJECTED",
    });
    const pendingDisbursementCount = await LoanApplication.countDocuments({
      status: "DISBURSEMENT_PENDING",
    });
    const disbursedCount = await LoanApplication.countDocuments({
      status: "DISBURSED",
    });

    const totalDisbursedAgg = await Disbursement.aggregate([
      { $group: { _id: null, total: { $sum: "$disbursedAmount" } } },
    ]);
    const totalDisbursedAmount = totalDisbursedAgg[0]?.total || 0;

    // Approvals vs Rejections
    const approvalComparison = [
      { name: "Approved / Sanctioned", count: approvedCount + disbursedCount },
      { name: "Rejected", count: rejectedCount },
      { name: "Pending Decision", count: pendingApprovalsCount },
    ];

    // Product breakdown
    const productAgg = await LoanApplication.aggregate([
      {
        $lookup: {
          from: "loanproducts",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.name",
          count: { $sum: 1 },
          totalRequested: { $sum: "$requestedAmount" },
        },
      },
    ]);
    const productDistribution = productAgg.map((p) => ({
      name: p._id,
      count: p.count,
      totalRequested: p.totalRequested,
    }));

    // Pending manager approvals list
    const pendingApprovals = await LoanApplication.find({
      status: "MANAGER_APPROVAL",
    })
      .populate("customerId")
      .populate("productId")
      .sort({ updatedAt: -1 })
      .limit(6);

    // Pending disbursements list
    const pendingDisbursements = await LoanApplication.find({
      status: "DISBURSEMENT_PENDING",
    })
      .populate("customerId")
      .populate("productId")
      .sort({ updatedAt: -1 })
      .limit(6);

    return sendSuccess(res, "Manager dashboard data", {
      stats: {
        pendingApprovals: pendingApprovalsCount,
        approved: approvedCount,
        rejected: rejectedCount,
        pendingDisbursement: pendingDisbursementCount,
        disbursed: disbursedCount,
        totalDisbursedAmount,
      },
      approvalComparison,
      productDistribution,
      pendingApprovals,
      pendingDisbursements,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalApplications = await LoanApplication.countDocuments();
    const pending = await LoanApplication.countDocuments({
      status: {
        $in: [
          "DOCUMENT_PENDING",
          "DOCUMENT_VERIFICATION",
          "ADDITIONAL_DOCUMENTS_REQUIRED",
          "ELIGIBILITY_CHECK",
          "OFFICER_REVIEW",
          "MANAGER_APPROVAL",
        ],
      },
    });
    const approved = await LoanApplication.countDocuments({
      status: { $in: ["APPROVED", "SANCTIONED", "DISBURSEMENT_PENDING"] },
    });
    const rejected = await LoanApplication.countDocuments({ status: "REJECTED" });
    const disbursed = await LoanApplication.countDocuments({ status: "DISBURSED" });

    const totalDisbursedAgg = await Disbursement.aggregate([
      { $group: { _id: null, total: { $sum: "$disbursedAmount" } } },
    ]);
    const totalDisbursedAmount = totalDisbursedAgg[0]?.total || 0;

    const statusAgg = await LoanApplication.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusDistribution = statusAgg.map((s) => ({
      name: s._id.replace(/_/g, " "),
      count: s.count,
    }));

    const productAgg = await LoanApplication.aggregate([
      {
        $lookup: {
          from: "loanproducts",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $group: { _id: "$product.name", count: { $sum: 1 } } },
    ]);
    const productDistribution = productAgg.map((p) => ({
      name: p._id,
      count: p.count,
    }));

    const recentApplications = await LoanApplication.find()
      .populate("customerId")
      .populate("productId")
      .sort({ createdAt: -1 })
      .limit(8);

    return sendSuccess(res, "Admin dashboard data", {
      stats: {
        totalCustomers,
        totalApplications,
        pending,
        approved,
        rejected,
        disbursed,
        totalDisbursedAmount,
      },
      statusDistribution,
      productDistribution,
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};
