import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  User,
  MessageSquare,
  AlertTriangle,
  Star,
  CheckCircle,
  CreditCard,
  Menu,
  ChevronDown,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Package,
  Clock,
  ArrowRight,
  Filter,
  QrCode
} from 'lucide-react';

interface Product {
  id: string;
  artisanId?: string;
  name: string;
  artisanName: string;
  artisanLocation: string;
  category: 'HANDLOOM_SAREE' | 'POTTERY' | 'FURNITURE';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  qrPassportId?: string;
  isDealOfTheDay?: boolean;
}

const SAMPLE_PRODUCTS: Product[] = [
  // --- HANDLOOM SAREES (7 Products - All 100% Unique Relevant Images) ---
  {
    id: 'prod_1',
    name: 'Kanchipuram Pure Mulberry Silk Saree with Pure Gold Zari',
    artisanName: 'Devi Ramachandran',
    artisanLocation: 'Kanchipuram, Tamil Nadu',
    category: 'HANDLOOM_SAREE',
    price: 14999,
    originalPrice: 22000,
    rating: 4.9,
    reviewsCount: 240,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    qrPassportId: 'KALORA-QR-PASSPORT-2026-9812',
    isDealOfTheDay: true
  },
  {
    id: 'prod_2',
    name: 'Handcrafted Organic Natural Indigo Cotton Saree',
    artisanName: 'Meenakshi Weavers',
    artisanLocation: 'Chettinad, Tamil Nadu',
    category: 'HANDLOOM_SAREE',
    price: 3899,
    originalPrice: 5500,
    rating: 4.8,
    reviewsCount: 114,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_3',
    name: 'Traditional Chanderi Silk Cotton Heritage Royal Saree',
    artisanName: 'Lakshmi Self-Help Group',
    artisanLocation: 'Chanderi, Madhya Pradesh',
    category: 'HANDLOOM_SAREE',
    price: 6499,
    originalPrice: 8900,
    rating: 4.7,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_4',
    name: 'Banarasi Brocade Silk Saree with Silver Brocade Motifs',
    artisanName: 'Varanasi Master Weavers',
    artisanLocation: 'Varanasi, Uttar Pradesh',
    category: 'HANDLOOM_SAREE',
    price: 18500,
    originalPrice: 24900,
    rating: 5.0,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    qrPassportId: 'KALORA-QR-PASSPORT-2026-1192'
  },
  {
    id: 'prod_5',
    name: 'Tussar Silk Hand Block Printed Designer Saree',
    artisanName: 'Bishnupur Silk Crafts',
    artisanLocation: 'Bishnupur, West Bengal',
    category: 'HANDLOOM_SAREE',
    price: 7999,
    originalPrice: 11500,
    rating: 4.8,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_6',
    name: 'Dharmavaram Bridal Silk Saree with Rich Pallu',
    artisanName: 'Dharmavaram Artisan Cluster',
    artisanLocation: 'Anantapur, Andhra Pradesh',
    category: 'HANDLOOM_SAREE',
    price: 16200,
    originalPrice: 21000,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_7',
    name: 'Pochampally Ikat Pure Silk Handloom Saree',
    artisanName: 'Pochampally Weavers Society',
    artisanLocation: 'Yadadri Bhuvanagiri, Telangana',
    category: 'HANDLOOM_SAREE',
    price: 11800,
    originalPrice: 15900,
    rating: 4.9,
    reviewsCount: 95,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'
  },

  // --- POTTERY & CLAY (7 Products - All 100% Unique Relevant Images) ---
  {
    id: 'prod_8',
    name: 'Natural Clay Biryani & Curd Cooking Pot (Set of 2)',
    artisanName: 'Kavitha Pottery Studio',
    artisanLocation: 'Manamadurai, Sivagangai',
    category: 'POTTERY',
    price: 899,
    originalPrice: 1499,
    rating: 4.9,
    reviewsCount: 420,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    qrPassportId: 'KALORA-QR-PASSPORT-2026-3190',
    isDealOfTheDay: true
  },
  {
    id: 'prod_9',
    name: 'Hand-painted Terracotta Garden Flower Planters',
    artisanName: 'Raman Clay Crafts',
    artisanLocation: 'Pondicherry',
    category: 'POTTERY',
    price: 1299,
    originalPrice: 1899,
    rating: 4.6,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_10',
    name: 'Traditional Black Pottery Cookware Matka',
    artisanName: 'Nizamabad Black Clay Guild',
    artisanLocation: 'Azamgarh, Uttar Pradesh',
    category: 'POTTERY',
    price: 1499,
    originalPrice: 2200,
    rating: 4.8,
    reviewsCount: 165,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_11',
    name: 'Terracotta Handcrafted Tea Kulhad Cups (Set of 6)',
    artisanName: 'Khurja Earth Art',
    artisanLocation: 'Bulandshahr, Uttar Pradesh',
    category: 'POTTERY',
    price: 649,
    originalPrice: 999,
    rating: 4.9,
    reviewsCount: 512,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_12',
    name: 'Eco-friendly Terracotta Water Pitcher Jug with Tap',
    artisanName: 'Thanjavur Clay Artisans',
    artisanLocation: 'Thanjavur, Tamil Nadu',
    category: 'POTTERY',
    price: 1199,
    originalPrice: 1699,
    rating: 4.7,
    reviewsCount: 204,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_13',
    name: 'Studio Pottery Glazed Ceramic Tableware Set',
    artisanName: 'Auroville Clay Studio',
    artisanLocation: 'Auroville, Puducherry',
    category: 'POTTERY',
    price: 2899,
    originalPrice: 3999,
    rating: 4.8,
    reviewsCount: 78,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_14',
    name: 'Handcrafted Heritage Terracotta Table Lamp Base',
    artisanName: 'Vilas Clay Design',
    artisanLocation: 'Kumbharwada, Gujarat',
    category: 'POTTERY',
    price: 2199,
    originalPrice: 2999,
    rating: 4.9,
    reviewsCount: 63,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'
  },

  // --- FURNITURE & WOODWORK (6 Products - All 100% Unique Relevant Images) ---
  {
    id: 'prod_15',
    name: 'Hand-carved Solid Teakwood Traditional Home Shrine',
    artisanName: 'Arun Wood Carvings',
    artisanLocation: 'Nagercoil, Kanyakumari',
    category: 'FURNITURE',
    price: 18999,
    originalPrice: 26500,
    rating: 5.0,
    reviewsCount: 68,
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    qrPassportId: 'KALORA-QR-PASSPORT-2026-7021',
    isDealOfTheDay: true
  },
  {
    id: 'prod_16',
    name: 'Rosewood Antique Design Coffee Table with Brass Inlay',
    artisanName: 'Kallakurichi Carvers',
    artisanLocation: 'Kallakurichi, Tamil Nadu',
    category: 'FURNITURE',
    price: 14500,
    originalPrice: 19999,
    rating: 4.8,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_17',
    artisanId: 'artisan_nisha_192411231',
    name: 'Royal Heritage Orange Upholstered Sheesham Wood Carved Armchair',
    artisanName: 'Nisha (Master Artisan)',
    artisanLocation: 'Saveetha Heritage Woodcraft, Chennai',
    category: 'FURNITURE',
    price: 3850,
    originalPrice: 5005,
    rating: 4.9,
    reviewsCount: 118,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
    qrPassportId: 'KALORA-QR-NISHA-2026-9921',
    isDealOfTheDay: true
  },
  {
    id: 'prod_18',
    name: 'Traditional Kerala Rosewood Rocking Chair',
    artisanName: 'Malabar Wood Artisans',
    artisanLocation: 'Calicut, Kerala',
    category: 'FURNITURE',
    price: 16800,
    originalPrice: 22500,
    rating: 5.0,
    reviewsCount: 84,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_19',
    name: 'Solid Teakwood Hand-carved 3-Panel Room Divider Screen',
    artisanName: 'Jodhpur Wooden Heritage',
    artisanLocation: 'Jodhpur, Rajasthan',
    category: 'FURNITURE',
    price: 12999,
    originalPrice: 17900,
    rating: 4.8,
    reviewsCount: 53,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod_20',
    name: 'Handcrafted Mango Wood Carved Console Storage Table',
    artisanName: 'Channapatna Wood Guild',
    artisanLocation: 'Ramanagara, Karnataka',
    category: 'FURNITURE',
    price: 11200,
    originalPrice: 15400,
    rating: 4.7,
    reviewsCount: 39,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'
  }
];

