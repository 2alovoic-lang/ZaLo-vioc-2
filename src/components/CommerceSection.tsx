import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  MessageCircle,
  ShoppingBag,
  Filter,
  Check,
  CreditCard,
  X,
} from 'lucide-react';
import { MarketProduct } from '../types/algeria';
import { ALGERIAN_WILAYAS } from '../data/algeriaData';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<MarketProduct | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'baridimob'>('cod');

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesWilaya = !selectedWilaya || selectedWilaya === 'all' || p.wilaya.includes(selectedWilaya);
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.commune.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesWilaya && matchesSearch;
  });

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setSelectedProductForOrder(null);
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 select-none" dir="rtl">
      {/* Search and Wilaya Filter */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن هاتف، حاسوب، ملابس، قطع غيار..."
              className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
          </div>

          <div className="relative w-36 shrink-0">
            <select
              value={selectedWilaya}
              onChange={(e) => onWilayaChange(e.target.value)}
              className="w-full pr-7 pl-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 appearance-none font-medium text-slate-800"
            >
              <option value="all">كل الولايات (58)</option>
              {ALGERIAN_WILAYAS.map((w) => (
                <option key={w.code} value={w.nameAr}>
                  {w.code} - {w.nameAr}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-sky-600 absolute right-2 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'electronics', label: 'إلكترونيات وهواتف' },
            { id: 'fashion', label: 'أزياء وتقليدي' },
            { id: 'home', label: 'أواني وتراث منزلي' },
            { id: 'auto', label: 'سيارات وقطع غيار' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                  {product.wilaya} · {product.commune}
                </span>
              </div>

              <div className="p-3.5 space-y-1.5">
                <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                  {product.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-base font-black text-sky-700 font-mono">
                    {product.priceDzd.toLocaleString('fr-DZ')} <span className="text-xs font-bold font-sans">دج</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{product.seller.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => onContactSeller(product)}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-sky-700 border border-sky-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>شات البائع</span>
              </button>

              <button
                onClick={() => setSelectedProductForOrder(product)}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>طلب المنتج</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-xs">
          لا توجد منتجات مطابقة في ولاية {selectedWilaya}. جرب البحث في كل الولايات.
        </div>
      )}

      {/* Order Modal with BaridiMob / COD Support */}
      {selectedProductForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">تأكيد طلب الشراء في الجزائر</h3>
              <button
                onClick={() => setSelectedProductForOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900">تم تسجيل طلبك بنجاح!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  سيتواصل معك البائع لتأكيد شحن المنتج إلى عنوانك في {selectedProductForOrder.wilaya}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="p-5 space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <img
                    src={selectedProductForOrder.image}
                    alt={selectedProductForOrder.title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {selectedProductForOrder.title}
                    </h5>
                    <div className="text-sm font-black text-sky-700 font-mono mt-0.5">
                      {selectedProductForOrder.priceDzd.toLocaleString('fr-DZ')} دج
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    طريقة الدفع
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-sky-600 bg-sky-50/70 text-sky-800 font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>الدفع عند الاستلام</span>
                      <span className="text-[10px] text-slate-500">في جميع الولايات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('baridimob')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'baridimob'
                          ? 'border-sky-600 bg-sky-50/70 text-sky-800 font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                        <span>بريدي موب / CIB</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">دفع فوري آمن</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم هاتف المشتري (+213)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="05 / 06 / 07 xx xx xx"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    عنوان التوصيل بالتفصيل
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="البلدية، الحي، ورقم المنزل..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForOrder(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                  >
                    تأكيد الطلب
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
