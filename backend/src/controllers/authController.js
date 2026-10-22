import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET || "loanflow_default_secret_key",
    { expiresIn: "7d" }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required.", [], 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, "An account with this email already exists.", [], 409);
    }

    // Default to CUSTOMER unless created by admin or explicitly requested in demo
    const assignedRole = role && ["CUSTOMER", "LOAN_OFFICER", "MANAGER", "ADMIN"].includes(role)
      ? role
      : "CUSTOMER";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: assignedRole,
    });

    const token = generateToken(user);

    return sendSuccess(
      res,
      "Account registered successfully",
      {
        user,
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Please provide email and password.", [], 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, "Invalid email or password.", [], 401);
    }

    if (!user.isActive) {
      return sendError(res, "This account has been deactivated. Contact your administrator.", [], 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password.", [], 401);
    }

    const token = generateToken(user);

    // If customer, fetch linked profile if exists
    let customerProfile = null;
    if (user.role === "CUSTOMER") {
      customerProfile = await Customer.findOne({ userId: user._id });
    }

    return sendSuccess(res, "Login successful", {
      user,
      customerProfile,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    let customerProfile = null;
    if (req.user.role === "CUSTOMER") {
      customerProfile = await Customer.findOne({ userId: req.user._id });
    }

    return sendSuccess(res, "Current user profile fetched", {
      user: req.user,
      customerProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return sendSuccess(res, "Users fetched successfully", { users });
  } catch (error) {
    next(error);
  }
};
