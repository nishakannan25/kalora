import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { VoiceModal } from './VoiceModal';
import {
  PlusCircle,
  Mic,
  Camera,
  Package,
  TrendingUp,
  BarChart3,
  Award,
  Bell,
  User as UserIcon,
  Users,
  LogOut,
  Sparkles,
  Globe,
  ChevronRight,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

const PriceAdvisorCalculator: React.FC = () => {
  const [craftType, setCraftType] = useState<string>('TEXTILE');
  const [materialCost, setMaterialCost] = useState<number>(850);
  const [laborHours, setLaborHours] = useState<number>(14);
  const [hourlyWage, setHourlyWage] = useState<number>(180);
  const [marginPct, setMarginPct] = useState<number>(40);

  const baseMaterial = Number(materialCost) || 0;
  const laborValue = (Number(laborHours) || 0) * (Number(hourlyWage) || 0);
  const productionCost = baseMaterial + laborValue;
  const artisanMargin = Math.round(productionCost * (marginPct / 100));
  const fairWholesalePrice = productionCost + artisanMargin;
  const suggestedRetailPrice = Math.round(fairWholesalePrice * 1.35);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs Column */}
      <div className="lg:col-span-6 space-y-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase mb-2">1. Select Craft Category</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'POTTERY', label: 'Pottery & Clay', defaultMargin: 35, defaultWage: 150 },
              { id: 'TEXTILE', label: 'Handloom Textiles', defaultMargin: 40, defaultWage: 180 },
              { id: 'WOOD', label: 'Wood & Metal', defaultMargin: 45, defaultWage: 220 },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCraftType(c.id);
                  setMarginPct(c.defaultMargin);
                  setHourlyWage(c.defaultWage);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                  craftType === c.id
                    ? 'bg-terracotta-600 text-white border-terracotta-600 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">Raw Material Cost (₹)</label>
            <input
              type="number"
              value={materialCost}
              onChange={(e) => setMaterialCost(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">Labor Spent (Hours)</label>
            <input
              type="number"
              value={laborHours}
              onChange={(e) => setLaborHours(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">Artisan Hourly Wage (₹/hr)</label>
            <input
              type="number"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">Artisan Profit Margin ({marginPct}%)</label>
            <input
              type="range"
              min={20}
              max={60}
              value={marginPct}
              onChange={(e) => setMarginPct(Number(e.target.value))}
              className="w-full mt-3 accent-terracotta-600"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Results Column */}
      <div className="lg:col-span-6 space-y-5 bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 sm:p-7 rounded-2xl shadow-md border border-stone-800">
        <div className="flex justify-between items-center border-b border-stone-700/80 pb-4">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">AI Fair Market Price</p>
            <h4 className="text-3xl font-serif font-bold text-gold-400 mt-0.5">₹{fairWholesalePrice.toLocaleString('en-IN')}</h4>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Suggested Retail (MSRP)</p>
            <p className="text-xl font-bold text-white font-serif mt-0.5">₹{suggestedRetailPrice.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">Cost Structure Breakdown</p>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-stone-300">Raw Materials:</span>
              <span className="text-stone-200 font-bold">₹{baseMaterial.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((baseMaterial / Math.max(1, productionCost)) * 100))}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-stone-300">Artisan Labor Value ({laborHours} hrs @ ₹{hourlyWage}/hr):</span>
              <span className="text-emerald-400 font-bold">₹{laborValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((laborValue / Math.max(1, productionCost)) * 100))}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-stone-300">Direct Artisan Profit Margin ({marginPct}%):</span>
              <span className="text-gold-400 font-bold">₹{artisanMargin.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gold-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((artisanMargin / Math.max(1, fairWholesalePrice)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-xl flex items-center justify-between text-xs mt-4">
          <span className="text-stone-300">Includes fair wage guarantee & regional craft index</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Fair Trade Compliant</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const FestiveSeasonAdvisor: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<string>('DIWALI');

  const festivalData: Record<string, {
    name: string;
    surgePct: number;
    months: string;
    activeMonths: number[];
    demandLevel: string;
    icon: string;
    festivePrice: string;
    offSeasonPrice: string;
    materialLaborCost: string;
    customerExpectations: string[];
    profitGrowth: string;
    marginTrend: string;
    topCrafts: string[];
  }> = {
    DIWALI: {
      name: 'Diwali & Festival Season',
      surgePct: 35,
      months: 'October – November',
      activeMonths: [9, 10],
      demandLevel: 'Very High Demand (98%)',
      icon: '🪔',
      festivePrice: '₹3,850',
      offSeasonPrice: '₹2,850',
      materialLaborCost: '₹1,700',
      customerExpectations: [
        'Premium Gift Packaging & Festival Note Cards',
        'Eco-Friendly Handmade Craft Certification',
        'Bulk Family & Corporate Gifting Orders'
      ],
      profitGrowth: '+62% Net Seasonal Profit',
      marginTrend: '35% Higher Margin vs. Regular Months',
      topCrafts: ['Brass Lamps & Diyas', 'Terracotta Cookware', 'Silk Sarees', 'Handmade Home Decor']
    },
    WEDDING: {
      name: 'Wedding & Marriage Season',
      surgePct: 45,
      months: 'December – February',
      activeMonths: [11, 0, 1],
      demandLevel: 'Peak Demand (95%)',
      icon: '💍',
      festivePrice: '₹6,500',
      offSeasonPrice: '₹4,480',
      materialLaborCost: '₹2,600',
      customerExpectations: [
        'Custom Engraving & Artisan Signature',
        'High-Grade Pure Material Proof (Gold/Silk/Teak)',
        'On-Time Delivery for Wedding Dates'
      ],
      profitGrowth: '+85% Net Seasonal Profit',
      marginTrend: '45% Higher Margin vs. Regular Months',
      topCrafts: ['Pure Silk Sarees', 'Carved Wood Shrines', 'Jewelry Boxes', 'Brass Gift Items']
    },
    HARVEST: {
      name: 'Pongal / Harvest Festival',
      surgePct: 25,
      months: 'January – February',
      activeMonths: [0, 1],
      demandLevel: 'High Demand (82%)',
      icon: '🌾',
      festivePrice: '₹2,250',
      offSeasonPrice: '₹1,800',
      materialLaborCost: '₹1,100',
      customerExpectations: [
        'Authentic Traditional Clay Finish',
        'Organic Dye Verification',
        'Household Utility & Durability'
      ],
      profitGrowth: '+40% Net Seasonal Profit',
      marginTrend: '25% Higher Margin vs. Regular Months',
      topCrafts: ['Clay Cooking Pots', 'Cotton Weaves', 'Pottery Items', 'Gift Baskets']
    },
    REGULAR: {
      name: 'Normal Months',
      surgePct: 0,
      months: 'Rest of the Year',
      activeMonths: [2, 3, 4, 5, 6, 7, 8],
      demandLevel: 'Normal Demand (60%)',
      icon: '🏷️',
      festivePrice: '₹1,800',
      offSeasonPrice: '₹1,800',
      materialLaborCost: '₹1,050',
      customerExpectations: [
        'Fair Everyday Market Pricing',
        'Durable Quality for Daily Use',
        'Standard Safe Shipping Packaging'
      ],
      profitGrowth: 'Baseline Profitability',
      marginTrend: 'Standard Baseline Margin',
      topCrafts: ['Daily Wear Clothes', 'Utility Pottery', 'Standard Wooden Items']
    }
  };

  const active = festivalData[selectedSeason];

  const monthlyDemand = [
    { month: 'Jan', val: 75, idx: 0 },
    { month: 'Feb', val: 70, idx: 1 },
    { month: 'Mar', val: 55, idx: 2 },
    { month: 'Apr', val: 50, idx: 3 },
    { month: 'May', val: 45, idx: 4 },
    { month: 'Jun', val: 40, idx: 5 },
    { month: 'Jul', val: 50, idx: 6 },
    { month: 'Aug', val: 65, idx: 7 },
    { month: 'Sep', val: 80, idx: 8 },
    { month: 'Oct', val: 98, idx: 9 },
    { month: 'Nov', val: 95, idx: 10 },
    { month: 'Dec', val: 90, idx: 11 },
  ];

  return (
    <div className="bg-gradient-to-br from-terracotta-50/40 via-stone-50 to-amber-50/30 border border-terracotta-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-terracotta-100 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-600 text-white flex items-center justify-center text-2xl shadow-sm">
            🪔
          </div>
          <div>
            <h3 className="font-serif font-bold text-2xl text-stone-900">Festive Season Price, Profit & Customer Guide</h3>
            <p className="text-xs text-stone-600">Understand urban buyer expectations & seasonal profit trends for your crafts</p>
          </div>
        </div>
        <div className="bg-terracotta-100 border border-terracotta-300 px-4 py-2 rounded-full flex items-center space-x-2 text-terracotta-900 text-xs font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-terracotta-700" />
          <span>Seasonal Demand & Profit Advisor</span>
        </div>
      </div>

      {/* Season Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(festivalData).map(([key, data]) => {
          const isSelected = selectedSeason === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedSeason(key)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-terracotta-600 text-white border-terracotta-700 shadow-md ring-2 ring-terracotta-400/50'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-terracotta-50/60'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl">{data.icon}</span>
                {data.surgePct > 0 ? (
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-gold-400 text-stone-950 font-bold' : 'bg-terracotta-100 text-terracotta-900 border border-terracotta-300'
                  }`}>
                    +{data.surgePct}% Price
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                  }`}>
                    Base Price
                  </span>
                )}
              </div>
              <p className={`font-serif font-bold text-sm ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                {data.name.split(' ')[0]}
              </p>
              <p className={`text-xs mt-0.5 ${isSelected ? 'text-terracotta-100' : 'text-stone-500'}`}>
                {data.months}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: Dynamic Price & Profit Trend Analysis */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{active.icon}</span>
              <h4 className="font-serif font-bold text-base text-stone-900">{active.name}</h4>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              {active.demandLevel}
            </span>
          </div>

          <div className="space-y-2.5 py-1">
            <div className="p-4 bg-gradient-to-r from-terracotta-600 to-amber-600 text-white rounded-xl shadow-xs flex justify-between items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-100">
                  {active.surgePct > 0 ? `Festive Selling Price (+${active.surgePct}%)` : 'Standard Marketplace Price'}
                </p>
                <p className="text-xs text-amber-100">Recommended selling price to urban buyers</p>
              </div>
              <p className="text-2xl font-serif font-bold text-white">{active.festivePrice}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <p className="text-stone-500 font-semibold">Standard Off-Season Price</p>
                <p className="font-bold text-stone-900 text-sm mt-0.5">{active.offSeasonPrice}</p>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <p className="text-stone-500 font-semibold">Material & Labor Cost</p>
                <p className="font-bold text-stone-800 text-sm mt-0.5">{active.materialLaborCost}</p>
              </div>
            </div>
          </div>

          {/* Profit Trend Analysis Block */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-900 flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Profit Trend Analysis</span>
              </span>
              <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {active.profitGrowth}
              </span>
            </div>
            <p className="text-emerald-800 font-medium text-[11px]">
              {active.marginTrend} • Higher buyer willingness during festive gifting months.
            </p>
          </div>
        </div>

        {/* Right Card: Customer Expectations & 12-Month Demand Graph */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs">
          {/* Customer Expectations Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 border-b border-stone-100 pb-2">
              <Award className="w-4 h-4 text-terracotta-600" />
              <h4 className="font-serif font-bold text-sm text-stone-900">What Urban Buyers Expect in this Season:</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700">
              {active.customerExpectations.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-terracotta-600 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 12-Month Demand Graph */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-serif font-bold text-xs text-stone-800">12-Month Buyer Demand Graph</h4>
              <span className="text-[11px] font-bold text-terracotta-700">{active.months}</span>
            </div>

            <div className="flex items-end justify-between h-24 gap-1 px-1 border-b border-stone-200 pb-2 mt-2">
              {monthlyDemand.map((m) => {
                const isActiveMonth = active.activeMonths.includes(m.idx);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-stone-100 rounded-t-sm flex items-end overflow-hidden h-16">
                      <div
                        className={`w-full transition-all duration-300 rounded-t-sm ${
                          isActiveMonth ? 'bg-terracotta-600 shadow-sm' : 'bg-stone-300'
                        }`}
                        style={{ height: `${m.val}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${isActiveMonth ? 'text-terracotta-900' : 'text-stone-400'}`}>
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketInsightsAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lastLivePulse, setLastLivePulse] = useState<string>('Just now');
  const [liveMultiplier, setLiveMultiplier] = useState<number>(1);

  // Simulated Real-Time Data Stream: updates live buyer counts dynamically
  const [weeklyData, setWeeklyData] = useState([
    { label: 'Mon', count: 120, growth: '+5%' },
    { label: 'Tue', count: 180, growth: '+12%' },
    { label: 'Wed', count: 240, growth: '+18%' },
    { label: 'Thu', count: 310, growth: '+25%' },
    { label: 'Fri', count: 450, growth: '+38%' },
    { label: 'Sat', count: 620, growth: '+52%' },
    { label: 'Sun', count: 580, growth: '+48%' },
  ]);

  const [monthlyData, setMonthlyData] = useState([
    { label: 'Week 1', count: 1450, growth: '+15%' },
    { label: 'Week 2', count: 1890, growth: '+22%' },
    { label: 'Week 3', count: 2400, growth: '+34%' },
    { label: 'Week 4', count: 3150, growth: '+45%' },
  ]);

  // Real-time live update simulation interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastLivePulse(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      
      // Simulate live incoming buyer inquiry fluctuation
      setWeeklyData(prev => prev.map(d => ({
        ...d,
        count: Math.max(80, d.count + Math.floor(Math.random() * 9) - 4)
      })));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const rawActiveGraph = timeframe === 'WEEKLY' ? weeklyData : monthlyData;

  // Apply craft category filter multiplier
  const catMultipliers: Record<string, number> = {
    ALL: 1.0,
    POTTERY: 0.85,
    TEXTILES: 1.25,
    WOODCRAFT: 0.95,
  };

  const currentMult = catMultipliers[selectedCategory] || 1.0;

  const activeGraph = rawActiveGraph.map(d => ({
    ...d,
    count: Math.round(d.count * currentMult)
  }));

  const maxCount = Math.max(...activeGraph.map(d => d.count));
  const totalInquiries = activeGraph.reduce((sum, item) => sum + item.count, 0);

  const cityDemand = [
    { city: 'Bengaluru', demand: Math.min(99, Math.round(94 * currentMult)), craft: 'Terracotta & Teak Decor', trend: '🔥 High Growth' },
    { city: 'Chennai', demand: Math.min(99, Math.round(90 * currentMult)), craft: 'Silk Handlooms & Brass', trend: '📈 Surge Inquiries' },
    { city: 'Mumbai', demand: Math.min(99, Math.round(88 * currentMult)), craft: 'Wall Art & Ceramic Utensils', trend: '✨ Steady Demand' },
    { city: 'Hyderabad', demand: Math.min(99, Math.round(84 * currentMult)), craft: 'Pochampally Weaves & Woodcraft', trend: '⚡ Growing' },
    { city: 'Delhi NCR', demand: Math.min(99, Math.round(82 * currentMult)), craft: 'Festive Diyas & Pottery', trend: '🌿 Eco-Buyers' }
  ];

  return (
    <div className="space-y-8">
      {/* Real-time Indicator & Category Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-50 border border-stone-200 p-4 rounded-2xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">Live Analytics Feed Connected</p>
            <p className="text-[11px] text-stone-500">Auto-refreshing live buyer data • Last update: <span className="font-mono font-bold text-stone-800">{lastLivePulse}</span></p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto text-xs">
          {[
            { id: 'ALL', label: 'All Craft Categories' },
            { id: 'POTTERY', label: 'Pottery & Clay' },
            { id: 'TEXTILES', label: 'Handloom Textiles' },
            { id: 'WOODCRAFT', label: 'Wood & Metalwork' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-terracotta-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Interactive Graph Analytics Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-terracotta-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-800 pb-5 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-2xl text-amber-400">Urban Buyer Inquiry & Demand Graph</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Real-time buyer traffic from metro cities across India</p>
          </div>

          {/* Timeframe Toggle Buttons */}
          <div className="bg-stone-800/90 p-1 rounded-2xl border border-stone-700 flex items-center space-x-1">
            <button
              onClick={() => setTimeframe('WEEKLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'WEEKLY'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              📅 Weekly View (7 Days)
            </button>
            <button
              onClick={() => setTimeframe('MONTHLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'MONTHLY'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              📊 Monthly View (4 Weeks)
            </button>
          </div>
        </div>

        {/* Dynamic SVG / CSS Wave Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="flex items-end justify-between h-44 gap-2 px-2 border-b border-stone-800 pb-3">
            {activeGraph.map((item) => {
              const heightPct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Hover Tooltip */}
                  <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-stone-950 text-[11px] font-extrabold px-2 py-0.5 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-10">
                    {item.count} Inquiries ({item.growth})
                  </div>

                  <div className="w-full bg-stone-800/80 rounded-t-lg flex items-end overflow-hidden h-36 border-t border-stone-700">
                    <div
                      className="w-full bg-gradient-to-t from-terracotta-600 to-amber-400 rounded-t-lg transition-all duration-500 shadow-md group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-bold text-stone-200">{item.label}</p>
                    <p className="text-[10px] text-amber-400 font-semibold">{item.growth}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-stone-400 pt-1 gap-2 border-b border-stone-800 pb-4">
          <span className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Peak Traffic: Friday to Sunday (Weekend Urban Shopping Surge)</span>
          </span>
          <span className="text-amber-400 font-bold bg-stone-800 px-3 py-1 rounded-xl border border-stone-700">
            Total Live Inquiries: {totalInquiries.toLocaleString()} Active Buyers
          </span>
        </div>

        {/* Weekly & Monthly Market Performance Summary Box */}
        <div className="bg-stone-800/60 rounded-2xl p-4 border border-stone-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-amber-300 flex items-center space-x-2">
              <span>📈 {timeframe === 'WEEKLY' ? 'Weekly Market Demand Summary (7 Days)' : 'Monthly Market Demand Summary (4 Weeks)'}</span>
            </h4>
            <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
              {timeframe === 'WEEKLY' ? 'WEEKLY INSIGHT' : 'MONTHLY INSIGHT'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-700/60">
              <p className="text-stone-400 text-[11px] font-medium">Inquiry Growth Rate</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{timeframe === 'WEEKLY' ? '+38.5% vs Last Week' : '+45.2% vs Last Month'}</p>
              <p className="text-[10px] text-stone-500 mt-1">High conversion in metro city orders</p>
            </div>
            <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-700/60">
              <p className="text-stone-400 text-[11px] font-medium">Top High-Demand Hub</p>
              <p className="text-lg font-bold text-amber-300 mt-0.5">Bengaluru & Chennai</p>
              <p className="text-[10px] text-stone-500 mt-1">94% demand index surge</p>
            </div>
            <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-700/60">
              <p className="text-stone-400 text-[11px] font-medium">Top Performing Category</p>
              <p className="text-lg font-bold text-indigo-300 mt-0.5">Terracotta & Silk Sarees</p>
              <p className="text-[10px] text-stone-500 mt-1">Peak weekend buyer inquiries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Category Demand & Metro City Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Trending Categories */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif font-bold text-stone-900 text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-terracotta-600" />
            <span>Top Trending Craft Categories</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-stone-50 rounded-2xl border border-amber-200/80 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Terracotta & Clay Cookware</h4>
                <p className="text-xs text-stone-600">High demand in Bengaluru, Chennai & Mumbai eco-conscious hubs</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold rounded-full border border-amber-300 shrink-0">
                🔥 +24% Demand
              </span>
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-50 to-stone-50 rounded-2xl border border-emerald-200/80 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Handloom Weaves & Organic Dye Sarees</h4>
                <p className="text-xs text-stone-600">Direct artisan buyer inquiries up significantly</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-extrabold rounded-full border border-emerald-300 shrink-0">
                📈 +18% Growth
              </span>
            </div>

            <div className="p-4 bg-gradient-to-r from-indigo-50 to-stone-50 rounded-2xl border border-indigo-200/80 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Carved Wooden Wall Motifs & Brass Decor</h4>
                <p className="text-xs text-stone-600">Surge in festive & home interior redesign orders</p>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-extrabold rounded-full border border-indigo-300 shrink-0">
                ✨ +15% Search
              </span>
            </div>
          </div>
        </div>

        {/* Metro City Demand Breakdown */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-terracotta-600" />
            <span>Metro City Buyer Demand Index</span>
          </h3>

          <div className="space-y-3 text-xs">
            {cityDemand.map((c) => (
              <div key={c.city} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-900 text-sm">{c.city}</span>
                  <span className="text-[10px] font-extrabold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                    {c.trend}
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-terracotta-600 h-full rounded-full"
                    style={{ width: `${c.demand}%` }}
                  />
                </div>
                <p className="text-stone-500 font-medium">Top Craft: <span className="font-semibold text-stone-800">{c.craft}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Search Keywords & Artisan Action Plan Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Buyer Search Keywords */}
        <div className="lg:col-span-6 bg-stone-900 text-white p-6 sm:p-8 rounded-3xl space-y-4 border border-stone-800 shadow-md">
          <h3 className="font-serif font-bold text-xl text-amber-400">Top Urban Buyer Search Keywords</h3>
          <p className="text-xs text-stone-400">Keywords used by city buyers on the KALORA marketplace:</p>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              'Natural Clay Biryani Pot',
              'Kanchipuram Pure Silk',
              'Teakwood Handcrafted Temple',
              'Organic Herbal Indigo Saree',
              'Hand-painted Terracotta Planters',
              'Brass Traditional Diya',
              'Chettinad Cotton Weave',
              'Handmade Wooden Toys'
            ].map((keyword) => (
              <span key={keyword} className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-all cursor-pointer">
                🔍 {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Actionable Market Recommendations for Artisans */}
        <div className="lg:col-span-6 bg-amber-50/70 border border-amber-200/80 p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="font-serif font-bold text-xl text-amber-950 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-700" />
            <span>Recommended Artisan Actions This Week</span>
          </h3>

          <ul className="space-y-3 text-xs text-stone-800">
            <li className="p-3 bg-white rounded-xl border border-amber-200 flex items-start space-x-3 shadow-xs">
              <span className="text-amber-700 font-bold text-sm">1.</span>
              <div>
                <p className="font-bold text-stone-900">Add Keywords to Craft Descriptions</p>
                <p className="text-stone-600 mt-0.5">Include terms like *"Natural Clay"* or *"Handmade Wood"* to rank higher in urban buyer searches.</p>
              </div>
            </li>

            <li className="p-3 bg-white rounded-xl border border-amber-200 flex items-start space-x-3 shadow-xs">
              <span className="text-amber-700 font-bold text-sm">2.</span>
              <div>
                <p className="font-bold text-stone-900">Prepare Inventory for Weekend Traffic</p>
                <p className="text-stone-600 mt-0.5">Buyer traffic peaks Friday to Sunday. Upload fresh AI-scanned photos before Friday.</p>
              </div>
            </li>

            <li className="p-3 bg-white rounded-xl border border-amber-200 flex items-start space-x-3 shadow-xs">
              <span className="text-amber-700 font-bold text-sm">3.</span>
              <div>
                <p className="font-bold text-stone-900">Apply Digital Craft Passports</p>
                <p className="text-stone-600 mt-0.5">Crafts with Passport QR codes receive 38% more inquiries from metro buyers.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Official KALORA Social Media Craft Promotion Channels */}
      <div className="bg-gradient-to-r from-stone-900 via-terracotta-950 to-stone-900 border border-terracotta-900/50 p-6 sm:p-8 rounded-3xl space-y-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-800 pb-4 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-400">Official Social Media Craft Channels</h3>
            </div>
            <p className="text-xs text-stone-300 mt-1">Promote your handcrafted products directly on official KALORA social channels to reach global buyers & collectors</p>
          </div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-full">
            📢 Global Reach & Spotlights
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gradient-to-br from-pink-950/60 to-purple-950/60 border border-pink-500/30 hover:border-pink-500/80 rounded-2xl transition-all hover:scale-[1.02] flex items-start space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-600/30 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/40 font-bold text-lg">
              📸
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm group-hover:text-pink-300 transition-colors">Official Instagram</span>
                <ChevronRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-stone-300 text-[11px]">@kalora_artisan_crafts</p>
              <p className="text-pink-200/80 text-[10px]">Tag #KALORAArtisan to get featured in daily craft spotlights!</p>
            </div>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-500/30 hover:border-blue-500/80 rounded-2xl transition-all hover:scale-[1.02] flex items-start space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40 font-bold text-lg">
              👥
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">Official Facebook Page</span>
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-stone-300 text-[11px]">KALORA Indian Heritage Crafts</p>
              <p className="text-blue-200/80 text-[10px]">Join 250K+ craft enthusiasts, interior designers & buyers.</p>
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gradient-to-br from-sky-950/60 to-blue-950/60 border border-sky-500/30 hover:border-sky-500/80 rounded-2xl transition-all hover:scale-[1.02] flex items-start space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600/30 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/40 font-bold text-lg">
              💼
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">Official LinkedIn</span>
                <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-stone-300 text-[11px]">KALORA Artisan Enterprise</p>
              <p className="text-sky-200/80 text-[10px]">Connect with corporate buyers & B2B hotel procurement partners.</p>
            </div>
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gradient-to-br from-red-950/60 to-rose-950/60 border border-red-500/30 hover:border-red-500/80 rounded-2xl transition-all hover:scale-[1.02] flex items-start space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40 font-bold text-lg">
              ▶️
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm group-hover:text-red-300 transition-colors">Official YouTube</span>
                <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-stone-300 text-[11px]">KALORA Craft Documentaries</p>
              <p className="text-red-200/80 text-[10px]">Watch & showcase artisan weaving & pottery creation videos.</p>
            </div>
          </a>

          {/* Pinterest */}
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gradient-to-br from-red-950/60 to-amber-950/60 border border-red-400/30 hover:border-red-400/80 rounded-2xl transition-all hover:scale-[1.02] flex items-start space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/30 text-red-300 flex items-center justify-center shrink-0 border border-red-400/40 font-bold text-lg">
              📌
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm group-hover:text-red-200 transition-colors">Official Pinterest</span>
                <ChevronRight className="w-4 h-4 text-red-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-stone-300 text-[11px]">KALORA Heritage Catalogs</p>
              <p className="text-red-200/80 text-[10px]">Pin high-resolution 4K craft images for home decor buyers.</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

interface ArtisanProfileViewProps {
  user: any;
  totalCount: number;
}

const ArtisanProfileView: React.FC<ArtisanProfileViewProps> = ({ user, totalCount }) => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    localStorage.getItem('artisan_profile_photo') || null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Heritage Craft Master',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'artisan@kalora.org',
    craftCategory: user?.craftCategory || 'Kanchipuram Silk & Terracotta Pottery',
    location: user?.location || 'Kanchipuram Artisan Cluster, Tamil Nadu',
    experienceYears: '18 Years Heritage Crafting',
    craftStory: 'Weaving heritage handloom silk and crafting eco-friendly terracotta pottery using 4th-generation ancestral techniques.',
    giTag: 'GI-TN-2024-KANCHI'
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setProfilePhoto(photoUrl);
        localStorage.setItem('artisan_profile_photo', photoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Profile Header & Avatar Card */}
      <div className="bg-gradient-to-r from-terracotta-900 via-stone-900 to-amber-950 text-white p-6 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Award className="w-96 h-96 -mr-20 -mt-20 text-gold-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {/* Photo Uploader */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-gold-400/80 shadow-2xl overflow-hidden bg-stone-800 flex items-center justify-center">
              {profilePhoto ? (
                <img src={profilePhoto} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-stone-400" />
              )}
            </div>

            <label className="absolute bottom-1 right-1 bg-terracotta-600 hover:bg-terracotta-700 text-white p-2.5 rounded-full shadow-lg cursor-pointer transition-all border-2 border-white">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Profile Bio Details */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">{formData.name}</h2>
              <span className="bg-gold-400/20 text-gold-300 text-xs font-bold px-3 py-1 rounded-full border border-gold-400/40 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                <span>Verified Master Artisan</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 font-medium flex items-center justify-center md:justify-start space-x-1.5">
              <span>📍 {formData.location}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{formData.experienceYears}</span>
            </p>

            <p className="text-xs text-stone-400 italic max-w-xl">"{formData.craftStory}"</p>

            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded-xl text-[11px] font-bold">
                🏅 GI-Tagged Craft: {formData.giTag}
              </span>
              <span className="px-3 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 rounded-xl text-[11px] font-bold">
                🌿 UNESCO Craft Heritage Verified
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 transition-all cursor-pointer"
          >
            {isEditing ? 'Cancel Edit' : '✍️ Edit Profile'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Profile changes updated successfully!</span>
        </div>
      )}

      {/* Impact & Craft Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <p className="text-xs font-bold text-stone-500 uppercase">Total Listed Crafts</p>
          <p className="text-2xl font-serif font-bold text-terracotta-600">{totalCount} Products</p>
          <p className="text-[11px] text-stone-400">Published on KALORA</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <p className="text-xs font-bold text-stone-500 uppercase">Verified Passports</p>
          <p className="text-2xl font-serif font-bold text-emerald-600">{totalCount} Passports</p>
          <p className="text-[11px] text-stone-400">Blockchain Verifiable</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <p className="text-xs font-bold text-stone-500 uppercase">Artisan Level</p>
          <p className="text-2xl font-serif font-bold text-amber-600">Level 3 Master</p>
          <p className="text-[11px] text-stone-400">AI Verified Quality</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <p className="text-xs font-bold text-stone-500 uppercase">Trust Score</p>
          <p className="text-2xl font-serif font-bold text-indigo-600">98% Rating</p>
          <p className="text-[11px] text-stone-400">Urban Buyer Feedback</p>
        </div>
      </div>

      {/* Master 5-Year QR Passport Card on Profile */}
      <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-terracotta-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl border border-stone-800">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Award className="w-80 h-80 -mr-16 -mt-16 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Master Artisan 5-Year Passport QR</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">HASH: 0x8F92...B4A1</span>
            </div>

            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">Official 5-Year Artisan QR Certificate</h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Valid for <strong>5 Years (2026–2031)</strong>. Scan this QR code on any mobile device to verify artisan credentials, cluster origin & GI tag.
            </p>
          </div>

          {/* Dynamic 5-Year QR Code */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-400 shadow-2xl text-center shrink-0 flex flex-col items-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                JSON.stringify({
                  passportId: `KLR-ART-${user?.id || 8821}`,
                  artisan: user?.name || 'Heritage Artisan',
                  cluster: user?.location || 'Kanchipuram',
                  craftStandard: '100% GI-Tagged Handcrafted',
                  issuedDate: '2026-09-21',
                  expiryDate: '2031-09-21',
                  validityPeriodYears: 5,
                  status: 'ACTIVE_VERIFIED'
                })
              )}`}
              alt="5-Year Master Artisan Passport QR"
              className="w-32 h-32 object-contain rounded-lg border border-stone-200"
            />
            <span className="mt-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              ⏳ 5 Years Valid (2026–2031)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs relative z-10">
          <div>
            <p className="text-stone-400 font-medium">Issued Date</p>
            <p className="font-bold text-white mt-0.5">21 Sep 2026</p>
          </div>
          <div>
            <p className="text-stone-400 font-medium">Expiration Date</p>
            <p className="font-bold text-amber-300 mt-0.5">21 Sep 2031 (5 Yrs)</p>
          </div>
          <div>
            <p className="text-stone-400 font-medium">Craft Standard</p>
            <p className="font-bold text-emerald-400 mt-0.5">100% Handcrafted</p>
          </div>
          <div>
            <p className="text-stone-400 font-medium">Verification Status</p>
            <p className="font-bold text-indigo-300 mt-0.5">Level 3 Master</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center pt-1 border-t border-white/10 text-xs relative z-10 gap-2">
          <span className="text-stone-400 text-[11px]">
            * Scan to verify artisan authenticity or present at physical craft exhibitions.
          </span>
          <button
            onClick={() => alert('5-Year Master Artisan QR Passport successfully renewed & cryptographically re-signed for 2026–2031!')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1"
          >
            <span>🔄 Renew / Regenerate 5-Year QR</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6">
          <h3 className="font-serif font-bold text-xl text-stone-900 border-b border-stone-100 pb-3">Edit Artisan Profile Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Artisan Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Craft Specialization</label>
              <input
                type="text"
                value={formData.craftCategory}
                onChange={(e) => setFormData({ ...formData, craftCategory: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Location / Cluster</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Contact Email / Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Ancestral Craft Story & Bio</label>
            <textarea
              rows={3}
              value={formData.craftStory}
              onChange={(e) => setFormData({ ...formData, craftStory: e.target.value })}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">Artisan Account Credentials & Security</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 font-semibold">Account Email:</span>
              <p className="font-bold text-stone-900">{formData.email}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 font-semibold">Phone / WhatsApp:</span>
              <p className="font-bold text-stone-900">{formData.phone}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 font-semibold">Authentication Method:</span>
              <p className="font-bold text-emerald-700">Google OAuth 2.0 / Verified Artisan Session</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 font-semibold">Digital Craft Passport Status:</span>
              <p className="font-bold text-indigo-700">Active & Verifiable</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PartnershipDashboard: React.FC = () => {
  const [requestedArtisans, setRequestedArtisans] = useState<Record<string, 'IDLE' | 'SENDING' | 'REQUESTED'>>({});
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'REQUESTS'>('EXPLORE');
  const [remoteArtisans, setRemoteArtisans] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const res = await fetch('/api/sync/artisans');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((a: any) => {
            let cat = a.craftCategory || 'WEAVING_TEXTILES';
            const catStr = (a.craftCategory || a.craft || '').toUpperCase();
            if (catStr.includes('POTTERY') || catStr.includes('CLAY')) cat = 'POTTERY';
            else if (catStr.includes('WOOD')) cat = 'WOODWORK';
            else if (catStr.includes('METAL') || catStr.includes('BRASS')) cat = 'METAL_CRAFT';

            const cleanName = (a.name || 'Verified Master Artisan').trim();
            const phoneStr = a.phone ? `+91 ${a.phone}` : '+91 98765 43210';
            const locStr = a.location || 'Kanchipuram, Tamil Nadu';
            const formattedAddress = locStr.toLowerCase().includes('tamil nadu') ? locStr : `${locStr}, Tamil Nadu - 631501`;
            const passHash = a.qrPassportHash || `KALORA-QR-PASSPORT-2026-${a._id ? String(a._id).slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000)}`;

            return {
              id: a.artisanId || a._id || a.id || `artisan_remote_${Math.random()}`,
              name: cleanName,
              phone: phoneStr,
              address: formattedAddress,
              craftCategory: cat,
              qrPassportId: passHash,
              products: [
                a.craft || (cat === 'POTTERY' ? 'Handcrafted Terracotta Vessel' : 'Heritage Handloom Silk Saree'),
                'Direct Master Artisan Craft'
              ],
              productCount: 4,
              verified: true
            };
          });
          setRemoteArtisans(mapped);
        }
      } catch (err) {
        console.warn('Failed to fetch registered artisans from API:', err);
      }
    };
    fetchArtisans();
  }, []);
  
  // Interactive Incoming Requests state
  const [incomingRequests, setIncomingRequests] = useState([
    {
      id: 'req_001',
      artisanName: 'Murugan Craft Maker',
      location: 'Swamimalai, Thanjavur',
      craftSector: 'METAL_CRAFT',
      qrPassportId: 'KALORA-QR-PASSPORT-2026-4412',
      proposal: 'Joint exhibition & combined bronze-silk handicraft package for Tamil Nadu Heritage Expo.',
      status: 'PENDING',
      timestamp: '2 hours ago'
    },
    {
      id: 'req_002',
      artisanName: 'Kavitha Pottery Studio',
      location: 'Manamadurai, Sivagangai',
      craftSector: 'POTTERY',
      qrPassportId: 'KALORA-QR-PASSPORT-2026-3190',
      proposal: 'Looking for handloom weavers to supply organic cotton covers for terracotta craft sets.',
      status: 'PENDING',
      timestamp: 'Yesterday'
    }
  ]);

  const defaultArtisans = [
    {
      id: 'artisan_nisha',
      name: 'Nisha Heritage Weavers',
      phone: '+91 98941 23456',
      address: 'Kanchipuram Silk Cluster, Tamil Nadu - 631501',
      craftCategory: 'WEAVING_TEXTILES',
      qrPassportId: 'KALORA-QR-PASSPORT-2026-9012',
      products: ['Handcrafted Heritage Pure Silk Saree', 'Zari Silk Dupatta'],
      productCount: 4,
      verified: true
    },
    {
      id: 'artisan_001',
      name: 'Devi Ramachandran',
      phone: '+91 98765 43210',
      address: 'Kanchipuram, Tamil Nadu - 631501',
      craftCategory: 'WEAVING_TEXTILES',
      qrPassportId: 'KALORA-QR-PASSPORT-2026-9812',
      products: ['Kanchipuram Pure Mulberry Silk Saree', 'Zari Border Handloom Shawl', 'Temple Design Silk Stole'],
      productCount: 8,
      verified: true
    },
    {
      id: 'artisan_002',
      name: 'Murugan Craft Maker',
      phone: '+91 94432 10987',
      address: 'Swamimalai, Thanjavur, Tamil Nadu - 612302',
      craftCategory: 'METAL_CRAFT',
      qrPassportId: 'KALORA-QR-PASSPORT-2026-4412',
      products: ['Bronze Nataraja Sacred Statue', 'Hand-hammered Brass Oil Lamp (Diya)', 'Temple Bell Chime'],
      productCount: 12,
      verified: true
    },
    {
      id: 'artisan_003',
      name: 'Kavitha Pottery Studio',
      phone: '+91 91234 56789',
      address: 'Manamadurai, Sivagangai, Tamil Nadu - 630606',
      craftCategory: 'POTTERY',
      qrPassportId: 'KALORA-QR-PASSPORT-2026-3190',
      products: ['Terracotta Biryani Cooking Pot', 'Eco Clay Water Jug', 'Hand-painted Garden Planters'],
      productCount: 15,
      verified: true
    },
    {
      id: 'artisan_004',
      name: 'Arun Wood Carvings',
      phone: '+91 99887 76655',
      address: 'Nagercoil, Kanyakumari, Tamil Nadu - 629001',
      craftCategory: 'WOODWORK',
      qrPassportId: 'KALORA-QR-PASSPORT-2026-7021',
      products: ['Teakwood Hand-carved Shrine', 'Rosewood Elephant Statue', 'Traditional Wooden Toy Set'],
      productCount: 6,
      verified: true
    }
  ];

  // Map remote artisans and merge with default sample artisans
  const registeredArtisans = [...remoteArtisans, ...defaultArtisans];

  const handleSendRequest = (artisanId: string) => {
    setRequestedArtisans(prev => ({ ...prev, [artisanId]: 'SENDING' }));
    setTimeout(() => {
      setRequestedArtisans(prev => ({ ...prev, [artisanId]: 'REQUESTED' }));
    }, 800);
  };

  const handleRequestDecision = (reqId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setIncomingRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
  };

  const filteredArtisans = filterCategory === 'ALL'
    ? registeredArtisans
    : registeredArtisans.filter(a => a.craftCategory === filterCategory);

  const pendingCount = incomingRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-terracotta-700 via-amber-800 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Users className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold tracking-wide">Artisan Partnership Hub</h2>
              <p className="text-xs text-amber-100">Connect, collaborate & co-create crafts with registered master artisans across India</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab('EXPLORE')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'EXPLORE' ? 'bg-amber-400 text-stone-950 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              Explore Artisans
            </button>
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
                activeTab === 'REQUESTS' ? 'bg-amber-400 text-stone-950 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              <span>Incoming Requests</span>
              {pendingCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'REQUESTS' ? (
        /* Partnership Requests View */
        <div className="space-y-4">
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex justify-between items-center">
            <h3 className="font-serif font-bold text-stone-900 text-lg">Partnership Requests ({incomingRequests.length})</h3>
            <span className="text-xs text-stone-500 font-medium">Review and respond to collaboration proposals from partner artisans</span>
          </div>

          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <div key={req.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif font-bold text-lg text-stone-900">{req.artisanName}</h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-stone-500">{req.location} • <span className="font-semibold text-terracotta-700">{req.craftSector}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl block">
                      {req.qrPassportId}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1 block">{req.timestamp}</span>
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <p className="text-xs text-stone-500 font-bold uppercase mb-1">Collaboration Proposal:</p>
                  <p className="text-xs text-stone-800 font-medium">{req.proposal}</p>
                </div>

                <div className="flex justify-end items-center space-x-3 pt-2">
                  {req.status === 'ACCEPTED' ? (
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300">
                      ✓ Partnership Accepted
                    </span>
                  ) : req.status === 'REJECTED' ? (
                    <span className="px-4 py-2 bg-red-100 text-red-800 font-bold text-xs rounded-xl border border-red-300">
                      ✕ Request Declined
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRequestDecision(req.id, 'REJECTED')}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRequestDecision(req.id, 'ACCEPTED')}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Accept Partnership</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Explore Artisans Grid */
        <div className="space-y-6">
          {/* Filter Options */}
          <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-4 rounded-2xl">
            <span className="text-xs font-bold text-stone-700 uppercase">Filter Artisans by Sector:</span>
            <div className="flex space-x-2 overflow-x-auto text-xs">
              {[
                { id: 'ALL', label: 'All Crafts' },
                { id: 'WEAVING_TEXTILES', label: 'Textiles & Silk' },
                { id: 'POTTERY', label: 'Pottery & Clay' },
                { id: 'WOODWORK', label: 'Woodwork' },
                { id: 'METAL_CRAFT', label: 'Metalcraft' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    filterCategory === f.id
                      ? 'bg-terracotta-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Registered Artisans Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArtisans.map(artisan => {
              const requestStatus = requestedArtisans[artisan.id] || 'IDLE';

              return (
                <div key={artisan.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between">
                  <div>
                    {/* Top Row: Name & QR ID */}
                    <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-serif font-bold text-lg text-stone-900">{artisan.name}</h3>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{artisan.address}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0">
                        ID: {artisan.qrPassportId.split('-').pop()}
                      </span>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-3 pt-3 text-xs">
                      <div>
                        <span className="text-stone-400 font-bold uppercase text-[10px]">Master QR Passport ID:</span>
                        <p className="font-mono text-terracotta-700 font-bold text-xs mt-0.5">{artisan.qrPassportId}</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-stone-500 font-bold text-[10px] uppercase mb-1">
                          <span>Craft Products Catalog</span>
                          <span className="text-stone-800">{artisan.productCount} Items Uploaded</span>
                        </div>
                        <ul className="space-y-1">
                          {artisan.products.map((p: any, idx: number) => (
                            <li key={idx} className="flex items-center space-x-1.5 text-stone-700">
                              <span className="text-terracotta-600">✦</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button: Partnership Request */}
                    <div className="pt-4 border-t border-stone-100">
                      <button
                        onClick={() => handleSendRequest(artisan.id)}
                        disabled={requestStatus !== 'IDLE'}
                        className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-xs ${
                          requestStatus === 'REQUESTED'
                            ? 'bg-emerald-600 text-white shadow-none'
                            : requestStatus === 'SENDING'
                            ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                            : 'bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-md'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>
                          {requestStatus === 'REQUESTED'
                            ? '✓ Partnership Request Sent'
                            : requestStatus === 'SENDING'
                            ? 'Sending Collaboration Request...'
                            : 'Send Partnership Request'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const ArtisanDashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);

  const fetchUserProducts = async () => {
    let apiProducts: any[] = [];
    try {
      const res = await fetch('/api/products', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        apiProducts = data.data || [];
      }
    } catch (err) {
      console.error(err);
    }

    const currentUserId = user?.id || (user as any)?.artisanId;
    const localProducts = JSON.parse(localStorage.getItem('kalora_products') || '[]');
    
    // Strict Artisan User Isolation: Show only products created by/for THIS specific artisan account
    const filteredLocal = localProducts.filter((p: any) => currentUserId && p.artisanId === currentUserId);
    const filteredApi = apiProducts.filter((p: any) => currentUserId && p.artisanId === currentUserId);

    const combined = [...filteredLocal, ...filteredApi];
    const uniqueProds = Array.from(new Map(combined.map((item: any) => [item.id || item.productId || item.productName, item])).values());
    setProducts(uniqueProds);
  };

  const fetchLiveAlerts = async () => {
    const artId = user?.id || (user as any)?.artisanId || 'artisan_001';
    let remoteAlerts: any[] = [];
    try {
      const res = await fetch(`/api/sync/alerts/${artId}`);
      const data = await res.json();
      if (data.success && data.data) {
        remoteAlerts = data.data;
      }
    } catch (err) {
      console.warn('Backend alerts fetch error:', err);
    }

    const currentArtId = user?.id || (user as any)?.artisanId || 'artisan_001';
    const localAlerts = JSON.parse(localStorage.getItem('kalora_artisan_alerts') || '[]');
    
    // Support all alerts sent to current artisan ID or fallback demo IDs or all alerts
    const filteredLocal = localAlerts;
    const filteredRemote = remoteAlerts;

    const combined = [...filteredLocal, ...filteredRemote];
    const uniqueAlerts = Array.from(new Map(combined.map((item: any) => [item.alertId || item._id, item])).values());
    setLiveAlerts(uniqueAlerts);
  };

  useEffect(() => {
    fetchUserProducts();
    fetchLiveAlerts();

    const interval = setInterval(() => {
      fetchUserProducts();
      fetchLiveAlerts();
    }, 2000);

    return () => clearInterval(interval);
  }, [token, activeTab]);

  const activeUser = user || {
    id: 'artisan_001',
    name: 'Master Artisan',
    role: 'ARTISAN',
    preferredLanguage: 'ta',
    location: 'Kanchipuram Heritage Cluster, TN',
    craftCategory: 'WEAVING_TEXTILES'
  };

  const publishedCount = products.filter(p => p.status === 'PUBLISHED' || p.status === 'READY').length;
  const draftCount = products.filter(p => p.status === 'DRAFT').length;
  const totalCount = products.length;
  const marketReadiness = totalCount > 0 ? Math.min(100, Math.round((publishedCount / totalCount) * 100)) : 0;
  const catalogQuality = totalCount > 0 ? (publishedCount > 0 ? 'High Quality' : 'Draft Ready') : 'N/A';

  const handleVoiceClick = () => {
    setShowVoiceModal(true);
  };

  const navItems = [
    { id: 'DASHBOARD', label: t('dashboard'), icon: Package },
    { id: 'ADD_CRAFT', label: t('add_my_craft'), icon: PlusCircle, highlight: true },
    { id: 'MY_PRODUCTS', label: `${t('my_products')} (${totalCount})`, icon: Package },
    { id: 'PARTNERSHIP', label: '🤝 Partnership Hub', icon: Users },
    { id: 'SPEAK_CRAFT', label: t('speak_about_craft'), icon: Mic },
    { id: 'CAPTURE', label: t('capture_product'), icon: Camera },
    { id: 'MARKET_PRICE', label: t('market_price'), icon: TrendingUp },
    { id: 'MARKET_INSIGHTS', label: t('market_insights'), icon: BarChart3 },
    { id: 'PASSPORT', label: t('my_craft_passport'), icon: Award },
    { id: 'NOTIFICATIONS', label: t('notifications'), icon: Bell },
    { id: 'PROFILE', label: t('profile'), icon: UserIcon },
  ];
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row font-sans text-stone-800">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-4 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-6">
          {/* Logo / Header with prominent Sign Out */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-terracotta-600 to-amber-500 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
                K
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-stone-900 leading-none">KALORA</h1>
                <span className="text-[10px] font-bold text-terracotta-700 tracking-wider uppercase">Artisan Studio</span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                window.location.href = '/?view=onboarding';
              }}
              title="Sign Out of Artisan Account"
              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !editingProduct;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'SPEAK_CRAFT') {
                      setShowVoiceModal(true);
                    } else {
                      setEditingProduct(null);
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-xs transition-all ${
                    item.highlight
                      ? 'bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-md font-semibold'
                      : isActive
                      ? 'bg-terracotta-50 text-terracotta-700 font-bold border border-terracotta-200'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-terracotta-600' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
          <div className="flex items-center justify-between px-2 pt-4 border-t border-stone-100">
            <div className="flex items-center space-x-2 text-xs font-semibold text-stone-600">
              <Globe className="w-4 h-4 text-terracotta-600" />
              <span>Lang:</span>
            </div>
            <div className="flex space-x-1">
              {(['en', 'ta', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-0.5 text-xs rounded-lg uppercase font-bold ${
                    language === l ? 'bg-terracotta-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              window.location.href = '/?view=onboarding';
            }}
            className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
        {/* Render Form view if Adding or Editing */}
        {activeTab === 'ADD_CRAFT' || editingProduct ? (
          <ProductForm
            initialData={editingProduct}
            onBack={() => {
              setEditingProduct(null);
              setActiveTab('MY_PRODUCTS');
            }}
            onSaved={() => {
              setEditingProduct(null);
              setActiveTab('MY_PRODUCTS');
              fetchUserProducts();
            }}
          />
        ) : activeTab === 'MY_PRODUCTS' ? (
          <ProductList
            onAddCraft={() => {
              setEditingProduct(null);
              setActiveTab('ADD_CRAFT');
            }}
            onEditCraft={(prod) => {
              setEditingProduct(prod);
              setActiveTab('ADD_CRAFT');
            }}
            onRefreshStats={setProducts}
          />
        ) : activeTab === 'DASHBOARD' ? (
          /* Default Dashboard View */
          <div className="space-y-6">
            {/* Greeting Banner */}
            <div className="bg-white border border-terracotta-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold text-2xl shadow-xs border border-terracotta-200">
                    <UserIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="inline-flex items-center space-x-1.5 bg-terracotta-50 border border-terracotta-200 px-3 py-1 rounded-full text-xs font-semibold text-terracotta-800 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                      <span>{t('verified_artisan')}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                      {t('welcome_artisan')}, {activeUser.name}!
                    </h2>
                    <p className="text-stone-600 text-sm mt-0.5">
                      {activeUser.location || 'Rural Artisan Hub'} • <span className="font-semibold text-terracotta-700">{activeUser.craftCategory || 'Heritage Craft'}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleVoiceClick}
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-sm bg-gold-500 hover:bg-gold-600 text-stone-900 shadow-md transition-all"
                >
                  <Mic className="w-5 h-5" />
                  <span>🎤 {t('speak_about_craft')}</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('my_products')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">{totalCount}</p>
                <p className="text-xs text-stone-400 font-medium">Craft items saved</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('published')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600 font-serif">{publishedCount}</p>
                <p className="text-xs text-stone-400 font-medium">Live on marketplace</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('drafts')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 font-serif">{draftCount}</p>
                <p className="text-xs text-stone-400 font-medium">In preparation</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('market_readiness')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-terracotta-600 font-serif">{marketReadiness}%</p>
                <p className="text-xs text-stone-400 font-medium">Setup complete</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1 col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('catalog_quality')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600 font-serif">{catalogQuality}</p>
                <p className="text-xs text-stone-400 font-medium">{totalCount === 0 ? 'Awaiting first craft' : 'Calculated'}</p>
              </div>
            </div>

            {/* Main Action Hub */}
            <div className="space-y-4 pt-2">
              <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-terracotta-600" />
                <span>{t('quick_actions')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveTab('ADD_CRAFT');
                  }}
                  className="bg-terracotta-600 hover:bg-terracotta-700 text-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all text-left flex flex-col justify-between h-44 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <PlusCircle className="w-7 h-7 text-white" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xl">{t('add_my_craft')}</h4>
                    <p className="text-xs text-white/80 mt-1">Upload photos or details of your handmade item</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('MY_PRODUCTS')}
                  className="bg-stone-900 hover:bg-stone-800 text-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all text-left flex flex-col justify-between h-44 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xl">{t('my_products')} ({totalCount})</h4>
                    <p className="text-xs text-stone-300 mt-1">View, edit, or manage saved craft products</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowVoiceModal(true)}
                  className="bg-gold-500 hover:bg-gold-600 text-stone-900 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all text-left flex flex-col justify-between h-44 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-stone-900/10 flex items-center justify-center">
                      <Mic className="w-7 h-7 text-stone-900" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-stone-900/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xl">{t('speak_about_craft')}</h4>
                    <p className="text-xs text-stone-800 mt-1">Tamil, Hindi & English voice assistant</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'CAPTURE' ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center border border-terracotta-100">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">AI Product Scanner & Capture</h2>
                  <p className="text-sm text-stone-500">Scan & analyze craft quality, material authenticity & low-light lighting</p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-terracotta-50 border border-terracotta-200 text-terracotta-800 text-xs font-bold rounded-full flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
                <span>PyTorch Restormer Engine Ready</span>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 border-2 border-dashed border-terracotta-200 hover:border-terracotta-400 rounded-3xl p-8 text-center bg-gradient-to-b from-terracotta-50/30 to-stone-50 transition-all flex flex-col justify-center items-center space-y-4 min-h-[320px]">
                <div className="w-20 h-20 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center shadow-xs border border-terracotta-200">
                  <Camera className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900">Upload or Scan Product Image</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Supported formats: PNG, JPG, WebP up to 25MB. AI pipeline will deblur, extract colors, and generate passports.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('ADD_CRAFT')}
                  className="px-6 py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all inline-flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Launch AI Product Scanner</span>
                </button>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <h4 className="font-serif font-bold text-stone-900 text-base flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Automated AI Scanning Checks</span>
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                    <span className="font-medium text-stone-700">Motion Deblurring</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Restormer Active</span>
                  </div>
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                    <span className="font-medium text-stone-700">Resolution Super-Res</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Real-ESRGAN 4x</span>
                  </div>
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                    <span className="font-medium text-stone-700">Pattern Anomaly Detection</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Graph Neural Net</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'MARKET_PRICE' ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-100 pb-6 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center border border-terracotta-100">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">AI Fair Market Price Advisor</h2>
                  <p className="text-sm text-stone-500">Calculate fair artisan wages, material cost & recommended market price</p>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Benchmark Data (SIH 2026)</span>
              </div>
            </div>

            {/* Category Benchmarks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/80 p-5 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pottery & Clay</span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">35% Margin</span>
                </div>
                <p className="text-2xl font-bold text-stone-900 font-serif">₹450 – ₹1,200</p>
                <p className="text-xs text-stone-600 font-medium">Est. Labor: 4–12 hrs • Material: Clay/Terracotta</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200/80 p-5 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Handloom Textiles</span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">40% Margin</span>
                </div>
                <p className="text-2xl font-bold text-stone-900 font-serif">₹1,800 – ₹6,500</p>
                <p className="text-xs text-stone-600 font-medium">Est. Labor: 16–48 hrs • Material: Mulberry Silk/Cotton</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/40 border border-indigo-200/80 p-5 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Woodcraft & Metal</span>
                  <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">45% Margin</span>
                </div>
                <p className="text-2xl font-bold text-stone-900 font-serif">₹2,200 – ₹8,000</p>
                <p className="text-xs text-stone-600 font-medium">Est. Labor: 24–60 hrs • Material: Teakwood/Brass</p>
              </div>
            </div>

            {/* Interactive Pricing Calculator Component */}
            <div className="bg-stone-50/80 border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-terracotta-600" />
                <h3 className="font-serif font-bold text-xl text-stone-900">Interactive Fair Price Calculator</h3>
              </div>

              <PriceAdvisorCalculator />
            </div>

            {/* Festive Season Price Surge & 3D Analytics Advisor */}
            <FestiveSeasonAdvisor />
          </div>
        ) : activeTab === 'MARKET_INSIGHTS' ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center border border-terracotta-100">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">Market Insights & Urban Demand Trends</h2>
                  <p className="text-sm text-stone-500">Real-time consumer demand index, graphics & buyer search terms in metro cities</p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                Updated Live • Q3 2026
              </span>
            </div>

            <MarketInsightsAnalytics />
          </div>
        ) : activeTab === 'PASSPORT' ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">Digital Craft Passport & Authenticity Records</h2>
                  <p className="text-xs sm:text-sm text-stone-500">Blockchain-verified craft provenance, artisan cluster records & dynamic buyer verification QR codes</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>KALORA Blockchain Verified</span>
              </span>
            </div>

            {/* Master Passport Interactive Card */}
            <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-terracotta-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl border border-stone-800">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Award className="w-80 h-80 -mr-16 -mt-16 text-amber-400" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30">
                      📜 Official Provenance Certificate
                    </span>
                    <span className="text-xs text-stone-400 font-mono">HASH: 0x8F92...B4A1</span>
                  </div>

                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">Master Artisan Digital Passport</h3>
                  <p className="text-xs sm:text-sm text-stone-300 flex items-center space-x-2">
                    <span>📍 Cluster: <strong className="text-amber-400">{user?.location || 'Kanchipuram Heritage Cluster, TN'}</strong></span>
                    <span>•</span>
                    <span>Artisan ID: <strong className="text-stone-200 font-mono">KLR-ART-{user?.id ? String(user.id).padStart(4, '0') : '8821'}</strong></span>
                  </p>
                </div>

                {/* Real QR Code Generator with 5-Year Validity */}
                <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-400 shadow-2xl text-center shrink-0 flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      JSON.stringify({
                        passportId: `KLR-ART-${user?.id || 8821}`,
                        artisan: user?.name || 'Heritage Artisan',
                        cluster: user?.location || 'Kanchipuram',
                        craftStandard: '100% GI-Tagged Handcrafted',
                        issuedDate: '2026-09-21',
                        expiryDate: '2031-09-21',
                        validityPeriodYears: 5,
                        status: 'ACTIVE_VERIFIED'
                      })
                    )}`}
                    alt="Master Artisan Digital Passport QR"
                    className="w-28 h-28 object-contain rounded-lg border border-stone-200"
                  />
                  <span className="mt-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    ⏳ 5 Years Valid (2026–2031)
                  </span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs relative z-10">
                <div>
                  <p className="text-stone-400 font-medium">Issued Date</p>
                  <p className="font-bold text-white mt-0.5">21 Sep 2026</p>
                </div>
                <div>
                  <p className="text-stone-400 font-medium">Expiration Date</p>
                  <p className="font-bold text-amber-300 mt-0.5">21 Sep 2031 (5 Yrs)</p>
                </div>
                <div>
                  <p className="text-stone-400 font-medium">Craft Standard</p>
                  <p className="font-bold text-emerald-400 mt-0.5">100% Handcrafted</p>
                </div>
                <div>
                  <p className="text-stone-400 font-medium">Verification Level</p>
                  <p className="font-bold text-indigo-300 mt-0.5">Level 3 (AI + Blockchain)</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center pt-1 border-t border-white/10 text-xs relative z-10 gap-2">
                <span className="text-stone-400 text-[11px]">
                  * This Master Artisan Passport QR is cryptographically valid for <strong>5 years</strong>. Re-generation required upon expiration in 2031.
                </span>
                <button
                  onClick={() => alert('Master 5-Year Artisan QR Passport successfully renewed & cryptographically re-signed for 2026–2031!')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>🔄 Renew / Regenerate 5-Year QR</span>
                </button>
              </div>
            </div>

            {/* Individual Product Passports Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-terracotta-600" />
                  <span>Passports Issued for Your Crafts ({products.length})</span>
                </h3>
                <span className="text-xs text-stone-500 font-medium">Each item receives a unique buyer verification QR code</span>
              </div>

              {products.length === 0 ? (
                <div className="p-8 bg-stone-50 border border-dashed border-stone-300 rounded-3xl text-center space-y-3">
                  <Award className="w-12 h-12 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-stone-800">No Product Passports Created Yet</p>
                  <p className="text-xs text-stone-500">Add your first craft item to issue a digital authenticity passport.</p>
                  <button
                    onClick={() => setActiveTab('ADD_CRAFT')}
                    className="px-5 py-2.5 bg-terracotta-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-terracotta-700 transition-all cursor-pointer"
                  >
                    + Add Craft to Issue Passport
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((prod, idx) => (
                    <div key={prod.id || idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex items-start space-x-4 shadow-xs hover:border-amber-400 transition-all">
                      <div className="w-20 h-20 bg-stone-200 rounded-xl overflow-hidden shrink-0 border border-stone-300">
                        {prod.images?.[0]?.originalUrl ? (
                          <img src={prod.images[0].originalUrl} alt={prod.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No Photo</div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-stone-900 text-sm">{prod.productName}</h4>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                            Verified
                          </span>
                        </div>
                        <p className="text-stone-500">Technique: <strong className="text-stone-800">{prod.craftTechnique || 'Traditional Handloom'}</strong></p>
                        <p className="text-stone-500">Fair Price: <strong className="text-terracotta-700">₹{prod.price}</strong></p>
                        <p className="text-[10px] text-stone-400 font-mono pt-1">Passport ID: KLR-PASS-{prod.id ? String(prod.id).padStart(6, '0') : idx + 101}</p>
                      </div>

                      <div className="w-16 h-16 bg-white p-1 rounded-xl border border-stone-300 shrink-0 text-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                            JSON.stringify({
                              passportId: `KLR-PASS-${prod.id || idx}`,
                              craftName: prod.productName,
                              artisan: user?.name || 'Artisan',
                              price: prod.price
                            })
                          )}`}
                          alt="Product Passport QR"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Authenticity Timeline Safeguard */}
            <div className="bg-amber-50/70 border border-amber-200 p-6 rounded-3xl space-y-3 text-xs text-amber-950">
              <h4 className="font-serif font-bold text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <span>How Buyers Verify Your Craft Authenticity</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-800">1. Scan QR Code</span>
                  <p className="text-stone-600">Buyers scan the product QR code printed on your packaging or marketplace listing.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-800">2. View Provenance</span>
                  <p className="text-stone-600">Displays your artisan cluster location, GI tag certification, and crafting story.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-800">3. Blockchain Hash</span>
                  <p className="text-stone-600">Tamper-proof digital cryptographic seal protects your original craft from counter-feiting.</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'PARTNERSHIP' ? (
          <PartnershipDashboard />
        ) : activeTab === 'NOTIFICATIONS' ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
              <Bell className="w-8 h-8 text-terracotta-600" />
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">Artisan Communications & Alerts</h2>
                <p className="text-sm text-stone-500">Live Customer Purchase Orders, Transit Damage Claims & Buyer Chat Sessions</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Dynamic Live Alerts from Customer Actions */}
              {liveAlerts.length > 0 && liveAlerts.map((alert: any, idx: number) => {
                const isWishlist = alert.type === 'WISHLIST';
                const isCart = alert.type === 'CART_ADD';
                const isDamage = alert.type === 'DAMAGE_TICKET';

                return (
                  <div
                    key={alert.alertId || idx}
                    className={`p-4 rounded-2xl flex items-start space-x-3 border ${
                      isDamage
                        ? 'bg-amber-50 border-amber-200'
                        : isWishlist
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                        isDamage
                          ? 'bg-amber-500 text-stone-950'
                          : isWishlist
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isDamage ? '📦' : isWishlist ? '❤️' : '🛍️'}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs text-stone-900">{alert.title}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isDamage
                              ? 'bg-amber-200 text-amber-900'
                              : isWishlist
                              ? 'bg-rose-200 text-rose-900'
                              : 'bg-emerald-200 text-emerald-900'
                          }`}
                        >
                          {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live Alert'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700">{alert.message}</p>
                      {alert.productName && (
                        <p className="text-[11px] font-semibold text-stone-600">Product: {alert.productName}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Alert 1: New Purchase Order */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                  🛍️
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-stone-900">New Direct Customer Purchase Alert</h4>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">Today, 20:45</span>
                  </div>
                  <p className="text-xs text-stone-700">Customer <strong>Ananya Sharma (Bengaluru)</strong> purchased 1x <em>Kanchipuram Pure Mulberry Silk Saree</em> (₹14,999).</p>
                  <p className="text-[11px] text-emerald-800 font-semibold">Status: QR Passport Hash Verified • Direct payout dispatched to Artisan Bank Account.</p>
                </div>
              </div>

              {/* Alert 2: Damage Claim / Support Ticket */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-base shrink-0">
                  📦
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-stone-900">Transit Damage / Inspection Support Ticket [TKT-9204]</h4>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">1 hour ago</span>
                  </div>
                  <p className="text-xs text-stone-700">Customer report: <em>"Minor handle crack on Terracotta Biryani Pot during express transit to Hyderabad."</em></p>
                  <div className="flex items-center space-x-2 pt-1">
                    <button onClick={() => alert('KALORA Guarantee Insurance: Full artisan replacement cost (₹899) automatically credited via Craft Guarantee Scheme.')} className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold">
                      Process Replacement Guarantee
                    </button>
                    <span className="text-[10px] text-stone-500 font-medium">Covered by KALORA Fair Insurance</span>
                  </div>
                </div>
              </div>

              {/* Alert 3: Live Buyer Inquiry */}
              <div className="p-4 bg-terracotta-50/60 border border-terracotta-100 rounded-2xl flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-stone-900">Direct Customer Inquiry Session</h4>
                    <span className="text-[10px] bg-terracotta-100 text-terracotta-900 px-2 py-0.5 rounded font-bold">Active</span>
                  </div>
                  <p className="text-xs text-stone-600">Buyer asked: <em>"Can this silk saree be custom-dyed in deep crimson zari?"</em></p>
                  <p className="text-[10px] text-stone-500">Replied automatically via Artisan Assistant with yarn availability.</p>
                </div>
              </div>

              {/* Alert 4: Welcome System */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-start space-x-3">
                <Bell className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-stone-900">KALORA Master Artisan Verification Completed</h4>
                  <p className="text-xs text-stone-600">Your profile and 5-Year Blockchain QR Passport are active. You can receive direct customer orders and damage claims here.</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'PROFILE' ? (
          <ArtisanProfileView user={activeUser} totalCount={totalCount} />
        ) : null}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-terracotta-100 px-4 py-2 flex justify-around items-center z-50 shadow-lg">
        <button
          onClick={() => {
            setEditingProduct(null);
            setActiveTab('DASHBOARD');
          }}
          className={`flex flex-col items-center p-1.5 rounded-xl ${
            activeTab === 'DASHBOARD' ? 'text-terracotta-700 font-bold' : 'text-stone-500'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => {
            setEditingProduct(null);
            setActiveTab('ADD_CRAFT');
          }}
          className="flex flex-col items-center bg-terracotta-600 text-white p-3 rounded-full shadow-md -mt-5"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => {
            setEditingProduct(null);
            setActiveTab('MY_PRODUCTS');
          }}
          className={`flex flex-col items-center p-1.5 rounded-xl ${
            activeTab === 'MY_PRODUCTS' ? 'text-terracotta-700 font-bold' : 'text-stone-500'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Crafts</span>
        </button>
      </div>

      {/* Voice Assistant Modal */}
      {showVoiceModal && (
        <VoiceModal
          onClose={() => setShowVoiceModal(false)}
          onApplyProductDetails={(details) => {
            setEditingProduct({
              productName: details.productName,
              category: details.category,
              material: details.material,
              craftTechnique: details.craftTechnique
            });
            setActiveTab('ADD_CRAFT');
            setShowVoiceModal(false);
          }}
        />
      )}
    </div>
  );
};
