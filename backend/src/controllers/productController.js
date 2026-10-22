import LoanProduct from "../models/LoanProduct.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const getProducts = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === "true" ? { isActive: true } : {};
    const products = await LoanProduct.find(filter).sort({ name: 1 });
    return sendSuccess(res, "Loan products retrieved", { products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await LoanProduct.findById(req.params.id);
    if (!product) {
      return sendError(res, "Loan product not found", [], 404);
    }
    return sendSuccess(res, "Loan product retrieved", { product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      code,
      name,
      description,
      category,
      minAmount,
      maxAmount,
      minTenureMonths,
      maxTenureMonths,
      interestRateAnnual,
      minMonthlyIncome,
      maxDtiPercent,
      processingFeePercent,
    } = req.body;

    if (!code || !name || !category || !minAmount || !maxAmount || !interestRateAnnual) {
      return sendError(res, "Missing required product definition fields.", [], 400);
    }

    const existing = await LoanProduct.findOne({ code: code.toUpperCase() });
    if (existing) {
      return sendError(res, `A product with code '${code}' already exists.`, [], 409);
    }

    const product = await LoanProduct.create({
      code: code.toUpperCase(),
      name,
      description,
      category,
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
      minTenureMonths: Number(minTenureMonths) || 12,
      maxTenureMonths: Number(maxTenureMonths) || 60,
      interestRateAnnual: Number(interestRateAnnual),
      minMonthlyIncome: Number(minMonthlyIncome) || 20000,
      maxDtiPercent: Number(maxDtiPercent) || 50,
      processingFeePercent: Number(processingFeePercent) || 1.0,
      isActive: true,
    });

    return sendSuccess(res, "Loan product created successfully", { product }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await LoanProduct.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      return sendError(res, "Loan product not found", [], 404);
    }
    return sendSuccess(res, "Loan product updated successfully", { product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    // Soft delete
    const product = await LoanProduct.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return sendError(res, "Loan product not found", [], 404);
    }
    return sendSuccess(res, "Loan product deactivated successfully", { product });
  } catch (error) {
    next(error);
  }
};
