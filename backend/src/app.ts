import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.routes";
import productRoutes from "./routes/product.routes";
import aiRoutes from "./routes/ai.routes";
import syncRoutes from "./routes/sync.routes";

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(requestLogger);

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sync", syncRoutes);

app.use(errorHandler);

export default app;
