import { Schema, Document } from 'mongoose';
import { artisanDbConnection } from '../config/mongoConnections';

// ----------------------------------------------------
// 1. ARTISAN USER SCHEMA (kalora_artisan_db -> artisans)
// ----------------------------------------------------
export interface IArtisanUser extends Document {
  artisanId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  craftCategory: 'HANDLOOM_SAREE' | 'POTTERY' | 'FURNITURE';
  qrPassportHash: string;
  qrPassportValidUntil: string;
  createdAt: Date;
}

const ArtisanUserSchema = new Schema<IArtisanUser>({
  artisanId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  craftCategory: { 
    type: String, 
    required: true, 
    enum: ['HANDLOOM_SAREE', 'POTTERY', 'FURNITURE', 'WOODWORK', 'WEAVING_TEXTILES', 'HERITAGE_CRAFT', 'EMBROIDERY'] 
  },
  qrPassportHash: { type: String, required: true },
  qrPassportValidUntil: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ----------------------------------------------------
// 2. CRAFT PRODUCT SCHEMA (kalora_artisan_db -> craft_products)
// ----------------------------------------------------
export interface ICraftProduct extends Document {
  productId: string;
  artisanId: string;
  artisanName: string;
  artisanLocation: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  craftDetails: string;
  isAiEnhanced: boolean;
  createdAt: Date;
}

const CraftProductSchema = new Schema<ICraftProduct>({
  productId: { type: String, required: true, unique: true },
  artisanId: { type: String, required: true },
  artisanName: { type: String, required: true },
  artisanLocation: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  image: { type: String, required: true },
  craftDetails: { type: String, required: true },
  isAiEnhanced: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// ----------------------------------------------------
// 3. ARTISAN NOTIFICATION SCHEMA (kalora_artisan_db -> artisan_alerts)
// ----------------------------------------------------
export interface IArtisanAlert extends Document {
  alertId: string;
  artisanId: string;
  type: 'PURCHASE' | 'DAMAGE_TICKET' | 'INQUIRY' | 'WISHLIST' | 'CART_ADD' | 'REVIEW';
  title: string;
  message: string;
  customerName: string;
  productName?: string;
  amount?: number;
  ticketId?: string;
  createdAt: Date;
}

const ArtisanAlertSchema = new Schema<IArtisanAlert>({
  alertId: { type: String, required: true, unique: true },
  artisanId: { type: String, required: true },
  type: { type: String, required: true, enum: ['PURCHASE', 'DAMAGE_TICKET', 'INQUIRY', 'WISHLIST', 'CART_ADD', 'REVIEW'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  customerName: { type: String, required: true },
  productName: { type: String },
  amount: { type: Number },
  ticketId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Register models strictly on artisanDbConnection
export const ArtisanUserModel = artisanDbConnection.model<IArtisanUser>('ArtisanUser', ArtisanUserSchema, 'artisans');
export const CraftProductModel = artisanDbConnection.model<ICraftProduct>('CraftProduct', CraftProductSchema, 'craft_products');
export const ArtisanAlertModel = artisanDbConnection.model<IArtisanAlert>('ArtisanAlert', ArtisanAlertSchema, 'artisan_alerts');
