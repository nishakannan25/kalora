import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { config } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { ArtisanUserModel } from "../models/ArtisanModels";
import { CustomerUserModel } from "../models/CustomerModels";

export class AuthService {
  private generateToken(user: { id: string; role: string; email?: string | null }) {
    const payload = { id: user.id, role: user.role, email: user.email };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async registerArtisan(data: {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
    preferredLanguage?: string;
    location?: string;
    craftCategory?: string;
  }) {
    if (!data.email && !data.phone) {
      throw new AppError("Email or phone number is required for registration", 400);
    }

    if (data.email) {
      const existing = await prisma.user.findFirst({ where: { email: data.email } });
      if (existing) throw new AppError("User with this email already exists", 400);
    }

    if (data.phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: data.phone } });
      if (existingPhone) throw new AppError("User with this phone number already exists", 400);
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        passwordHash: passwordHash || null,
        role: "ARTISAN",
        preferredLanguage: data.preferredLanguage || "en",
        location: data.location || null,
        craftCategory: data.craftCategory || null,
        isGoogleUser: true
      }
    });

    // 🍃 PERSIST TO MONGODB ATLAS (kalora_artisan_db -> artisans)
    try {
      await ArtisanUserModel.create({
        artisanId: user.id,
        name: user.name,
        email: user.email || `${user.phone}@kalora.org`,
        phone: user.phone || 'N/A',
        location: user.location || 'Kanchipuram, Tamil Nadu',
        craftCategory: user.craftCategory || 'HANDLOOM_SAREE',
        qrPassportHash: `KALORA-QR-PASSPORT-${Math.floor(10000000 + Math.random() * 90000000)}`,
        qrPassportValidUntil: '2031-09-21'
      });
      console.log('🍃 Successfully persisted Artisan registration into MongoDB Atlas [kalora_artisan_db -> artisans]');
    } catch (mongoErr) {
      console.error('⚠️ Mongo Atlas Artisan persistence warning:', mongoErr);
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async registerBuyer(data: {
    name: string;
    email: string;
    password?: string;
    preferredLanguage?: string;
    address?: string;
  }) {
    const existing = await prisma.user.findFirst({ where: { email: data.email } });
    if (existing) throw new AppError("User with this email already exists", 400);

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: passwordHash || null,
        role: "BUYER",
        preferredLanguage: data.preferredLanguage || "en",
        isGoogleUser: true
      }
    });

    // 🍃 PERSIST TO MONGODB ATLAS (kalora_customer_db -> customers)
    try {
      await CustomerUserModel.create({
        customerId: user.id,
        name: user.name,
        email: user.email || 'customer@kalora.com',
        address: data.address || '12 Weaver Street, Chennai - 600028'
      });
      console.log('🍃 Successfully persisted Customer registration into MongoDB Atlas [kalora_customer_db -> customers]');
    } catch (mongoErr) {
      console.error('⚠️ Mongo Atlas Customer persistence warning:', mongoErr);
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(identifier: string, password?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }]
      }
    });

    if (!user) {
      throw new AppError("Invalid email/phone or password", 401);
    }

    if (user.passwordHash) {
      if (!password) throw new AppError("Password is required", 400);
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) throw new AppError("Invalid email/phone or password", 401);
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async googleAuth(idToken: string, role: string = "ARTISAN") {
    if (!config.googleClientId) {
      return {
        available: false,
        message: "Google Sign-In backend verification is not configured. Please use Email/Phone or set GOOGLE_CLIENT_ID."
      };
    }
    throw new AppError("Google authentication verification pending client configuration", 501);
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
