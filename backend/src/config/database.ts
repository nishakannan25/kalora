import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDB() {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      console.log("✅ Database connection established via Prisma.");
    } else {
      console.log("ℹ️ Cloud Environment: Prisma SQLite fallback bypassed (using MongoDB Dual DB mode).");
    }
  } catch (error) {
    console.warn("⚠️ Primary Prisma DB connection warning (operating on MongoDB dual-DB mode):", error);
  }
}
