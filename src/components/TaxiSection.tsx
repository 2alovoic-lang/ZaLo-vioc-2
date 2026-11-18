import React, { useState } from 'react';
import { Car, MapPin, Navigation, ShieldAlert } from 'lucide-react';

interface TaxiSectionProps {
  currentWilaya: string;
}

export const TaxiSection: React.FC<TaxiSectionProps> = ({ currentWilaya }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  return (
    <div className="flex-1 overflow-y-auto bg-[#030f17] text-slate-100 p-4 space-y-4" dir="rtl">
      <div className="rounded-2xl border border-cyan-500/30 bg-[#071d2b] p-4 space-y-3">
        <div className="flex items-center gap-2 text-cyan-200 text-sm font-bold"><Car className="w-5 h-5" />طلب وسيلة نقل</div>
        <p className="text-xs text-cyan-100/70">الولاية المحددة: {currentWilaya}</p>
        <label className="block space-y-1">
          <span className="text-xs text-cyan-300">نقطة الانطلاق</span>
          <div className="flex items-center gap-2 rounded-xl bg-[#092230] border border-cyan-500/20 px-3 py-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <input value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" placeholder="أدخل نقطة الانطلاق" />
          </div>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-cyan-300">الوجهة</span>
          <div className="flex items-center gap-2 rounded-xl bg-[#092230] border border-cyan-500/20 px-3 py-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" placeholder="أدخل الوجهة المطلوبة" />
          </div>
        </label>
      </div>
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
        <ShieldAlert className="w-6 h-6 text-amber-300" />
        <h2 className="font-bold text-amber-100 text-sm">خدمة النقل غير مرتبطة بعد</h2>
        <p className="text-xs leading-6 text-amber-100/75">يمكنك تجهيز تفاصيل الرحلة، لكن لا يمكننا حالياً البحث عن سائق أو إعطاء سعر أو وقت وصول أو تأكيد طلب. لن ننشئ طلباً وهمياً.</p>
      </div>
      <button type="button" disabled={!pickup.trim() || !destination.trim()} className="w-full py-3 rounded-2xl bg-cyan-500/30 text-cyan-100/60 font-bold text-sm cursor-not-allowed" title="يتطلب ربط مزود نقل حقيقي">
        طلب سيارة — غير متاح حالياً
      </button>
    </div>
  );
};
