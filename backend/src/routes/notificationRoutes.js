import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getNotifications);
router.put("/read-all", requireAuth, markAllNotificationsRead);
router.put("/:id/read", requireAuth, markNotificationRead);

export default router;
