import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Error Middleware
import { notFoundHandler, globalErrorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const defaultOrigins = [
  "https://loan-flow-dkte.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, "");

      try {
        const parsed = new URL(origin);
        if (
          allowedOrigins.includes(normalizedOrigin) ||
          parsed.hostname.endsWith(".vercel.app") ||
          parsed.hostname === "localhost" ||
          parsed.hostname === "127.0.0.1" ||
          process.env.NODE_ENV !== "production"
        ) {
          return callback(null, true);
        }
      } catch {
        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Root status check
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    app: "LOANFLOW API",
    version: "1.0.0",
    healthCheck: "/api/health",
  });
});

// Serve static uploaded documents
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
app.use("/uploads", express.static(uploadDir));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    app: "LOANFLOW API",
    version: "1.0.0",
    timestamp: new Date(),
  });
});

// Mount modular API routers
app.use("/api/auth", authRoutes);
app.use("/api/loan-products", productRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Catch 404
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
