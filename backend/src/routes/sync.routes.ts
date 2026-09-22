import { Router } from "express";
import { 
  getRegisteredArtisans, 
  dispatchArtisanAlert, 
  getArtisanAlerts,
  saveCustomerCart,
  getCustomerCart,
  saveCustomerWishlist,
  getCustomerWishlist
} from "../controllers/sync.controller";

const router = Router();

router.get("/artisans", getRegisteredArtisans);
router.post("/alerts", dispatchArtisanAlert);
router.get("/alerts/:artisanId", getArtisanAlerts);

// Customer Cart & Wishlist Routes
router.post("/cart", saveCustomerCart);
router.get("/cart/:customerId", getCustomerCart);
router.post("/wishlist", saveCustomerWishlist);
router.get("/wishlist/:customerId", getCustomerWishlist);

export default router;
