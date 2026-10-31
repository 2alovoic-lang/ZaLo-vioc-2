import React, { useState } from 'react';
import {
  Utensils,
  MapPin,
  Clock,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { Restaurant, FoodMenuItem } from '../types/algeria';
import { ALGERIAN_WILAYAS } from '../data/algeriaData';

interface RestaurantsSectionProps {
  restaurants: Restaurant[];
  selectedWilaya: string;
  onWilayaChange: (wilaya: string) => void;
}

export const RestaurantsSection: React.FC<RestaurantsSectionProps> = ({
  restaurants,
  selectedWilaya,
  onWilayaChange,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pizza' | 'traditional' | 'fast'>('all');
  const [cart, setCart] = useState<{ item: FoodMenuItem; restaurantName: string; quantity: number }[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesWilaya = !selectedWilaya || selectedWilaya === 'all' || r.wilaya.includes(selectedWilaya);
    if (selectedFilter === 'all') return matchesWilaya;
    if (selectedFilter === 'pizza') return (r.cuisine.includes('بيتزا') || r.name.toLowerCase().includes('pizza')) && matchesWilaya;
    if (selectedFilter === 'traditional') return (r.cuisine.includes('تقليدي') || r.cuisine.includes('جزائرية')) && matchesWilaya;
    if (selectedFilter === 'fast') return (r.cuisine.includes('سريع') || r.cuisine.includes('سندويش')) && matchesWilaya;
    return matchesWilaya;
  });

  const handleQuickOrder = (r: Restaurant) => {
    const dish = r.menu[0] || {
      id: `dish_${r.id}`,
      name: `وجبة خاصة من ${r.name}`,
      priceDzd: 1100,
      description: 'وجبة ساخنة طازجة مع مقبلات ومشروب',
      image: r.image,
    };
    setCart([{ item: dish, restaurantName: r.name, quantity: 1 }]);
    setIsCheckoutOpen(true);
  };

  const subtotal = cart.reduce((sum, c) => sum + c.item.priceDzd * c.quantity, 0);
  const deliveryFee = cart.length > 0 ? 200 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderDone(true);
    setTimeout(() => {
      setOrderDone(false);
      setIsCheckoutOpen(false);
      setCart([]);
    }, 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#030f17] text-slate-100 p-4 space-y-3.5 select-none" dir="rtl">
      {/* Location Bar (Screen 5) */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#071d2b] border border-cyan-500/30 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{selectedWilaya || 'الجزائر العاصمة'}</span>
        </div>
        <div className="relative">
          <select
            value={selectedWilaya}
            onChange={(e) => onWilayaChange(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          >
            <option value="الجزائر العاصمة">الجزائر العاصمة</option>
            {ALGERIAN_WILAYAS.map((w) => (
              <option key={w.code} value={w.nameAr}>
                {w.code} - {w.nameAr}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold">
            <span>تغيير</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Filter Chips Bar (Mockup Screen 5: الكل · بيتزا · مأكولات جزائرية · سريع) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'pizza', label: 'بيتزا' },
          { id: 'traditional', label: 'مأكولات جزائرية' },
          { id: 'fast', label: 'سريع' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setSelectedFilter(chip.id as any)}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs ${
              selectedFilter === chip.id
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                : 'bg-[#071d2b] text-cyan-200/80 border border-cyan-500/20 hover:border-cyan-400'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Restaurant Cards List (Matching Screen 5) */}
      <div className="space-y-3">
        {filteredRestaurants.map((r, index) => {
          const distances = ['1.5 كم', '4 كم', '0.8 كم', '2.2 كم'];
          const dist = distances[index % distances.length];
          return (
            <div
              key={r.id}
              className="bg-[#071d2b] rounded-2xl border border-cyan-500/25 overflow-hidden shadow-lg hover:border-cyan-400/60 transition-all flex flex-col"
            >
              <div className="relative h-40 w-full bg-[#041019] overflow-hidden">
                <img
                  src={r.image || '/src/assets/images/algerian_culinary_dishes_1793230714249.jpg'}
                  alt={r.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover brightness-95 hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{r.rating}</span>
                </div>
              </div>

              <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                <div>
                  <h3 className="font-bold text-sm text-white">{r.name}</h3>
                  <p className="text-[11px] text-cyan-300/70 mt-0.5">{r.cuisine}</p>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-cyan-200/80 py-1 border-y border-cyan-500/15">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{r.deliveryTimeMins} دقيقة</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{dist}</span>
                  </span>
                  <span>·</span>
                  <span className="text-cyan-300">توصيل سريع</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-cyan-300/70">الحد الأدنى: </span>
                    <span className="text-xs font-bold text-white font-mono">{r.minOrderDzd} دج</span>
                  </div>

                  <button
                    onClick={() => handleQuickOrder(r)}
                    className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md shadow-cyan-500/25"
                  >
                    اطلب الآن
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#061824] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>تأكيد طلب الطعام</span>
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderDone ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-bold text-white text-base">تم إرسال طلبك بنجاح!</h4>
                <p className="text-xs text-cyan-200/80">المطعم يقوم بتحضير الوجبة الآن والتوصيل في الموعد.</p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-3 text-xs">
                {cart.map((c) => (
                  <div key={c.item.id} className="flex justify-between items-center py-1">
                    <span className="font-bold text-white">{c.item.name}</span>
                    <span className="font-mono text-cyan-300">{c.item.priceDzd} دج</span>
                  </div>
                ))}

                <div className="border-t border-cyan-500/15 pt-2 flex justify-between font-bold text-cyan-200">
                  <span>رسوم التوصيل</span>
                  <span className="font-mono">{deliveryFee} دج</span>
                </div>

                <div className="border-t border-cyan-500/30 pt-2 flex justify-between font-black text-white text-sm">
                  <span>المجموع الإجمالي</span>
                  <span className="font-mono text-cyan-400">{total.toLocaleString()} دج</span>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/30 cursor-pointer active:scale-98 transition-transform"
                >
                  تأكيد ودفع عند الاستلام (COD)
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
