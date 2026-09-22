import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  jwtSecret: process.env.JWT_SECRET || "kalora-super-secret-jwt-key-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  googleClientId: process.env.GOOGLE_CLIENT_ID || ""
};
