import express from "express";
import {
  getCustomerDashboard,
  getOfficerDashboard,
  getManagerDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/customer", requireAuth, requireRole("CUSTOMER"), getCustomerDashboard);
router.get("/officer", requireAuth, requireRole("LOAN_OFFICER", "ADMIN"), getOfficerDashboard);
router.get("/manager", requireAuth, requireRole("MANAGER", "ADMIN"), getManagerDashboard);
router.get("/admin", requireAuth, requireRole("ADMIN"), getAdminDashboard);

export default router;
