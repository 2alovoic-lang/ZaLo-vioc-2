import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Star,
  MapPin,
  Check,
  Building,
  Users,
  Hotel,
  Compass,
  Sparkles,
} from 'lucide-react';
import { BookingService } from '../types/algeria';

interface BookingsSectionProps {
  bookings: BookingService[];
  selectedWilaya: string;
  onWilayaChange: (wilaya: string) => void;
}

export const BookingsSection: React.FC<BookingsSectionProps> = ({
  bookings,
  selectedWilaya,
  onWilayaChange,
}) => {
  const [activeTab, setActiveTab] = useState<'hotels' | 'flights' | 'events'>('hotels');
  const [checkInDate, setCheckInDate] = useState('2026-05-24');
  const [checkOutDate, setCheckOutDate] = useState('2026-05-25');
  const [guestsCount, setGuestsCount] = useState('2 بالغ');
  const [isBooked, setIsBooked] = useState(false);

  const handleBooking = () => {
    setIsBooked(true);
    setTimeout(() => setIsBooked(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#030f17] text-slate-100 p-4 space-y-4 select-none" dir="rtl">
      {/* Category Tabs (Mockup Screen 8: فنادق · رحلات · فعاليات) */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-[#071d2b] border border-cyan-500/25">
        {[
          { id: 'hotels', label: 'فنادق' },
          { id: 'flights', label: 'رحلات' },
          { id: 'events', label: 'فعاليات' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-cyan-200/70 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Featured Hotel Card (Matching Screen 8) */}
      <div className="bg-[#071d2b] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-xl space-y-3">
        <div className="relative h-48 w-full bg-[#041019] overflow-hidden">
          <img
            src="/src/assets/images/el_aurassi_hotel_algiers_1793230714228.jpg"
            alt="فندق الأوراسي الفاخر في الجزائر العاصمة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-95"
          />
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>5 نجوم</span>
          </div>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-base text-white">فندق الأوراسي</h3>
              <p className="text-xs text-cyan-300/80 mt-0.5">الجزائر العاصمة · إطلالة على الخليج</p>
            </div>
            <div className="text-left">
              <span className="font-black font-mono text-base text-cyan-300 block">8,500 دج</span>
              <span className="text-[10px] text-cyan-200/70">/ الليلة</span>
            </div>
          </div>

          {/* Date Pickers (Screen 8 Layout) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-[#092230] border border-cyan-500/20">
              <span className="text-[10px] text-cyan-300/80 block mb-1">تاريخ الوصول</span>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-[#092230] border border-cyan-500/20">
              <span className="text-[10px] text-cyan-300/80 block mb-1">تاريخ المغادرة</span>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Guests Selector */}
          <div className="p-2.5 rounded-xl bg-[#092230] border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>عدد الضيوف</span>
            </div>
            <select
              value={guestsCount}
              onChange={(e) => setGuestsCount(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="1 بالغ" className="bg-slate-900">1 بالغ</option>
              <option value="2 بالغ" className="bg-slate-900">2 بالغ</option>
              <option value="3 بالغين" className="bg-slate-900">3 بالغين</option>
              <option value="عائلة (4+)" className="bg-slate-900">عائلة (4+)</option>
            </select>
          </div>

          {/* Book Now Button */}
          <button
            onClick={handleBooking}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-transform active:scale-98 cursor-pointer shadow-xl shadow-cyan-500/30"
          >
            {isBooked ? 'تم تأكيد حجزك بنجاح ✓' : 'احجز الآن'}
          </button>
        </div>
      </div>

      {isBooked && (
        <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center animate-fade-in">
          تم إرسال تأكيد الحجز مع رقم المرجع عبر الرسائل النصية والإشعار الصوتي.
        </div>
      )}
    </div>
  );
};
