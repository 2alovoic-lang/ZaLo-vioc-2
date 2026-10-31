import React, { useState } from 'react';
import {
  Car,
  Navigation,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  Phone,
  User,
  Users,
  Bus,
} from 'lucide-react';

interface TaxiSectionProps {
  currentWilaya: string;
}

export const TaxiSection: React.FC<TaxiSectionProps> = ({ currentWilaya }) => {
  const [pickup, setPickup] = useState('الجزائر العاصمة');
  const [destination, setDestination] = useState('مطار هواري بومدين');
  const [selectedType, setSelectedType] = useState<'taxi' | 'private' | 'collective' | 'intercity'>('taxi');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'assigned'>('idle');

  const rideTypes = [
    {
      id: 'taxi' as const,
      label: 'طاكسي',
      desc: 'سيارة أجرة فردية مرخصة بعداد معتمد',
      price: '650 دج',
      time: '3 دقائق',
      icon: Car,
    },
    {
      id: 'private' as const,
      label: 'سيارة خاصة',
      desc: 'سائق خاص مع سيارة مريحة ومكيفة',
      price: '900 دج',
      time: '5 دقائق',
      icon: Navigation,
    },
    {
      id: 'collective' as const,
      label: 'النقل الجماعي',
      desc: 'مسار مشترك بأسعار اقتصادية مخفضة',
      price: '250 دج',
      time: '8 دقائق',
      icon: Users,
    },
    {
      id: 'intercity' as const,
      label: 'التنقل بين المدن',
      desc: 'سفر مباشر بين الولايات ومحطات الخروبة',
      price: '2,200 دج',
      time: 'حسب الحجز',
      icon: Bus,
    },
  ];

  const handleRequestRide = () => {
    setBookingStatus('searching');
    setTimeout(() => {
      setBookingStatus('assigned');
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#030f17] text-slate-100 p-4 space-y-4 select-none" dir="rtl">
      {/* Route Inputs Card (Matching Screen 6) */}
      <div className="bg-[#071d2b] rounded-2xl border border-cyan-500/30 p-4 shadow-lg space-y-3">
        {/* Map stylized route graphic */}
        <div className="h-20 w-full rounded-xl bg-[#041019] border border-cyan-500/20 relative overflow-hidden flex items-center justify-around px-4">
          <div className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-300/80 block">نقطة الانطلاق</span>
              <span className="text-xs font-bold text-white">{pickup}</span>
            </div>
          </div>

          <div className="flex-1 border-t-2 border-dashed border-cyan-500/40 mx-3 relative">
            <Car className="w-4 h-4 text-cyan-400 absolute -top-2 left-1/2 -translate-x-1/2 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-300/80 block">الوجهة</span>
              <span className="text-xs font-bold text-white">{destination}</span>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#092230] border border-cyan-500/20">
            <span className="text-[11px] font-bold text-cyan-300 w-10">من:</span>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="flex-1 text-xs bg-transparent border-none text-white focus:outline-none"
              placeholder="نقطة الانطلاق..."
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#092230] border border-cyan-500/20">
            <span className="text-[11px] font-bold text-cyan-300 w-10">إلى:</span>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 text-xs bg-transparent border-none text-white focus:outline-none"
              placeholder="الوجهة المطلوبة..."
            />
          </div>
        </div>
      </div>

      {/* Ride Options (Mockup Screen 6: طاكسي · سيارة خاصة · النقل الجماعي · التنقل بين المدن) */}
      <div className="space-y-2">
        <label className="text-xs font-black text-cyan-200 block px-1">نوع الرحلة وسيارات الأجرة</label>
        <div className="space-y-2">
          {rideTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`w-full p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-right ${
                  isSelected
                    ? 'bg-[#082231] border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/40'
                    : 'bg-[#071d2b] border-cyan-500/20 hover:border-cyan-400/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                        : 'bg-[#092230] text-cyan-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{t.label}</h4>
                    <p className="text-[10px] text-cyan-200/70">{t.desc}</p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="font-bold font-mono text-xs text-cyan-300 block">{t.price}</span>
                  <span className="text-[10px] text-cyan-400/80">{t.time}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking Status Card */}
      {bookingStatus === 'searching' && (
        <div className="p-4 rounded-2xl bg-[#082231] border border-cyan-400/50 text-center space-y-2 animate-pulse shadow-xl">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <h4 className="font-bold text-white text-xs">جاري البحث عن أقرب سائق...</h4>
          <p className="text-[11px] text-cyan-200/70">سيتواصل معك السائق فور تأكيد الرحلة</p>
        </div>
      )}

      {bookingStatus === 'assigned' && (
        <div className="p-4 rounded-2xl bg-[#082231] border border-emerald-500/50 space-y-3 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              تم تعيين السائق
            </span>
            <span className="text-xs font-mono text-cyan-300 font-bold">الوصول خلال 3 دقائق</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                ك
              </div>
              <div>
                <h5 className="font-bold text-xs text-white">كريم بلقاسم</h5>
                <p className="text-[10px] text-cyan-200/80">Renault Symbol (16 - 12345)</p>
              </div>
            </div>
            <a
              href="tel:+213550000000"
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Primary CTA Button: "طلب سيارة الآن" (Screen 6) */}
      <div className="pt-2 pb-4">
        <button
          onClick={handleRequestRide}
          disabled={bookingStatus === 'searching'}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-transform active:scale-98 cursor-pointer shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2"
        >
          <Car className="w-4 h-4 stroke-[2.5]" />
          <span>طلب سيارة الآن</span>
        </button>
      </div>
    </div>
  );
};