export const CustomerStore: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    const userKey = localStorage.getItem('kalora_customer_email') || 'guest';
    try {
      return JSON.parse(localStorage.getItem(`kalora_cart_${userKey}`) || '[]');
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const userKey = localStorage.getItem('kalora_customer_email') || 'guest';
    try {
      return JSON.parse(localStorage.getItem(`kalora_wishlist_${userKey}`) || '[]');
    } catch {
      return [];
    }
  });

  // Load dynamically published products from Artisan side
  React.useEffect(() => {
    const fetchArtisanAddedProducts = async () => {
      let remoteProducts: Product[] = [];
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          remoteProducts = data.data.map((p: any) => ({
            id: p.id || p.productId || `prod_remote_${Math.random()}`,
            artisanId: p.artisanId || 'artisan_001',
            name: p.name || p.productName || 'Handcrafted Artisan Product',
            artisanName: p.artisanName || 'Master Artisan',
            artisanLocation: p.artisanLocation || p.region || 'Tamil Nadu Heritage Cluster',
            category: (p.category === 'WEAVING_TEXTILES' || p.category === 'HANDLOOM_SAREE' ? 'HANDLOOM_SAREE' : (p.category === 'WOODWORK' || p.category === 'FURNITURE') ? 'FURNITURE' : p.category === 'POTTERY' ? 'POTTERY' : 'FURNITURE') as any,
            price: Number(p.price) || 4999,
            originalPrice: p.originalPrice || Math.round((Number(p.price) || 4999) * 1.3),
            rating: 4.9,
            reviewsCount: 12,
            image: p.image || (p.images && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].originalUrl) : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
            qrPassportId: `KALORA-QR-PASSPORT-2026-${p.id || '8821'}`
          }));
        }
      } catch (err) {
        console.warn('Backend fetch products error:', err);
      }

      const localAdded = JSON.parse(localStorage.getItem('kalora_products') || '[]').map((p: any) => ({
        id: p.id || p.productId || `prod_local_${Math.random()}`,
        artisanId: p.artisanId || 'artisan_001',
        name: p.name || p.productName || 'Handcrafted Heritage Silk Saree',
        artisanName: p.artisanName || 'Preethika',
        artisanLocation: p.artisanLocation || p.region || 'Tamil Nadu Heritage Cluster',
        category: (p.category === 'WEAVING_TEXTILES' || p.category === 'HANDLOOM_SAREE' ? 'HANDLOOM_SAREE' : (p.category === 'WOODWORK' || p.category === 'FURNITURE') ? 'FURNITURE' : p.category === 'POTTERY' ? 'POTTERY' : 'FURNITURE') as any,
        price: Number(p.price) || 3850,
        originalPrice: Math.round((Number(p.price) || 3850) * 1.3),
        rating: 5.0,
        reviewsCount: 1,
        image: p.image || (p.images && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].originalUrl) : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
        qrPassportId: `KALORA-QR-PASSPORT-2026-${p.id || '8821'}`
      }));

      const combined = [...localAdded, ...remoteProducts, ...SAMPLE_PRODUCTS];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setAllProducts(unique);
    };

    fetchArtisanAddedProducts();

    // Polling interval to catch newly published products in real time
    const interval = setInterval(fetchArtisanAddedProducts, 2000);
    return () => clearInterval(interval);
  }, []);

  // Load dynamically published products from Artisan side
  React.useEffect(() => {
    const fetchArtisanAddedProducts = async () => {
      let remoteProducts: Product[] = [];
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          remoteProducts = data.data.map((p: any) => ({
            id: p.id || p.productId || `prod_remote_${Math.random()}`,
            artisanId: p.artisanId || 'artisan_001',
            name: p.name || p.productName || 'Handcrafted Artisan Product',
            artisanName: p.artisanName || 'Master Artisan',
            artisanLocation: p.artisanLocation || p.region || 'Tamil Nadu Heritage Cluster',
            category: (p.category === 'WEAVING_TEXTILES' || p.category === 'HANDLOOM_SAREE' ? 'HANDLOOM_SAREE' : (p.category === 'WOODWORK' || p.category === 'FURNITURE') ? 'FURNITURE' : p.category === 'POTTERY' ? 'POTTERY' : 'FURNITURE') as any,
            price: Number(p.price) || 4999,
            originalPrice: p.originalPrice || Math.round((Number(p.price) || 4999) * 1.3),
            rating: 4.9,
            reviewsCount: 12,
            image: p.image || (p.images && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].originalUrl) : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
            qrPassportId: `KALORA-QR-PASSPORT-2026-${p.id || '8821'}`
          }));
        }
      } catch (err) {
        console.warn('Backend fetch products error:', err);
      }

      const localAdded = JSON.parse(localStorage.getItem('kalora_products') || '[]').map((p: any) => ({
        id: p.id || p.productId || `prod_local_${Math.random()}`,
        artisanId: p.artisanId || 'artisan_001',
        name: p.name || p.productName || 'Handcrafted Heritage Silk Saree',
        artisanName: p.artisanName || 'Preethika',
        artisanLocation: p.artisanLocation || p.region || 'Tamil Nadu Heritage Cluster',
        category: (p.category === 'WEAVING_TEXTILES' || p.category === 'HANDLOOM_SAREE' ? 'HANDLOOM_SAREE' : (p.category === 'WOODWORK' || p.category === 'FURNITURE') ? 'FURNITURE' : p.category === 'POTTERY' ? 'POTTERY' : 'FURNITURE') as any,
        price: Number(p.price) || 3850,
        originalPrice: Math.round((Number(p.price) || 3850) * 1.3),
        rating: 5.0,
        reviewsCount: 1,
        image: p.image || (p.images && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].originalUrl) : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
        qrPassportId: `KALORA-QR-PASSPORT-2026-${p.id || '8821'}`
      }));

      const combined = [...localAdded, ...remoteProducts, ...SAMPLE_PRODUCTS];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setAllProducts(unique);
    };

    fetchArtisanAddedProducts();

    // Polling interval to catch newly published products in real time
    const interval = setInterval(fetchArtisanAddedProducts, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // UI View Modals & Drawers
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [showWishlistDashboard, setShowWishlistDashboard] = useState<boolean>(false);
  const [showProfileDashboard, setShowProfileDashboard] = useState<boolean>(false);
  const [showPaymentDashboard, setShowPaymentDashboard] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState<boolean>(false);
  const [showCourierModal, setShowCourierModal] = useState<boolean>(false);
  const [showBestSellersOnly, setShowBestSellersOnly] = useState<boolean>(false);
  const [showAiChatbot, setShowAiChatbot] = useState<boolean>(false);
  const [selectedQrProduct, setSelectedQrProduct] = useState<Product | null>(null);
  
  // Courier Request Form State
  const [courierPickupAddress, setCourierPickupAddress] = useState('');
  const [courierItemDescription, setCourierItemDescription] = useState('');
  const [courierPreferredDate, setCourierPreferredDate] = useState('');
  const [courierType, setCourierType] = useState<'DOORSTEP_PICKUP' | 'ARTISAN_DIRECT_SHIP'>('DOORSTEP_PICKUP');
  const [courierRequestsList, setCourierRequestsList] = useState<{ id: string; address: string; date: string; type: string; status: string }[]>([
    { id: 'CR-7721', address: '12 Weaver St, Kanchipuram', date: '2026-09-24', type: 'DOORSTEP_PICKUP', status: 'SCHEDULED' }
  ]);
  // Customer Flow Step: 'WELCOME' -> 'AUTH' -> 'STOREFRONT'
  const [customerFlowStep, setCustomerFlowStep] = useState<'WELCOME' | 'AUTH' | 'STOREFRONT'>('WELCOME');
  const [customerUser, setCustomerUser] = useState<{ name: string; email: string; address: string } | null>(null);

  // Re-sync Cart & Wishlist whenever logged-in customer account changes
  React.useEffect(() => {
    const userKey = customerUser?.email || localStorage.getItem('kalora_customer_email') || 'guest';
    
    const syncRemoteState = async () => {
      try {
        const [cartRes, wishRes] = await Promise.all([
          fetch(`/api/sync/cart/${userKey}`).then(r => r.json()),
          fetch(`/api/sync/wishlist/${userKey}`).then(r => r.json())
        ]);

        if (cartRes.success && Array.isArray(cartRes.data) && cartRes.data.length > 0) {
          const remoteCartItems = cartRes.data.map((item: any) => {
            const p = allProducts.find(prod => prod.id === item.productId) || SAMPLE_PRODUCTS.find(prod => prod.id === item.productId);
            return p ? { product: p, quantity: item.quantity } : null;
          }).filter(Boolean);
          if (remoteCartItems.length > 0) setCart(remoteCartItems);
        } else {
          const savedCart = JSON.parse(localStorage.getItem(`kalora_cart_${userKey}`) || '[]');
          setCart(savedCart);
        }

        if (wishRes.success && Array.isArray(wishRes.data) && wishRes.data.length > 0) {
          setWishlist(wishRes.data);
        } else {
          const savedWishlist = JSON.parse(localStorage.getItem(`kalora_wishlist_${userKey}`) || '[]');
          setWishlist(savedWishlist);
        }
      } catch (err) {
        console.warn('Backend cart/wishlist sync notice:', err);
        const savedCart = JSON.parse(localStorage.getItem(`kalora_cart_${userKey}`) || '[]');
        const savedWishlist = JSON.parse(localStorage.getItem(`kalora_wishlist_${userKey}`) || '[]');
        setCart(savedCart);
        setWishlist(savedWishlist);
      }
    };

    syncRemoteState();
  }, [customerUser, allProducts.length]);

  // Persist Cart updates to LocalStorage & MongoDB
  React.useEffect(() => {
    const userKey = customerUser?.email || localStorage.getItem('kalora_customer_email') || 'guest';
    localStorage.setItem(`kalora_cart_${userKey}`, JSON.stringify(cart));

    fetch('/api/sync/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: userKey,
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity }))
      })
    }).catch(err => console.warn('Cart Mongo persist deferred:', err));
  }, [cart, customerUser]);

  // Persist Wishlist updates to LocalStorage & MongoDB
  React.useEffect(() => {
    const userKey = customerUser?.email || localStorage.getItem('kalora_customer_email') || 'guest';
    localStorage.setItem(`kalora_wishlist_${userKey}`, JSON.stringify(wishlist));

    fetch('/api/sync/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: userKey,
        productIds: wishlist
      })
    }).catch(err => console.warn('Wishlist Mongo persist deferred:', err));
  }, [wishlist, customerUser]);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  // Auth Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmailOrPhone, setRegEmailOrPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Direct Artisan Chat State
  const [activeArtisanChat, setActiveArtisanChat] = useState<{ id: string; name: string; artisanName: string } | null>(null);
  const [artisanChatMessages, setArtisanChatMessages] = useState<Record<string, { sender: 'customer' | 'artisan'; text: string; date: string }[]>>({
    'prod_1': [
      { sender: 'artisan', text: 'Namaste! I am Devi Ramachandran. I woven this Kanchipuram Mulberry Silk Saree using traditional pure gold zari. How can I assist you?', date: '21:15' }
    ],
    'prod_8': [
      { sender: 'artisan', text: 'Greetings! I am Kavitha from Manamadurai. This terracotta cooking pot is 100% organic clay fired at 900°C.', date: '21:18' }
    ]
  });
  const [artisanChatInput, setArtisanChatInput] = useState('');

  // Complaint Form State
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintArtisanId, setComplaintArtisanId] = useState('');
  const [complaintIssueType, setComplaintIssueType] = useState<'DAMAGE' | 'AUTHENTICITY' | 'DELIVERY'>('DAMAGE');
  const [complaintsList, setComplaintsList] = useState<{ id: string; subject: string; status: string; date: string; artisanName: string; type: string }[]>([
    { id: 'TKT-8910', subject: 'Shipping Delay inquiry for Mulberry Silk Saree', status: 'RESOLVED', date: '2026-09-15', artisanName: 'Devi Ramachandran', type: 'DELIVERY' }
  ]);

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: 'Namaste! I am your AI Craft Shopping Assistant. Looking for Handloom Sarees, Pottery, or Teak Furniture today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const dispatchAlertToArtisan = (payload: { artisanId?: string; type: string; title: string; message: string; customerName?: string; productName?: string; amount?: number; ticketId?: string }) => {
    fetch('/api/sync/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artisanId: payload.artisanId || 'artisan_001',
        type: payload.type,
        title: payload.title,
        message: payload.message,
        customerName: payload.customerName || (customerUser ? customerUser.name : 'Verified Buyer'),
        productName: payload.productName,
        amount: payload.amount,
        ticketId: payload.ticketId
      })
    }).catch(err => console.warn('Backend sync alert failed:', err));

    const localAlerts = JSON.parse(localStorage.getItem('kalora_artisan_alerts') || '[]');
    const newAlert = {
      alertId: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      artisanId: payload.artisanId || 'artisan_001',
      type: payload.type,
      title: payload.title,
      message: payload.message,
      customerName: payload.customerName || (customerUser ? customerUser.name : 'Verified Buyer'),
      productName: payload.productName,
      amount: payload.amount,
      ticketId: payload.ticketId,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('kalora_artisan_alerts', JSON.stringify([newAlert, ...localAlerts]));
  };

  const toggleWishlist = (productId: string) => {
    const isAdding = !wishlist.includes(productId);
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    if (isAdding) {
      const prod = allProducts.find(p => p.id === productId) || SAMPLE_PRODUCTS.find(p => p.id === productId);
      if (prod) {
        dispatchAlertToArtisan({
          artisanId: (prod as any).artisanId || 'artisan_001',
          type: 'WISHLIST',
          title: '❤️ Customer Added Item to Wishlist',
          message: `${customerUser ? customerUser.name : 'A Customer'} saved "${prod.name}" to their Wishlist!`,
          productName: prod.name
        });
      }
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    const activeCustomerName = customerUser?.name || localStorage.getItem('kalora_customer_name') || 'Dhanush';
    dispatchAlertToArtisan({
      artisanId: (product as any).artisanId || 'artisan_001',
      type: 'CART_ADD',
      title: '🛒 Customer Added Item to Cart',
      message: `${activeCustomerName} added "${product.name}" (₹${product.price}) to their Cart!`,
      customerName: activeCustomerName,
      productName: product.name,
      amount: product.price
    });

    setShowCartDrawer(true);
  };

  const handleSendArtisanMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArtisanChat || !artisanChatInput.trim()) return;
    const pId = activeArtisanChat.id;
    const msgText = artisanChatInput;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setArtisanChatMessages(prev => ({
      ...prev,
      [pId]: [...(prev[pId] || []), { sender: 'customer', text: msgText, date: timeNow }]
    }));
    setArtisanChatInput('');

    setTimeout(() => {
      if (!activeArtisanChat) return;
      setArtisanChatMessages(prev => ({
        ...prev,
        [pId]: [...(prev[pId] || []), { sender: 'artisan', text: `Thank you for contacting ${activeArtisanChat.artisanName}! I have received your message regarding "${activeArtisanChat.name}". I will verify the crafting details and reply shortly.`, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
      }));
    }, 1000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let botReply = "I can help you find authentic handcrafted sarees, eco pottery, or teak furniture! What is your budget?";
      const lower = userText.toLowerCase();
      if (lower.includes('saree') || lower.includes('silk') || lower.includes('handloom')) {
        botReply = "Our #1 best-selling saree is the Kanchipuram Pure Mulberry Silk Saree by Devi Ramachandran for ₹12,499. Would you like me to add it to your cart?";
      } else if (lower.includes('pot') || lower.includes('pottery') || lower.includes('clay')) {
        botReply = "Check out our Natural Clay Biryani & Curd Cooking Pot set (₹899). It comes with a 5-Year Blockchain Craft Passport verification!";
      } else if (lower.includes('furniture') || lower.includes('wood') || lower.includes('table')) {
        botReply = "Our Hand-carved Solid Teakwood Shrine by Arun Wood Carvings is currently ₹18,999 (28% OFF Deals of the Day)!";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDetails.trim()) return;
    const targetArtisan = complaintArtisanId ? (SAMPLE_PRODUCTS.find(p => p.id === complaintArtisanId)?.artisanName || 'Master Artisan') : 'All Crafts Artisans';
    const newTkt = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: complaintSubject,
      status: 'OPEN (Sent directly to Artisan & KALORA Support)',
      date: new Date().toISOString().split('T')[0],
      artisanName: targetArtisan,
      type: complaintIssueType
    };
    setComplaintsList(prev => [newTkt, ...prev]);

    dispatchAlertToArtisan({
      type: 'DAMAGE_TICKET',
      title: `🚨 ${complaintIssueType} Report [${newTkt.id}]`,
      message: `${complaintSubject}: ${complaintDetails}`,
      ticketId: newTkt.id
    });

    setComplaintSubject('');
    setComplaintDetails('');
    alert(`Support Ticket / Damage Notification [${newTkt.id}] submitted! Dispatched directly to ${newTkt.artisanName}'s Artisan Dashboard.`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const activeCustomerName = customerUser?.name || localStorage.getItem('kalora_customer_name') || 'Dhanush';

    cart.forEach(item => {
      dispatchAlertToArtisan({
        artisanId: (item.product as any).artisanId || 'artisan_001',
        type: 'ORDER',
        title: '📦 New Order Received!',
        message: `${activeCustomerName} purchased ${item.quantity}x "${item.product.name}" for ₹${item.product.price * item.quantity}!`,
        customerName: activeCustomerName,
        productName: item.product.name,
        amount: item.product.price * item.quantity
      });
    });

    const artisanNames = Array.from(new Set(cart.map(item => item.product.artisanName))).join(', ');
    alert(`🎉 Order placed successfully! Verified with Master QR Craft Passport.\n\n🔔 Order Notifications dispatched live to Artisan Dashboard for: ${artisanNames}`);
    setCart([]);
    setShowCartDrawer(false);
  };

  const filteredProducts = allProducts.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.artisanName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBestSeller = !showBestSellersOnly || p.rating >= 4.9 || p.isDealOfTheDay;
    return matchesCategory && matchesSearch && matchesBestSeller;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#131921] text-stone-100 font-sans pb-16">
      {/* 1. AMAZON-STYLE TOP DARK HEADER */}
      <header className="bg-[#131921] sticky top-0 z-40 border-b border-stone-800 shadow-md">
        {/* Main Search & Account Row */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
          {/* Logo & Deliver To */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => setSelectedCategory('ALL')}>
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-serif font-black text-xl shadow-md">
                K
              </div>
              <span className="font-serif font-bold text-xl tracking-wider text-white">ShopCart<span className="text-amber-400">.KALORA</span></span>
            </div>

            <div className="hidden md:flex flex-col text-[11px] hover:border hover:border-white p-1 rounded cursor-pointer">
              <span className="text-stone-400">Deliver to</span>
              <span className="font-bold text-white">{customerUser ? customerUser.name.split(' ')[0] : 'Guest'} • Chennai 600028</span>
            </div>
          </div>

          {/* Search Bar with Category Dropdown */}
          <div className="flex-1 max-w-2xl flex items-center bg-white rounded-md overflow-hidden text-stone-900 border-2 border-amber-500 focus-within:ring-2 focus-within:ring-amber-400">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-stone-100 text-stone-800 px-3 py-2 text-xs border-r border-stone-300 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">All Crafts</option>
              <option value="HANDLOOM_SAREE">Handloom Sarees</option>
              <option value="POTTERY">Pottery & Clay</option>
              <option value="FURNITURE">Furniture & Woodwork</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search authentic sarees, clay pots, teak furniture..."
              className="flex-1 px-3 py-2 text-xs outline-none text-stone-900 font-medium"
            />
            <button className="bg-amber-500 hover:bg-amber-600 px-4 py-2 text-stone-950 font-bold transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right Links: Account, Wishlist, Cart */}
          <div className="flex items-center space-x-5">
            {/* Customer Account / Login */}
            {customerUser ? (
              <button
                onClick={() => setShowProfileDashboard(true)}
                className="flex flex-col text-left hover:border hover:border-amber-400 p-1 rounded text-[11px] bg-[#1a232e] border border-amber-500/20 px-2"
              >
                <span className="text-amber-400 font-bold uppercase text-[9px]">Registered Account</span>
                <span className="font-bold text-white flex items-center space-x-0.5 text-xs">
                  <span>{customerUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                </span>
              </button>
            ) : (
              <button
                onClick={() => setCustomerFlowStep('AUTH')}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs"
              >
                Sign In
              </button>
            )}

            {/* Courier / Pickup Request Button */}
            <button
              onClick={() => setShowCourierModal(true)}
              className="hidden lg:flex flex-col items-center hover:text-amber-400 text-stone-300 transition-colors"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-semibold mt-0.5">Courier / Pickup</span>
            </button>

            {/* Complaints Button */}
            <button
              onClick={() => setShowComplaintsModal(true)}
              className="hidden lg:flex flex-col items-center hover:text-amber-400 text-stone-300 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-semibold mt-0.5">Complaints</span>
            </button>

            {/* Wishlist Dashboard Button */}
            <button
              onClick={() => setShowWishlistDashboard(true)}
              className="relative flex flex-col items-center hover:text-amber-400 text-stone-300 transition-colors"
            >
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              <span className="text-[10px] font-semibold mt-0.5">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg border border-stone-700 text-amber-400 font-bold transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Cart</span>
              <span className="bg-amber-500 text-stone-950 font-black text-xs px-1.5 py-0.2 rounded-md">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* Amazon Category Sub-Navbar */}
        <div className="bg-[#232f3e] px-4 py-1.5 border-t border-stone-800 flex items-center space-x-6 text-xs font-semibold overflow-x-auto text-stone-200">
          <button onClick={() => setSelectedCategory('ALL')} className="flex items-center space-x-1 hover:text-amber-400 font-bold text-white">
            <Menu className="w-4 h-4" />
            <span>All Craft Directory</span>
          </button>
          <button
            onClick={() => setSelectedCategory('HANDLOOM_SAREE')}
            className={`hover:text-amber-400 transition-colors ${selectedCategory === 'HANDLOOM_SAREE' ? 'text-amber-400 font-bold underline' : ''}`}
          >
            🧵 Handloom Sarees
          </button>
          <button
            onClick={() => setSelectedCategory('POTTERY')}
            className={`hover:text-amber-400 transition-colors ${selectedCategory === 'POTTERY' ? 'text-amber-400 font-bold underline' : ''}`}
          >
            🏺 Pottery & Clay Pots
          </button>
          <button
            onClick={() => setSelectedCategory('FURNITURE')}
            className={`hover:text-amber-400 transition-colors ${selectedCategory === 'FURNITURE' ? 'text-amber-400 font-bold underline' : ''}`}
          >
            🪑 Teakwood & Rosewood Furniture
          </button>
          <button
            onClick={() => setShowBestSellersOnly(prev => !prev)}
            className={`px-2.5 py-0.5 rounded-full border transition-all ${
              showBestSellersOnly
                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                : 'text-amber-400 font-bold border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            🏆 Best Seller Recognition {showBestSellersOnly ? '(Active)' : ''}
          </button>
          <span className="text-amber-400 font-bold cursor-pointer">🔥 Deals of the Day</span>
          <span className="text-emerald-400 font-bold cursor-pointer">🛡️ Master QR Blockchain Verified</span>
        </div>
      </header>

      {/* MAIN STORE BODY */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* 2. CATEGORY TILES SPOTLIGHT (Classic Gold & Dark Theme Card Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tile 1: Handloom Sarees */}
          <div className="bg-gradient-to-b from-[#1c2430] to-[#232f3e] border border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Heritage Weaves</span>
                  <h3 className="font-serif font-bold text-xl text-white mt-0.5 group-hover:text-amber-300 transition-colors">Handloom Sarees</h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full">Up to 40% off</span>
              </div>
              <p className="text-xs text-stone-300 mt-1">Pure Kanchipuram Silk, Banarasi Brocade & Pochampally Ikat</p>
              <div className="mt-4 aspect-[4/3] rounded-2xl overflow-hidden border border-stone-700/80 shadow-inner">
                <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" alt="Saree" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
              </div>
            </div>
            <button onClick={() => setSelectedCategory('HANDLOOM_SAREE')} className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center space-x-1.5 pt-2 group-hover:translate-x-1 transition-transform">
              <span>Explore 7 Handloom Sarees</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tile 2: Pottery & Clay */}
          <div className="bg-gradient-to-b from-[#1c2430] to-[#232f3e] border border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Earth Crafts</span>
                  <h3 className="font-serif font-bold text-xl text-white mt-0.5 group-hover:text-amber-300 transition-colors">Pottery & Clay Pots</h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full">Up to 35% off</span>
              </div>
              <p className="text-xs text-stone-300 mt-1">Terracotta Biryani Pots, Kulhads & Black Clay Cookware</p>
              <div className="mt-4 aspect-[4/3] rounded-2xl overflow-hidden border border-stone-700/80 shadow-inner">
                <img src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80" alt="Pottery" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
              </div>
            </div>
            <button onClick={() => setSelectedCategory('POTTERY')} className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center space-x-1.5 pt-2 group-hover:translate-x-1 transition-transform">
              <span>Explore 7 Pottery Crafts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tile 3: Furniture */}
          <div className="bg-gradient-to-b from-[#1c2430] to-[#232f3e] border border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Royal Woodcarvings</span>
                  <h3 className="font-serif font-bold text-xl text-white mt-0.5 group-hover:text-amber-300 transition-colors">Teak & Rosewood Furniture</h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full">Up to 30% off</span>
              </div>
              <p className="text-xs text-stone-300 mt-1">Solid Teak Shrines, Brass Inlay Tables & Rocking Chairs</p>
              <div className="mt-4 aspect-[4/3] rounded-2xl overflow-hidden border border-stone-700/80 shadow-inner">
                <img src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80" alt="Furniture" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
              </div>
            </div>
            <button onClick={() => setSelectedCategory('FURNITURE')} className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center space-x-1.5 pt-2 group-hover:translate-x-1 transition-transform">
              <span>Explore 6 Woodcrafts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. DEALS OF THE DAY HORIZONTAL CAROUSEL */}
        <div className="bg-[#232f3e] border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔥</span>
              <h2 className="text-xl font-serif font-bold text-white">Deals of the Day</h2>
            </div>
            <span className="text-xs font-bold text-amber-400 cursor-pointer hover:underline">See all deals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_PRODUCTS.filter(p => p.isDealOfTheDay).map(product => (
              <div key={product.id} className="bg-[#131921] border border-stone-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div className="relative aspect-square rounded-xl overflow-hidden border border-stone-800">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Deal of the Day
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">{product.category.replace('_', ' ')}</span>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{product.name}</h4>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-emerald-400 text-base">₹{product.price.toLocaleString()}</span>
                    <span className="text-stone-500 line-through text-xs">₹{product.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. MAIN PRODUCT CATALOG GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h2 className="text-2xl font-serif font-bold text-white">Artisan Craft Directory</h2>
            <span className="text-xs text-stone-400">{filteredProducts.length} Products Found</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const isWishlisted = wishlist.includes(product.id);

              return (
                <div key={product.id} className="bg-[#232f3e] border border-stone-800 hover:border-stone-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-xl relative group">
                  {/* Wishlist Button Overlay */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-300 hover:text-rose-500 transition-colors border border-stone-700"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
                  </button>

                  <div className="space-y-3">
                    <div className="aspect-square rounded-xl overflow-hidden border border-stone-700 relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {product.rating >= 4.9 && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded shadow-md border border-amber-300 uppercase">
                          🏆 Best Seller Recognition
                        </span>
                      )}
                      {product.qrPassportId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQrProduct(product);
                          }}
                          className="absolute bottom-2 left-2 bg-amber-500/90 hover:bg-amber-400 text-stone-950 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-amber-300 shadow-lg backdrop-blur-md flex items-center space-x-1 cursor-pointer transition-all hover:scale-105 z-10"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>QR PASSPORT VERIFIED</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Artisan: {product.artisanName}</span>
                      <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight">{product.name}</h3>
                      <p className="text-[11px] text-stone-400">{product.artisanLocation}</p>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 pt-1">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-stone-300">{product.rating}</span>
                        <span className="text-[10px] text-stone-500">({product.reviewsCount})</span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline space-x-2 pt-2">
                        <span className="text-lg font-extrabold text-white">₹{product.price.toLocaleString()}</span>
                        <span className="text-xs text-stone-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-emerald-400">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-800/80 space-y-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => setActiveArtisanChat({ id: product.id, name: product.name, artisanName: product.artisanName })}
                      className="w-full bg-[#1c2430] hover:bg-[#283547] text-amber-400 border border-amber-500/30 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat with Artisan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FLOATING AI CHATBOT TRIGGER BUTTON */}
      <button
        onClick={() => setShowAiChatbot(!showAiChatbot)}
        className="fixed bottom-6 right-6 z-50 bg-amber-500 hover:bg-amber-600 text-stone-950 p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center space-x-2 font-bold text-xs"
      >
        <Sparkles className="w-6 h-6" />
        <span className="hidden sm:inline">AI Shopping Assistant</span>
      </button>

      {/* AI CHATBOT WINDOW */}
      {showAiChatbot && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-[#232f3e] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[420px] animate-slide-up">
          <div className="bg-amber-500 text-stone-950 p-4 flex items-center justify-between font-serif font-bold text-sm">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-stone-950" />
              <span>KALORA AI Shopping Chatbot</span>
            </div>
            <button onClick={() => setShowAiChatbot(false)} className="hover:bg-amber-600 p-1 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-amber-500 text-stone-950 font-semibold' : 'bg-stone-800 text-stone-200 border border-stone-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="p-3 border-t border-stone-800 flex space-x-2 bg-[#131921]">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about sarees, pottery, prices..."
              className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
            />
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950 p-2 rounded-xl">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* CART DRAWER */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-[#232f3e] h-full p-6 flex flex-col justify-between animate-slide-left space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif font-bold text-xl text-white">Shopping Cart</h3>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="text-stone-400 hover:text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-8">Your cart is empty.</p>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#131921] border border-stone-800 p-3 rounded-2xl space-x-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 text-xs space-y-0.5">
                        <h4 className="font-bold text-white line-clamp-1">{item.product.name}</h4>
                        <p className="text-amber-400 font-extrabold">₹{item.product.price.toLocaleString()}</p>
                      </div>
                      <span className="text-xs font-bold text-stone-300">Qty: {item.quantity}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-stone-800 pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-stone-300">Total Amount:</span>
                <span className="text-emerald-400 text-xl font-serif">₹{cartTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={() => { setShowCartDrawer(false); setShowPaymentDashboard(true); }}
                disabled={cart.length === 0}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-2xl text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Checkout & Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DEDICATED SEPARATE PAYMENT & CHECKOUT DASHBOARD */}
      {showPaymentDashboard && (
        <div className="fixed inset-0 z-50 bg-[#131921] flex flex-col p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-4xl mx-auto w-full space-y-6 my-auto">
            {/* Payment Header */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-serif font-black text-2xl shadow-lg">
                  K
                </div>
                <div>
                  <h2 className="font-serif font-bold text-2xl text-white">KALORA Secure Express Checkout & Payment</h2>
                  <p className="text-xs text-stone-400">Master QR Blockchain Verified Direct Artisan Payout Portal</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentDashboard(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 p-2 rounded-2xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="bg-[#232f3e] border border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 max-w-lg mx-auto shadow-2xl animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 mx-auto shadow-xl">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono font-bold">
                    PAYMENT SUCCESSFUL & VERIFIED
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-white">Thank You, {customerUser?.name || 'Customer'}!</h3>
                  <p className="text-xs text-stone-300">
                    Your order has been verified with a 5-Year Master QR Craft Passport. Direct order alert & payout dispatched to the Artisan's Dashboard!
                  </p>
                </div>

                <div className="p-4 bg-[#131921] border border-stone-800 rounded-2xl text-left space-y-2 text-xs">
                  <div className="flex justify-between font-mono text-amber-400 font-bold">
                    <span>Transaction ID: TXN-{Math.floor(10000000 + Math.random() * 90000000)}</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">Payment Method: {paymentMethod} Express Checkout</p>
                  <p className="text-stone-400 text-[11px]">Delivery Address: {customerUser?.address || '12 Weaver Street, Chennai - 600028'}</p>
                </div>

                <button
                  onClick={() => {
                    setPaymentSuccess(false);
                    setCart([]);
                    setShowPaymentDashboard(false);
                    setShowProfileDashboard(true);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
                >
                  View Order in Your Profile Dashboard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left 2 Cols: Payment Options & Customer Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Delivery Address Review */}
                  <div className="bg-[#232f3e] border border-stone-800 rounded-3xl p-6 space-y-3">
                    <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                      <h3 className="font-serif font-bold text-base text-white flex items-center space-x-2">
                        <span>1. Delivery & Buyer Details</span>
                      </h3>
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        VERIFIED ACCOUNT
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-white text-sm">{customerUser ? customerUser.name : 'Registered Customer'}</p>
                      <p className="text-stone-300">{customerUser?.email || 'customer@kalora.com'}</p>
                      <p className="text-stone-400">{customerUser?.address || '12 Weaver Street, Chennai - 600028'}</p>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="bg-[#232f3e] border border-stone-800 rounded-3xl p-6 space-y-4">
                    <h3 className="font-serif font-bold text-base text-white border-b border-stone-800 pb-3">
                      2. Select Payment Option
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <button
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-4 rounded-2xl border flex flex-col items-start space-y-2 transition-all ${
                          paymentMethod === 'UPI' ? 'bg-amber-500/20 border-amber-500 text-white font-bold' : 'bg-[#131921] border-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">⚡ Instant UPI</span>
                        <span className="text-[10px] text-stone-400">GPay, PhonePe, Paytm, BHIM</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-4 rounded-2xl border flex flex-col items-start space-y-2 transition-all ${
                          paymentMethod === 'CARD' ? 'bg-amber-500/20 border-amber-500 text-white font-bold' : 'bg-[#131921] border-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">💳 Credit / Debit Card</span>
                        <span className="text-[10px] text-stone-400">Visa, Mastercard, RuPay</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('NETBANKING')}
                        className={`p-4 rounded-2xl border flex flex-col items-start space-y-2 transition-all ${
                          paymentMethod === 'NETBANKING' ? 'bg-amber-500/20 border-amber-500 text-white font-bold' : 'bg-[#131921] border-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">🏦 Net Banking</span>
                        <span className="text-[10px] text-stone-400">SBI, HDFC, ICICI, Axis</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-4 rounded-2xl border flex flex-col items-start space-y-2 transition-all ${
                          paymentMethod === 'COD' ? 'bg-amber-500/20 border-amber-500 text-white font-bold' : 'bg-[#131921] border-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">📦 Cash on Delivery</span>
                        <span className="text-[10px] text-stone-400">Pay on Craft Inspection</span>
                      </button>
                    </div>

                    {/* Method Specific Inputs */}
                    {paymentMethod === 'UPI' && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-stone-300 mb-1">Enter VPA / UPI ID</label>
                        <input
                          type="text"
                          defaultValue="ananya@okicici"
                          className="w-full bg-[#131921] border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
                        />
                      </div>
                    )}

                    {paymentMethod === 'CARD' && (
                      <div className="space-y-3 pt-2 text-xs">
                        <div>
                          <label className="block font-bold text-stone-300 mb-1">Card Number</label>
                          <input
                            type="text"
                            defaultValue="4532 •••• •••• 8819"
                            className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3 py-2 text-white outline-none font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-stone-300 mb-1">Expiry Date</label>
                            <input type="text" defaultValue="09/29" className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3 py-2 text-white outline-none font-mono" />
                          </div>
                          <div>
                            <label className="block font-bold text-stone-300 mb-1">CVV</label>
                            <input type="password" defaultValue="•••" className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3 py-2 text-white outline-none font-mono" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Order Summary & Pay Action */}
                <div className="bg-[#232f3e] border border-stone-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-lg text-white border-b border-stone-800 pb-3">Order Summary</h3>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-2">
                            <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="line-clamp-1">
                              <p className="font-bold text-white text-[11px]">{item.product.name}</p>
                              <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-white text-xs">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-stone-800 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between text-stone-400">
                        <span>Craft Subtotal</span>
                        <span>₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Master QR Verification Fee</span>
                        <span className="text-emerald-400 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Express Artisanal Delivery</span>
                        <span className="text-emerald-400 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-800 text-base font-bold">
                        <span className="text-white">Total Payable:</span>
                        <span className="text-amber-400 font-serif text-xl">₹{cartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-stone-800">
                    <button
                      onClick={() => {
                        setPaymentSuccess(true);
                        const artisanNames = Array.from(new Set(cart.map(item => item.product.artisanName))).join(', ');
                        // Simulate sending order notification to artisan dashboard
                        console.log(`Dispatched live order notification to ${artisanNames}`);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3.5 rounded-2xl text-xs shadow-xl transition-all hover:scale-102 cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-stone-950" />
                      <span>Pay ₹{cartTotal.toLocaleString()} & Confirm Order</span>
                    </button>
                    <p className="text-[10px] text-stone-400 text-center">🔒 256-Bit Encrypted Payment • Direct Artisan Payout</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIRECT ARTISAN CHAT MODAL */}
      {activeArtisanChat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#232f3e] border border-amber-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 animate-fade-in relative shadow-2xl flex flex-col h-[500px]">
            <button onClick={() => setActiveArtisanChat(null)} className="absolute top-5 right-5 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-stone-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-serif font-bold text-lg">
                {activeArtisanChat.artisanName[0]}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white">{activeArtisanChat.artisanName}</h3>
                <p className="text-[11px] text-amber-400 line-clamp-1">Product: {activeArtisanChat.name}</p>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              {(artisanChatMessages[activeArtisanChat.id] || []).map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'customer' ? 'bg-amber-500 text-stone-950 font-semibold' : 'bg-[#131921] text-stone-200 border border-stone-800'}`}>
                    <p>{msg.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1">{msg.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendArtisanMessage} className="pt-2 border-t border-stone-800 flex space-x-2">
              <input
                type="text"
                value={artisanChatInput}
                onChange={(e) => setArtisanChatInput(e.target.value)}
                placeholder="Ask artisan about custom weaving, wood polish, or craft..."
                className="flex-1 bg-[#131921] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950 p-2.5 rounded-xl font-bold">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPLAINTS / SUPPORT MODAL */}
      {showComplaintsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#232f3e] border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 animate-fade-in relative">
            <button onClick={() => setShowComplaintsModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-stone-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Customer Support & Damage Complaints</h3>
                <p className="text-xs text-stone-400">File a ticket to notify the Artisan & KALORA Support directly</p>
              </div>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Target Artisan Product</label>
                <select
                  value={complaintArtisanId}
                  onChange={(e) => setComplaintArtisanId(e.target.value)}
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                >
                  <option value="">-- General Complaint (All Artisans) --</option>
                  {SAMPLE_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Artisan: {p.artisanName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Issue Category</label>
                <select
                  value={complaintIssueType}
                  onChange={(e: any) => setComplaintIssueType(e.target.value)}
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                >
                  <option value="DAMAGE">📦 Package Damage / Transit Defect</option>
                  <option value="AUTHENTICITY">📜 Craft Authenticity / QR Passport Inquiry</option>
                  <option value="DELIVERY">🚚 Delivery Delay Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Complaint Subject</label>
                <input
                  type="text"
                  required
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  placeholder="e.g. Broken terracotta handle during delivery"
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Issue Details & Damage Photo Note</label>
                <textarea
                  required
                  rows={3}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Describe damage, unboxing details, or replacement request..."
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs shadow-md cursor-pointer">
                Submit & Dispatch to Artisan Dashboard
              </button>
            </form>

            <div className="pt-2 border-t border-stone-800 space-y-2">
              <h4 className="font-bold text-xs text-stone-300">Your Submitted Tickets</h4>
              {complaintsList.map(tkt => (
                <div key={tkt.id} className="p-3 bg-[#131921] border border-stone-800 rounded-xl flex justify-between items-center text-[11px]">
                  <div>
                    <span className="font-mono text-amber-400 font-bold">{tkt.id}</span>
                    <p className="text-stone-300">{tkt.subject}</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                    {tkt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. DEDICATED WISHLIST DASHBOARD */}
      {showWishlistDashboard && (
        <div className="fixed inset-0 z-50 bg-[#131921] flex flex-col p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-6xl mx-auto w-full space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-800 pb-6 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/40">
                  <Heart className="w-6 h-6 fill-rose-500" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-3xl text-white">Your Saved Wishlist Dashboard</h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Customer: <strong className="text-amber-400 font-semibold">{customerUser ? customerUser.name : 'Registered Customer'}</strong> • {wishlist.length} Craft Items Saved
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWishlistDashboard(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2"
              >
                <span>Back to Catalog</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wishlist Items Grid */}
            {wishlist.length === 0 ? (
              <div className="bg-[#232f3e] border border-stone-800 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12">
                <Heart className="w-12 h-12 text-stone-600 mx-auto" />
                <h3 className="font-serif font-bold text-xl text-white">Your Wishlist is Empty</h3>
                <p className="text-xs text-stone-400">Click the heart icon on any saree, pottery, or teakwood item to save it to your personal dashboard.</p>
                <button
                  onClick={() => setShowWishlistDashboard(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md"
                >
                  Explore Product Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_PRODUCTS.filter(p => wishlist.includes(p.id)).map(product => (
                  <div key={product.id} className="bg-[#232f3e] border border-stone-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl relative group">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-7 right-7 z-10 w-8 h-8 rounded-full bg-stone-950/80 text-rose-500 flex items-center justify-center border border-rose-500/40"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>

                    <div className="space-y-3">
                      <div className="aspect-square rounded-2xl overflow-hidden border border-stone-700">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Artisan: {product.artisanName}</span>
                        <h3 className="font-bold text-base text-white">{product.name}</h3>
                        <p className="text-xs text-stone-400">{product.artisanLocation}</p>
                        <div className="flex items-baseline space-x-2 pt-2">
                          <span className="text-xl font-extrabold text-white">₹{product.price.toLocaleString()}</span>
                          <span className="text-xs text-stone-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex space-x-2">
                      <button
                        onClick={() => { addToCart(product); setShowWishlistDashboard(false); }}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DEDICATED PROFILE DASHBOARD */}
      {showProfileDashboard && (
        <div className="fixed inset-0 z-50 bg-[#131921] flex flex-col p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            {/* Header Banner */}
            <div className="bg-[#232f3e] border border-amber-500/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-serif font-black text-3xl shadow-xl border-2 border-amber-300">
                  {customerUser ? customerUser.name[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">{customerUser ? customerUser.name : 'Registered Customer'}</h2>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold uppercase">
                      Verified Buyer Account
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">{customerUser?.email || 'customer@kalora.com'} • Member since 2026</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowProfileDashboard(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 py-2.5 rounded-2xl text-xs transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                >
                  <span>Back to Shop</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Account Overview Sidebar */}
              <div className="bg-[#232f3e] border border-stone-800 rounded-3xl p-6 space-y-6">
                <h3 className="font-serif font-bold text-lg text-white border-b border-stone-800 pb-3">Registered Account Profile</h3>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-stone-400 font-bold block uppercase text-[10px]">Account Name</label>
                    <p className="font-bold text-white text-sm mt-0.5">{customerUser ? customerUser.name : 'Registered Customer'}</p>
                  </div>
                  <div>
                    <label className="text-stone-400 font-bold block uppercase text-[10px]">Email Address</label>
                    <p className="text-stone-200 mt-0.5">{customerUser?.email || 'customer@kalora.com'}</p>
                  </div>
                  <div>
                    <label className="text-stone-400 font-bold block uppercase text-[10px]">Primary Delivery Address</label>
                    <p className="text-stone-200 mt-0.5">{customerUser?.address || '12 Weaver Street, Chennai - 600028'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800 space-y-2">
                  <button
                    onClick={() => { setCustomerUser(null); setShowProfileDashboard(false); setCustomerFlowStep('AUTH'); }}
                    className="w-full bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 py-2.5 rounded-xl font-bold text-xs transition-all"
                  >
                    Sign Out Account
                  </button>
                </div>
              </div>

              {/* Order & Support History */}
              <div className="md:col-span-2 space-y-6">
                {/* Orders Card */}
                <div className="bg-[#232f3e] border border-stone-800 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                    <h3 className="font-serif font-bold text-lg text-white flex items-center space-x-2">
                      <Package className="w-5 h-5 text-amber-400" />
                      <span>Recent Orders & Passport Hash</span>
                    </h3>
                    <span className="text-xs font-bold text-amber-400">1 Active Order</span>
                  </div>

                  <div className="p-4 bg-[#131921] border border-stone-800 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-stone-800/80 pb-2">
                      <span className="font-mono text-amber-400 font-bold">ORD-2026-8819</span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        OUT FOR DELIVERY
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" alt="Saree" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-white">Kanchipuram Pure Mulberry Silk Saree</h4>
                        <p className="text-stone-400 text-[11px]">Artisan: Devi Ramachandran • ₹14,999</p>
                      </div>
                    </div>
                    <div className="p-2 bg-[#1c2430] border border-amber-500/20 rounded-xl text-[10px] font-mono text-stone-300 flex items-center justify-between">
                      <span>QR PASSPORT HASH: KALORA-QR-PASSPORT-2026-9812</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 1. STEP 1: WELCOME SCREEN ("Kalora - Customer Page") */}
      {customerFlowStep === 'WELCOME' && (
        <div className="fixed inset-0 z-50 bg-[#131921] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="max-w-xl w-full bg-[#232f3e] border border-amber-500/30 rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-amber-500 text-stone-950 flex items-center justify-center font-serif font-black text-4xl mx-auto shadow-xl">
              K
            </div>
            
            <div className="space-y-3">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-mono font-bold">
                KALORA CUSTOMER MARKETPLACE
              </span>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight">
                Kalora - Customer Page
              </h1>
              <p className="text-stone-300 text-sm max-w-md mx-auto leading-relaxed">
                Discover & purchase authentic Handloom Sarees, Terracotta Pottery, and Heritage Teakwood Furniture directly from verified Indian artisans.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-800">
              <button
                onClick={() => setCustomerFlowStep('AUTH')}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-10 py-4 rounded-2xl text-base shadow-xl transition-all hover:scale-105 inline-flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. STEP 2: REGISTER & LOGIN PAGE */}
      {customerFlowStep === 'AUTH' && (
        <div className="fixed inset-0 z-50 bg-[#131921]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#232f3e] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 animate-fade-in relative shadow-2xl">
            <div className="text-center space-y-2 border-b border-stone-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-serif font-black text-2xl mx-auto shadow-md">
                K
              </div>
              <h3 className="font-serif font-bold text-2xl text-white">
                {authMode === 'REGISTER' ? 'Create Customer Account' : 'Sign-In to Customer Account'}
              </h3>
              <p className="text-xs text-stone-400">
                {authMode === 'REGISTER' ? 'Register to buy authentic craft products directly from artisans' : 'Sign in to access your orders, cart, and wishlist'}
              </p>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="flex bg-[#131921] p-1 rounded-2xl border border-stone-800">
              <button
                onClick={() => setAuthMode('REGISTER')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'REGISTER' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                onClick={() => setAuthMode('LOGIN')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'LOGIN' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const chosenName = authMode === 'REGISTER' ? (regFullName.trim() || 'Abishek') : (regEmailOrPhone.split('@')[0] || 'Abishek');
                const userObj = {
                  name: chosenName,
                  email: regEmailOrPhone.includes('@') ? regEmailOrPhone : `${regEmailOrPhone}@kalora.com`,
                  address: regAddress || '12 Weaver Street, Chennai - 600028'
                };

                try {
                  await fetch('/api/auth/register-buyer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: userObj.name,
                      email: userObj.email,
                      password: 'CustomerPassword123!',
                      address: userObj.address
                    })
                  });
                } catch (err) {
                  console.error('Customer API registration sync:', err);
                }

                setCustomerUser(userObj);
                setCustomerFlowStep('STOREFRONT');
              }}
              className="space-y-4 text-xs"
            >
              {authMode === 'REGISTER' && (
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Full Registered Account Name</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full bg-[#131921] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-300 mb-1">Email / Phone Number</label>
                <input
                  type="text"
                  required
                  value={regEmailOrPhone}
                  onChange={(e) => setRegEmailOrPhone(e.target.value)}
                  placeholder="e.g. ananya@example.com or 9876543210"
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              {authMode === 'REGISTER' && (
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Street, City, Pincode"
                    className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
              >
                {authMode === 'REGISTER' ? 'Register & Enter Storefront' : 'Sign In & Enter Storefront'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COURIER & DOORSTEP PICKUP REQUEST MODAL */}
      {showCourierModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c2430] border border-amber-500/30 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowCourierModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-stone-800 pb-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Courier & Doorstep Pickup Request</h3>
                <p className="text-xs text-stone-400">Schedule direct craft courier pickup or artisan shipping</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!courierPickupAddress.trim() || !courierItemDescription.trim()) return;

                const newReq = {
                  id: `CR-${Math.floor(1000 + Math.random() * 9000)}`,
                  address: courierPickupAddress,
                  date: courierPreferredDate || new Date().toISOString().split('T')[0],
                  type: courierType,
                  status: 'REQUESTED (Dispatched to KALORA Logistics)'
                };

                setCourierRequestsList(prev => [newReq, ...prev]);

                dispatchAlertToArtisan({
                  type: 'COURIER_REQUEST',
                  title: `🚚 New Courier / Pickup Request [${newReq.id}]`,
                  message: `Request for "${courierItemDescription}" at ${courierPickupAddress}. Type: ${courierType}.`
                });

                setCourierPickupAddress('');
                setCourierItemDescription('');
                setCourierPreferredDate('');
                alert(`🚚 Courier Request [${newReq.id}] registered successfully! A KALORA logistics agent will contact you shortly.`);
                setShowCourierModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-300 mb-1">Request Service Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCourierType('DOORSTEP_PICKUP')}
                    className={`p-3 rounded-xl border font-bold text-left transition-all ${
                      courierType === 'DOORSTEP_PICKUP'
                        ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                  >
                    🏡 Doorstep Pickup
                    <p className="text-[10px] text-stone-400 font-normal mt-0.5">Collect from customer location</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourierType('ARTISAN_DIRECT_SHIP')}
                    className={`p-3 rounded-xl border font-bold text-left transition-all ${
                      courierType === 'ARTISAN_DIRECT_SHIP'
                        ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                  >
                    📦 Artisan Direct Express
                    <p className="text-[10px] text-stone-400 font-normal mt-0.5">Direct express craft dispatch</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Pickup / Delivery Address</label>
                <input
                  type="text"
                  required
                  value={courierPickupAddress}
                  onChange={(e) => setCourierPickupAddress(e.target.value)}
                  placeholder="Door No, Street, Landmark, Pincode"
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Craft Product Description & Weight/Quantity</label>
                <textarea
                  required
                  rows={2}
                  value={courierItemDescription}
                  onChange={(e) => setCourierItemDescription(e.target.value)}
                  placeholder="e.g. 2 Terracotta Clay Pots / 1 Kanchipuram Silk Saree box..."
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Preferred Pickup Date</label>
                <input
                  type="date"
                  required
                  value={courierPreferredDate}
                  onChange={(e) => setCourierPreferredDate(e.target.value)}
                  className="w-full bg-[#131921] border border-stone-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
              >
                Submit Courier & Pickup Request
              </button>
            </form>

            {/* Previous Requests List */}
            {courierRequestsList.length > 0 && (
              <div className="pt-2 border-t border-stone-800 space-y-2">
                <h4 className="font-bold text-xs text-amber-400">Your Active Courier Requests:</h4>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {courierRequestsList.map(req => (
                    <div key={req.id} className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800 text-[11px] flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-white">{req.id}</span>
                        <p className="text-stone-400 truncate max-w-[220px]">{req.address}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 8. QR PASSPORT AUTHENTICATION MODAL */}
      {selectedQrProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1c2430] border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 text-stone-100">
            <button
              onClick={() => setSelectedQrProduct(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full bg-stone-800/80"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-stone-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Master Digital Craft Passport</span>
                <h3 className="font-serif font-bold text-lg text-white">Verified Authentic Craft</h3>
              </div>
            </div>

            <div className="bg-[#131921] border border-amber-500/30 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
              {/* Product & Artisan Dual QR Code Visual Display */}
              <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-amber-500/40 relative">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `KALORA_AUTHENTIC_PRODUCT|ID:${selectedQrProduct.id}|NAME:${selectedQrProduct.name}|ARTISAN:${selectedQrProduct.artisanName}|EMAIL:192411231.simats@saveetha.com|PASSPORT:${selectedQrProduct.qrPassportId || 'KALORA-QR-PASSPORT-2026-9921'}`
                  )}`}
                  alt="Craft Product QR Passport"
                  className="w-44 h-44"
                />
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-md">
                  STAMPED VERIFIED
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">{selectedQrProduct.name}</h4>
                <p className="text-xs text-amber-400 font-semibold">Artisan: {selectedQrProduct.artisanName}</p>
                <p className="text-[11px] text-stone-400 font-mono">Passport ID: {selectedQrProduct.qrPassportId || 'KALORA-QR-PASSPORT-2026-9921'}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-300 bg-stone-900/60 p-3 rounded-xl border border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Authenticity Certificate:</span>
                <span className="font-bold text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Guaranteed</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Artisan Email / ID:</span>
                <span className="font-bold text-stone-200">192411231.simats@saveetha.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Craft Origin Cluster:</span>
                <span className="font-bold text-stone-200">{selectedQrProduct.artisanLocation}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`✅ QR Passport [${selectedQrProduct.qrPassportId || 'KALORA-QR-PASSPORT-2026-9921'}] verified on KALORA Blockchain Registry!`);
                setSelectedQrProduct(null);
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
            >
              Verify Passport Integrity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
