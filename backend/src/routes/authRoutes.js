import express from "express";
import { register, login, getMe, getAllUsers } from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.get("/users", requireAuth, requireRole("ADMIN", "MANAGER"), getAllUsers);

export default router;
