import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "KALORA Backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

export default router;
