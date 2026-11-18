import React, { useState } from 'react';
import { MapPin, Clock, Star, ChevronDown } from 'lucide-react';
import { Restaurant } from '../types/algeria';
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
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesWilaya = !selectedWilaya || selectedWilaya === 'all' || r.wilaya.includes(selectedWilaya);
    if (selectedFilter === 'pizza') return (r.cuisine.includes('بيتزا') || r.name.toLowerCase().includes('pizza')) && matchesWilaya;
    if (selectedFilter === 'traditional') return (r.cuisine.includes('تقليدي') || r.cuisine.includes('جزائرية')) && matchesWilaya;
    if (selectedFilter === 'fast') return (r.cuisine.includes('سريع') || r.cuisine.includes('سندويش')) && matchesWilaya;
    return matchesWilaya;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#030f17] text-slate-100 p-4 space-y-3.5" dir="rtl">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#071d2b] border border-cyan-500/30 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{selectedWilaya || 'كل الولايات'}</span>
        </div>
        <div className="relative">
          <select value={selectedWilaya} onChange={(e) => onWilayaChange(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" aria-label="اختر الولاية">
            <option value="all">كل الولايات</option>
            {ALGERIAN_WILAYAS.map((w) => <option key={w.code} value={w.nameAr}>{w.code} - {w.nameAr}</option>)}
          </select>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold"><span>تغيير</span><ChevronDown className="w-3.5 h-3.5" /></div>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'pizza', label: 'بيتزا' },
          { id: 'traditional', label: 'مأكولات جزائرية' },
          { id: 'fast', label: 'سريع' },
        ].map((chip) => (
          <button key={chip.id} onClick={() => setSelectedFilter(chip.id as typeof selectedFilter)}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all text-xs ${selectedFilter === chip.id ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-[#071d2b] text-cyan-200/80 border border-cyan-500/20'}`}>
            {chip.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredRestaurants.map((r) => (
          <div key={r.id} className="bg-[#071d2b] rounded-2xl border border-cyan-500/25 overflow-hidden shadow-lg">
            {r.image && <img src={r.image} alt={r.name} className="h-40 w-full object-cover" />}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-white">{r.name}</h3>
                {typeof r.rating === 'number' && <span className="flex items-center gap-1 text-xs text-amber-300"><Star className="w-3.5 h-3.5" />{r.rating}</span>}
              </div>
              <p className="text-[11px] text-cyan-300/70">{r.cuisine}</p>
              <div className="flex items-center gap-3 text-[11px] text-cyan-200/80 py-1 border-y border-cyan-500/15">
                {typeof r.deliveryTimeMins === 'number' && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-400" />{r.deliveryTimeMins} دقيقة</span>}
                <span>{r.wilaya}</span>
              </div>
              <p className="text-xs text-cyan-200/80">التواصل والطلب غير متاحين حتى ربط نظام طلب وتوصيل حقيقي.</p>
            </div>
          </div>
        ))}
        {filteredRestaurants.length === 0 && (
          <div className="rounded-2xl border border-cyan-500/20 bg-[#071d2b] p-6 text-center text-sm text-cyan-100/80">
            لا توجد مطاعم موثقة متاحة حالياً. لن نعرض مطاعم أو أسعاراً أو أوقات توصيل تجريبية.
          </div>
        )}
      </div>
    </div>
  );
};
