import { Router } from "express";
import { registerArtisan, registerBuyer, login, googleAuth, getMe, sendOtp, verifyOtp } from "../controllers/auth.controller";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register/artisan", registerArtisan);
router.post("/register-artisan", registerArtisan);
router.post("/register/buyer", registerBuyer);
router.post("/register-buyer", registerBuyer);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", authenticateJWT, getMe);

export default router;
