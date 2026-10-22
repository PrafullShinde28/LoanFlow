import express from "express";
import {
  verifyDocument,
  rejectDocument,
  serveDocument,
} from "../controllers/documentController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/:id/verify", requireAuth, requireRole("LOAN_OFFICER", "MANAGER", "ADMIN"), verifyDocument);
router.put("/:id/reject", requireAuth, requireRole("LOAN_OFFICER", "MANAGER", "ADMIN"), rejectDocument);
router.get("/:id/file", serveDocument);

export default router;
