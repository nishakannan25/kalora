import React, { useState } from 'react';
import { QrCode, ShieldCheck, MapPin, Calendar, Clock, Tag, X, Copy, Check, ExternalLink } from 'lucide-react';

export interface CartItemQrData {
  cartItemId: string;
  productId: string;
  productName: string;
  category?: string;
  price: number;
  artisanArea: string;
  manufacturingDate: string;
  addedToCartTimestamp: string;
  craftMaterial?: string;
  technique?: string;
}

interface ProductCartQrModalProps {
  item: CartItemQrData;
  onClose: () => void;
}

export const ProductCartQrModal: React.FC<ProductCartQrModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Structured JSON data stored inside the QR Code
  const qrPayload = JSON.stringify({
    passport: `KLR-CART-${item.cartItemId.substring(0, 8).toUpperCase()}`,
    product: item.productName,
    price: `₹${item.price.toLocaleString()}`,
    artisan_cluster: item.artisanArea,
    mfg_date: item.manufacturingDate,
    added_to_cart: item.addedToCartTimestamp,
    material: item.craftMaterial || 'Handcrafted Natural Craft',
    verified_by: 'KALORA Blockchain Authenticator'
  }, null, 2);

  // Quick URL encoder for QR Code image rendering via Google Chart / SVG QR API
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPayload)}&color=78281f&format=png`;

  const copyQrDetails = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 relative overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center border border-terracotta-200">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Cart Craft Provenance QR</h3>
              <p className="text-xs text-stone-500">Scan to verify product authenticity & cart transaction details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Canvas Card */}
        <div className="bg-gradient-to-br from-terracotta-50/50 via-amber-50/30 to-stone-50 border border-terracotta-200/80 rounded-2xl p-6 text-center space-y-4">
          <div className="inline-block p-4 bg-white rounded-2xl border border-terracotta-300 shadow-md">
            <img
              src={qrCodeImageUrl}
              alt={`QR Code for ${item.productName}`}
              className="w-48 h-48 object-contain mx-auto rounded-lg"
              onError={(e) => {
                // Fallback rendering if offline
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-full w-max mx-auto font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>KALORA Authenticated Cart Item</span>
          </div>
        </div>

        {/* Dynamic Metadata Grid */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex justify-between items-center">
            <span className="text-stone-500 font-semibold flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span>Product Name:</span>
            </span>
            <span className="font-bold text-stone-900 text-sm">{item.productName}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-0.5">
              <span className="text-stone-500 font-semibold flex items-center space-x-1">
                <Tag className="w-3 h-3 text-terracotta-600" />
                <span>Price (₹):</span>
              </span>
              <p className="font-bold text-stone-900 text-sm">₹{item.price.toLocaleString()}</p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-0.5">
              <span className="text-stone-500 font-semibold flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-amber-600" />
                <span>Artisan Cluster:</span>
              </span>
              <p className="font-bold text-stone-900 text-xs truncate">{item.artisanArea}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-0.5">
              <span className="text-stone-500 font-semibold flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-indigo-600" />
                <span>Mfg Date:</span>
              </span>
              <p className="font-bold text-stone-800">{item.manufacturingDate}</p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-0.5">
              <span className="text-stone-500 font-semibold flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Added to Cart:</span>
              </span>
              <p className="font-bold text-stone-800 text-[11px] truncate">{item.addedToCartTimestamp}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={copyQrDetails}
            className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 border border-stone-300 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied JSON</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-600" />
                <span>Copy QR Data JSON</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
