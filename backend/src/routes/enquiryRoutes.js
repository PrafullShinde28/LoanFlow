import express from "express";
import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  convertEnquiry,
} from "../controllers/enquiryController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public lead submission
router.post("/", createEnquiry);

// Staff operations
router.get("/", requireAuth, requireRole("LOAN_OFFICER", "MANAGER", "ADMIN"), getEnquiries);
router.get("/:id", requireAuth, requireRole("LOAN_OFFICER", "MANAGER", "ADMIN"), getEnquiryById);
router.put("/:id", requireAuth, requireRole("LOAN_OFFICER", "MANAGER", "ADMIN"), updateEnquiry);
router.post("/:id/convert", requireAuth, requireRole("LOAN_OFFICER", "MANAGER", "ADMIN"), convertEnquiry);

export default router;
