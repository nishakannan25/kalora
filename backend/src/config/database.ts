import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established via Prisma.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}
