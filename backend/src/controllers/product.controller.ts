import { Response, NextFunction } from "express";
import { productService } from "../services/product.service";
import { imageProcessingService } from "../services/imageProcessing.service";
import { AuthenticatedRequest } from "../middleware/auth";

export async function createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const artisanId = req.user!.id;
    const product = await productService.createProduct(artisanId, req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function getArtisanProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const artisanId = req.user?.id;
    const products = artisanId 
      ? await productService.getArtisanProducts(artisanId)
      : await productService.getPublicProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const artisanId = req.user?.id;
    const productId = req.params.id;
    const product = artisanId 
      ? await productService.getProductById(artisanId, productId)
      : await productService.getPublicProductById(productId);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const artisanId = req.user!.id;
    const productId = req.params.id;
    const product = await productService.updateProduct(artisanId, productId, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const artisanId = req.user!.id;
    const productId = req.params.id;
    const result = await productService.deleteProduct(artisanId, productId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function processImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { image, blurThreshold } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: "Image data is required" });
    }
    const result = await imageProcessingService.processImage(image, blurThreshold);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
