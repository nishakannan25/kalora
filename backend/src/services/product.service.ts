import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

export interface CreateProductDto {
  productName: string;
  category?: string;
  material?: string;
  color?: string;
  size?: string;
  dimensions?: string;
  weight?: string;
  productionMethod?: string;
  productionTime?: string;
  craftTechnique?: string;
  region?: string;
  artisanStory?: string;
  description?: string;
  price?: number;
  status?: "DRAFT" | "PROCESSING" | "READY" | "PUBLISHED";
  images?: { originalUrl: string; isPrimary?: boolean }[];
  artisanName?: string;
  artisanLocation?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export class ProductService {
  async createProduct(artisanId: string, data: CreateProductDto) {
    if (!data.productName || data.productName.trim() === "") {
      throw new AppError("Product name is required", 400);
    }

    // Ensure artisan User record exists in SQLite database to satisfy foreign key constraint
    await prisma.user.upsert({
      where: { id: artisanId },
      update: {},
      create: {
        id: artisanId,
        name: "Artisan User",
        email: `${artisanId}@kalora.org`,
        role: "ARTISAN",
        preferredLanguage: "en"
      }
    });

    const product = await prisma.product.create({
      data: {
        artisanId,
        productName: data.productName,
        category: data.category || null,
        material: data.material || null,
        color: data.color || null,
        size: data.size || null,
        dimensions: data.dimensions || null,
        weight: data.weight || null,
        productionMethod: data.productionMethod || null,
        productionTime: data.productionTime || null,
        craftTechnique: data.craftTechnique || null,
        region: data.region || null,
        artisanStory: data.artisanStory || null,
        description: data.description || null,
        price: data.price !== undefined ? data.price : 0,
        status: data.status || "DRAFT",
        images: data.images && data.images.length > 0 ? {
          create: data.images.map(img => ({
            originalUrl: img.originalUrl,
            isPrimary: img.isPrimary || false
          }))
        } : undefined
      },
      include: {
        images: true
      }
    });

    // Also persist to MongoDB kalora_artisan_db -> craft_products for real-time customer store access
    try {
      const artisanUser = await prisma.user.findUnique({ where: { id: artisanId } });
      const { CraftProductModel } = require("../models/ArtisanModels");
      await CraftProductModel.findOneAndUpdate(
        { productId: product.id },
        {
          productId: product.id,
          artisanId: artisanId,
          artisanName: artisanUser?.name || data.artisanName || "Master Artisan",
          artisanLocation: artisanUser?.location || data.region || "Tamil Nadu Heritage Cluster",
          name: data.productName,
          category: data.category || "WEAVING_TEXTILES",
          price: Number(data.price) || 3850,
          originalPrice: Math.round((Number(data.price) || 3850) * 1.3),
          image: data.images && data.images[0] ? data.images[0].originalUrl : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
          craftDetails: data.description || data.craftTechnique || "Authentic Handcrafted Artisan Item",
          isAiEnhanced: true,
          createdAt: new Date()
        },
        { upsert: true }
      );
    } catch (mongoErr) {
      console.warn("MongoDB craft_products persist notice:", mongoErr);
    }

    return product;
  }

  async getArtisanProducts(artisanId: string) {
    return prisma.product.findMany({
      where: { artisanId },
      include: { images: true },
      orderBy: { updatedAt: "desc" }
    });
  }

  async getProductById(artisanId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (product.artisanId !== artisanId) {
      throw new AppError("Forbidden: You do not own this product", 403);
    }

    return product;
  }

  async updateProduct(artisanId: string, productId: string, data: UpdateProductDto) {
    await this.getProductById(artisanId, productId); // Ownership check

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        productName: data.productName,
        category: data.category,
        material: data.material,
        color: data.color,
        size: data.size,
        dimensions: data.dimensions,
        weight: data.weight,
        productionMethod: data.productionMethod,
        productionTime: data.productionTime,
        craftTechnique: data.craftTechnique,
        region: data.region,
        artisanStory: data.artisanStory,
        description: data.description,
        price: data.price,
        status: data.status,
        images: data.images ? {
          deleteMany: {},
          create: data.images.map(img => ({
            originalUrl: img.originalUrl,
            isPrimary: img.isPrimary || false
          }))
        } : undefined
      },
      include: { images: true }
    });

    return updated;
  }

  async getPublicProducts() {
    return prisma.product.findMany({
      include: { images: true },
      orderBy: { updatedAt: "desc" }
    });
  }

  async getPublicProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  async deleteProduct(artisanId: string, productId: string) {
    await this.getProductById(artisanId, productId); // Ownership check

    await prisma.product.delete({
      where: { id: productId }
    });

    return { message: "Product deleted successfully" };
  }
}

export const productService = new ProductService();
