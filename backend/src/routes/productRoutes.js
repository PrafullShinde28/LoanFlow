import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", requireAuth, requireRole("ADMIN"), createProduct);
router.put("/:id", requireAuth, requireRole("ADMIN"), updateProduct);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteProduct);

export default router;
