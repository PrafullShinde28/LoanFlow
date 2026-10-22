import { sendError } from "../utils/responseFormatter.js";

export const notFoundHandler = (req, res, next) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, [], 404);
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.name || "ServerError"}:`, err.message);

  // Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, "File size exceeds the 5MB maximum limit.", [], 400);
    }
    return sendError(res, `File upload error: ${err.message}`, [], 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errorList = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, "Validation failed", errorList, 422);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return sendError(res, `A record with this ${field} already exists.`, [{ field, message: "Duplicate value" }], 409);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return sendError(res, `Resource not found with specified identifier (${err.value})`, [], 404);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === "production"
    ? "An unexpected internal server error occurred."
    : err.message || "Internal server error";

  return sendError(res, message, [], statusCode);
};
