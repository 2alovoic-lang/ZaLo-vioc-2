import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ShoppingBag,
  Sparkles,
  Smartphone,
  Shirt,
  Home,
  Heart,
  Star,
  Check,
  X,
} from 'lucide-react';
import { MarketProduct } from '../types/algeria';

interface CommerceSectionProps {
  products: MarketProduct[];
  onContactSeller: (product: MarketProduct) => void;
  selectedWilaya: string;
  onWilayaChange: (wilaya: string) => void;
}

export const CommerceSection: React.FC<CommerceSectionProps> = ({
  products,
  onContactSeller,
  selectedWilaya,
  onWilayaChange,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isOrdered, setIsOrdered] = useState(false);

  // Default featured products matching Mockup Screen 7
  const displayProducts = [
    {
      id: 'prod_earbuds',
      title: 'سماعات لاسلكية',
      category: 'electronics',
      priceDzd: 8900,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
      wilaya: 'الجزائر العاصمة',
      inStock: true,
    },
    {
      id: 'prod_shoes',
      title: 'حذاء رياضي',
      category: 'fashion',
      priceDzd: 6500,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
      wilaya: 'الجزائر العاصمة',
      inStock: true,
    },
    ...products.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      priceDzd: p.priceDzd,
      rating: p.seller.rating || 4.8,
      image: p.image,
      wilaya: p.wilaya,
      inStock: p.inStock,
    })),
  ];

  const filteredProducts = displayProducts.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'beauty', label: 'جمال وصحة', icon: Heart, cat: 'beauty' },
    { id: 'home', label: 'جمال ومطبخ', icon: Home, cat: 'home' },
    { id: 'fashion', label: 'ملابس', icon: Shirt, cat: 'fashion' },
    { id: 'electronics', label: 'إلكترونيات', icon: Smartphone, cat: 'electronics' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#030f17] text-slate-100 p-4 space-y-4 select-none" dir="rtl">
      {/* Search Input Bar (Matching Screen 7) */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن منتج أو متجر..."
          className="w-full pl-4 pr-10 py-3 rounded-2xl bg-[#071d2b] border border-cyan-500/30 text-xs text-white placeholder-cyan-300/40 focus:outline-none focus:border-cyan-400 shadow-md"
        />
        <Search className="w-4 h-4 text-cyan-400 absolute right-3.5 top-3.5 pointer-events-none" />
      </div>

      {/* Category Icons Row (Matching Screen 7) */}
      <div className="grid grid-cols-4 gap-2">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = activeCategory === c.cat;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(isActive ? 'all' : c.cat)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/40 scale-105'
                    : 'bg-[#071d2b] text-cyan-300 border border-cyan-500/30 group-hover:border-cyan-400'
                }`}
              >
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold text-cyan-200/80 text-center">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Products Title */}
      <div className="pt-2">
        <h3 className="text-xs font-black text-cyan-200 block px-1">منتجات مميزة</h3>
      </div>

      {/* 2-Column Product Grid (Matching Screen 7) */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="bg-[#071d2b] rounded-2xl border border-cyan-500/25 overflow-hidden shadow-lg flex flex-col justify-between hover:border-cyan-400/60 transition-all"
          >
            <div className="h-32 w-full bg-[#041019] overflow-hidden relative">
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{item.rating}</span>
              </div>
            </div>

            <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
              <div>
                <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                <span className="text-xs font-black font-mono text-cyan-300 block mt-0.5">
                  {item.priceDzd.toLocaleString()} دج
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(item);
                  setIsOrdered(true);
                  setTimeout(() => setIsOrdered(false), 2000);
                }}
                className="w-full py-1.5 rounded-xl bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 font-black text-[11px] transition-all cursor-pointer shadow-sm active:scale-95"
              >
                طلب الشراء
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Success Banner */}
      {isOrdered && (
        <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs text-center font-bold animate-fade-in">
          تم إضافة طلبك للتوصيل السريع والدفع عند الاستلام بنجاح!
        </div>
      )}

      {/* "المزيد من المنتجات" Button (Screen 7) */}
      <div className="pt-1 pb-4">
        <button
          onClick={() => setActiveCategory('all')}
          className="w-full py-3 rounded-2xl bg-[#071d2b] hover:bg-[#092537] border border-cyan-500/30 text-cyan-200 text-xs font-black transition-all cursor-pointer shadow-md"
        >
          المزيد من المنتجات
        </button>
      </div>
    </div>
  );
};
