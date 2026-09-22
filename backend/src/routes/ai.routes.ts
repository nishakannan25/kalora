import { Router } from "express";
import { transcribeAudio, translateText } from "../controllers/ai.controller";
import { optionalAuthenticateJWT } from "../middleware/auth";

const router = Router();

router.use(optionalAuthenticateJWT);
router.post("/transcribe", transcribeAudio);
router.post("/translate", translateText);

export default router;
