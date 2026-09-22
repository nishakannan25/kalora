import { Request, Response } from 'express';
import { ArtisanAlertModel, ArtisanUserModel, CraftProductModel } from '../models/ArtisanModels';

// Get all registered artisans
export const getRegisteredArtisans = async (req: Request, res: Response) => {
  try {
    const artisans = await ArtisanUserModel.find().select('-qrPassportHash');
    return res.status(200).json({ success: true, count: artisans.length, data: artisans });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Dispatch a notification alert to an artisan from customer action
export const dispatchArtisanAlert = async (req: Request, res: Response) => {
  try {
    const { artisanId, type, title, message, customerName, productName, amount, ticketId } = req.body;

    if (!artisanId || !type || !title || !message) {
      return res.status(400).json({ success: false, message: 'Missing required alert fields' });
    }

    const alertId = `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newAlert = await ArtisanAlertModel.create({
      alertId,
      artisanId,
      type,
      title,
      message,
      customerName: customerName || 'Verified Customer',
      productName,
      amount,
      ticketId,
      createdAt: new Date()
    });

    return res.status(201).json({ success: true, data: newAlert });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch notifications for a specific artisan
export const getArtisanAlerts = async (req: Request, res: Response) => {
  try {
    const { artisanId } = req.params;
    const alerts = await ArtisanAlertModel.find({ artisanId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Customer Cart & Wishlist Mongo Persistence
import { CustomerCartModel, CustomerWishlistModel } from '../models/CustomerModels';

export const saveCustomerCart = async (req: Request, res: Response) => {
  try {
    const { customerId, items } = req.body;
    if (!customerId) return res.status(400).json({ success: false, message: 'Missing customerId' });

    const cart = await CustomerCartModel.findOneAndUpdate(
      { customerId },
      { customerId, items: items || [], updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, data: cart });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerCart = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const cart = await CustomerCartModel.findOne({ customerId });
    return res.status(200).json({ success: true, data: cart ? cart.items : [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveCustomerWishlist = async (req: Request, res: Response) => {
  try {
    const { customerId, productIds } = req.body;
    if (!customerId) return res.status(400).json({ success: false, message: 'Missing customerId' });

    const wishlist = await CustomerWishlistModel.findOneAndUpdate(
      { customerId },
      { customerId, productIds: productIds || [], updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, data: wishlist });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerWishlist = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const wishlist = await CustomerWishlistModel.findOne({ customerId });
    return res.status(200).json({ success: true, data: wishlist ? wishlist.productIds : [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
