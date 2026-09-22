import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit3, Trash2, Tag, QrCode, ShoppingBag } from 'lucide-react';
import { ProductCartQrModal, CartItemQrData } from './ProductCartQrModal';

interface ProductListProps {
  onAddCraft: () => void;
  onEditCraft: (product: any) => void;
  onRefreshStats?: (products: any[]) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onAddCraft, onEditCraft, onRefreshStats }) => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeQrItem, setActiveQrItem] = useState<CartItemQrData | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    let remote: any[] = [];
    try {
      const res = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        remote = data.data;
      }
    } catch (err: any) {
      console.warn('API fetch error in ProductList:', err);
    } finally {
      const currentUserId = user?.id;
      const local = JSON.parse(localStorage.getItem('kalora_products') || '[]');
      const userLocal = currentUserId ? local.filter((p: any) => p.artisanId === currentUserId) : [];
      const userRemote = currentUserId ? remote.filter((p: any) => p.artisanId === currentUserId) : remote;

      const combined = [...userLocal, ...userRemote];
      const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
      setProducts(unique);
      if (onRefreshStats) {
        onRefreshStats(unique);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this craft product?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete product');
      }
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateCartQr = (item: any) => {
    const createdAtDate = item.createdAt ? new Date(item.createdAt) : new Date();
    const now = new Date();

    const mfgDateString = createdAtDate.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    });

    const addedToCartString = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST`;

    setActiveQrItem({
      cartItemId: item.id || `cart_${Date.now()}`,
      productId: item.id,
      productName: item.productName || 'Handmade Artisan Craft',
      category: item.category,
      price: Number(item.price) || 999,
      artisanArea: user?.location || 'Kanchipuram Craft Cluster, Tamil Nadu',
      manufacturingDate: mfgDateString,
      addedToCartTimestamp: addedToCartString,
      craftMaterial: item.material || 'Organic Pure Handloom',
      technique: item.craftTechnique || 'Heritage Artisan Method'
    });
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-stone-500 font-medium">
        Loading your craft products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white border border-dashed border-stone-300 rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-terracotta-50 text-terracotta-600 flex items-center justify-center mx-auto shadow-inner">
          <Tag className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-2xl text-stone-900">No products yet.</h3>
          <p className="text-stone-500 text-sm max-w-md mx-auto mt-1">
            Let's add your first craft to start reaching buyers across India and globally.
          </p>
        </div>
        <button
          onClick={onAddCraft}
          className="inline-flex items-center space-x-2 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold px-6 py-3 rounded-full shadow-md transition-all text-sm"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Add My Craft</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeQrItem && (
        <ProductCartQrModal
          item={activeQrItem}
          onClose={() => setActiveQrItem(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-serif font-bold text-stone-900 text-xl">My Crafts ({products.length})</h3>
          <p className="text-xs text-stone-500">Manage your published products and generate unique cart QR verification codes</p>
        </div>
        <button
          onClick={onAddCraft}
          className="inline-flex items-center space-x-2 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md transition-all text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add My Craft</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center space-x-2">
          <Tag className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Craft Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((item) => {
          const primaryImg = item.images && item.images.length > 0 ? item.images[0].originalUrl : null;
          const isDraft = item.status === 'DRAFT';

          return (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-stone-100 border-b border-stone-100 flex items-center justify-center overflow-hidden">
                  {primaryImg ? (
                    <img src={primaryImg} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-stone-400 flex flex-col items-center">
                      <Tag className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">No Photo</span>
                    </div>
                  )}

                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                      isDraft
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2">
                  <h4 className="font-serif font-bold text-stone-900 text-lg leading-tight line-clamp-1">
                    {item.productName}
                  </h4>
                  <p className="text-xs text-terracotta-700 font-semibold">{item.category || 'Handcraft'}</p>
                  {item.price > 0 ? (
                    <p className="text-lg font-bold text-stone-900 font-serif">₹ {item.price}</p>
                  ) : (
                    <p className="text-xs text-stone-400 italic">Price not specified</p>
                  )}
                  {item.material && (
                    <p className="text-xs text-stone-500 line-clamp-1">Material: {item.material}</p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex justify-between items-center gap-2">
                <button
                  onClick={() => handleGenerateCartQr(item)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-800 border border-terracotta-200 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  title="Generate Unique Cart Verification QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-terracotta-600" />
                  <span>Cart QR</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onEditCraft(item)}
                    className="inline-flex items-center space-x-1 text-stone-700 hover:text-terracotta-700 font-bold text-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 font-bold text-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === item.id ? '...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
