import { Router } from "express";
import { authenticateJWT, optionalAuthenticateJWT } from "../middleware/auth";
import {
  createProduct,
  getArtisanProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  processImage
} from "../controllers/product.controller";

const router = Router();

// Public / Guest accessible routes
router.post("/process-image", optionalAuthenticateJWT, processImage);
router.get("/", optionalAuthenticateJWT, getArtisanProducts);
router.get("/:id", optionalAuthenticateJWT, getProductById);

// Authenticated product management routes (mutations)
router.use(authenticateJWT);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
