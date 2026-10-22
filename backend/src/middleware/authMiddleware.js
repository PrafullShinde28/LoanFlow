import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError } from "../utils/responseFormatter.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authentication required. Please log in.", [], 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "loanflow_default_secret_key";

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return sendError(res, "User session invalid or account inactive", [], 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Session has expired. Please log in again.", [], 401);
    }
    return sendError(res, "Invalid authentication token", [], 401);
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required", [], 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
        [],
        403
      );
    }

    next();
  };
};
