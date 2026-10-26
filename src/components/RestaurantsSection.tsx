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
  const [cart, setCart] = useState<{ item: FoodMenuItem; restaurantName: string; quantity: number }[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const filteredRestaurants = restaurants.filter(
    (r) => !selectedWilaya || selectedWilaya === 'all' || r.wilaya.includes(selectedWilaya)
  );

  const addToCart = (dish: FoodMenuItem, restaurantName: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === dish.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === dish.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item: dish, restaurantName, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === dishId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    );
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
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 select-none" dir="rtl">
      {/* Top Filter */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-sky-600" />
          <span className="font-bold text-xs text-slate-800">مطاعم ووجبات الجزائر</span>
        </div>

        <div className="relative w-36">
          <select
            value={selectedWilaya}
            onChange={(e) => onWilayaChange(e.target.value)}
            className="w-full pr-7 pl-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium text-slate-800 appearance-none"
          >
            <option value="all">كل الولايات (58)</option>
            {ALGERIAN_WILAYAS.map((w) => (
              <option key={w.code} value={w.nameAr}>
                {w.code} - {w.nameAr}
              </option>
            ))}
          </select>
          <MapPin className="w-3.5 h-3.5 text-sky-600 absolute right-2 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Floating Cart Button if has items */}
      {cart.length > 0 && (
        <div className="sticky top-2 z-20 bg-sky-600 text-white p-3 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs">
            <ShoppingBag className="w-4 h-4" />
            <span className="font-bold font-mono">
              {cart.reduce((sum, c) => sum + c.quantity, 0)} وجبات
            </span>
            <span>·</span>
            <span className="font-bold font-mono">{total} دج</span>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="px-4 py-1 rounded-xl bg-white text-sky-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            إتمام الطلب
          </button>
        </div>
      )}

      {/* Restaurants List */}
      <div className="space-y-4">
        {filteredRestaurants.map((rest) => (
          <div
            key={rest.id}
            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs space-y-3 p-4"
          >
            <div className="flex items-start gap-3">
              <img
                src={rest.image}
                alt={rest.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{rest.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rest.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{rest.cuisine}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-600" />
                    <span>{rest.deliveryTimeMins} دقيقة</span>
                  </span>
                  <span>·</span>
                  <span>التوصيل: {rest.deliveryFeeDzd} دج</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700">قائمة الأطباق المتوفرة</h4>
              <div className="space-y-2">
                {rest.menu.map((dish) => {
                  const inCart = cart.find((c) => c.item.id === dish.id);

                  return (
                    <div
                      key={dish.id}
                      className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {dish.name}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                            {dish.description}
                          </p>
                          <div className="text-xs font-black text-sky-700 font-mono mt-0.5">
                            {dish.priceDzd} دج
                          </div>
                        </div>
                      </div>

                      {/* Add/Remove Control */}
                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-1.5 py-0.5 shadow-2xs">
                          <button
                            onClick={() => removeFromCart(dish.id)}
                            className="p-1 text-slate-500 hover:text-rose-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold w-4 text-center">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(dish, rest.name)}
                            className="p-1 text-slate-500 hover:text-sky-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(dish, rest.name)}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">تأكيد طلب الوجبات</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderDone ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900">تم إرسال طلبك إلى المطعم!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  المطعم يجهز طلبك الآن، وسيقوم عامل التوصيل بالاتصال بك فور الوصول.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="p-5 space-y-4">
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-100 rounded-2xl p-2 bg-slate-50">
                  {cart.map((c) => (
                    <div key={c.item.id} className="flex justify-between text-xs py-1 px-1">
                      <span>
                        {c.item.name} × {c.quantity}
                      </span>
                      <span className="font-mono font-bold">{c.item.priceDzd * c.quantity} دج</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs py-1 px-1 border-t border-slate-200/80 text-slate-500">
                    <span>رسوم التوصيل</span>
                    <span className="font-mono font-bold">{deliveryFee} دج</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 px-1 border-t border-slate-200 text-sky-800 font-black">
                    <span>المجموع الإجمالي</span>
                    <span className="font-mono">{total} دج</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    عنوان الاستلام ورقم الهاتف
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="العنوان والحي..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl mb-2 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="رقم الهاتف: 05 / 06 / 07 xx xx xx"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                  >
                    تأكيد الطلب الآن
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
