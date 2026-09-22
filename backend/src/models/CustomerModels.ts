import { Schema, Document } from 'mongoose';
import { customerDbConnection } from '../config/mongoConnections';

// ----------------------------------------------------
// 1. CUSTOMER USER SCHEMA (kalora_customer_db -> customers)
// ----------------------------------------------------
export interface ICustomerUser extends Document {
  customerId: string;
  name: string;
  email: string;
  address: string;
  registeredAt: Date;
}

const CustomerUserSchema = new Schema<ICustomerUser>({
  customerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
});

// ----------------------------------------------------
// 2. CUSTOMER WISHLIST SCHEMA (kalora_customer_db -> customer_wishlists)
// ----------------------------------------------------
export interface ICustomerWishlist extends Document {
  customerId: string;
  productIds: string[];
  updatedAt: Date;
}

const CustomerWishlistSchema = new Schema<ICustomerWishlist>({
  customerId: { type: String, required: true, unique: true },
  productIds: [{ type: String }],
  updatedAt: { type: Date, default: Date.now },
});

// ----------------------------------------------------
// 3. CUSTOMER ORDER SCHEMA (kalora_customer_db -> customer_orders)
// ----------------------------------------------------
export interface ICustomerOrder extends Document {
  orderId: string;
  customerId: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    artisanName: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  qrPassportHash: string;
  status: string;
  createdAt: Date;
}

const CustomerOrderSchema = new Schema<ICustomerOrder>({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      artisanName: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  qrPassportHash: { type: String, required: true },
  status: { type: String, default: 'CONFIRMED' },
  createdAt: { type: Date, default: Date.now },
});

// ----------------------------------------------------
// 4. CUSTOMER SUPPORT TICKET / DAMAGE SCHEMA (kalora_customer_db -> support_tickets)
// ----------------------------------------------------
export interface ISupportTicket extends Document {
  ticketId: string;
  customerId: string;
  customerName: string;
  artisanId?: string;
  artisanName?: string;
  issueCategory: 'DAMAGE' | 'AUTHENTICITY' | 'DELIVERY';
  subject: string;
  details: string;
  status: string;
  createdAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
  ticketId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  artisanId: { type: String },
  artisanName: { type: String },
  issueCategory: { type: String, required: true, enum: ['DAMAGE', 'AUTHENTICITY', 'DELIVERY'] },
  subject: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, default: 'OPEN_DISPATCHED_TO_ARTISAN' },
  createdAt: { type: Date, default: Date.now },
});

// ----------------------------------------------------
// 5. CUSTOMER CART SCHEMA (kalora_customer_db -> customer_carts)
// ----------------------------------------------------
export interface ICustomerCart extends Document {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  updatedAt: Date;
}

const CustomerCartSchema = new Schema<ICustomerCart>({
  customerId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

// Register models strictly on customerDbConnection
export const CustomerUserModel = customerDbConnection.model<ICustomerUser>('CustomerUser', CustomerUserSchema, 'customers');
export const CustomerWishlistModel = customerDbConnection.model<ICustomerWishlist>('CustomerWishlist', CustomerWishlistSchema, 'customer_wishlists');
export const CustomerCartModel = customerDbConnection.model<ICustomerCart>('CustomerCart', CustomerCartSchema, 'customer_carts');
export const CustomerOrderModel = customerDbConnection.model<ICustomerOrder>('CustomerOrder', CustomerOrderSchema, 'customer_orders');
export const SupportTicketModel = customerDbConnection.model<ISupportTicket>('SupportTicket', SupportTicketSchema, 'support_tickets');
