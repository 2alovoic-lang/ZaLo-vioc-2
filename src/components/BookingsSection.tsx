import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Star,
  MapPin,
  Check,
  Building,
  UserCheck,
  X,
  Stethoscope,
  Hotel,
  Wrench,
} from 'lucide-react';
import { BookingService } from '../types/algeria';
import { ALGERIAN_WILAYAS } from '../data/algeriaData';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookingModalItem, setBookingModalItem] = useState<BookingService | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesWilaya = !selectedWilaya || selectedWilaya === 'all' || b.wilaya.includes(selectedWilaya);
    return matchesCat && matchesWilaya;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setBookingModalItem(null);
      setSelectedSlot('');
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 select-none" dir="rtl">
      {/* Category Tabs & Wilaya */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto text-xs font-medium">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'medical', label: 'عيادات وأطباء' },
              { id: 'hotel', label: 'فنادق وإقامات' },
              { id: 'artisan', label: 'حرفيون وصيانة' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-36 shrink-0">
            <select
              value={selectedWilaya}
              onChange={(e) => onWilayaChange(e.target.value)}
              className="w-full pr-7 pl-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 appearance-none font-medium text-slate-800"
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
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs p-4 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <img
                src={service.image}
                alt={service.title}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full">
                    {service.category === 'medical'
                      ? 'طبي وصحي'
                      : service.category === 'hotel'
                      ? 'فندقي وسياحي'
                      : 'حرفي منزلي'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{service.rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{service.providerName}</p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <MapPin className="w-3 h-3 text-sky-600" />
                  <span>{service.wilaya}</span>
                  <span>·</span>
                  <span className="font-bold text-sky-700 font-mono">
                    {service.priceDzd.toLocaleString('fr-DZ')} دج
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-2xl">
              {service.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">{service.availableSlots.length}</span>{' '}
                مواعيد متاحة للحجز
              </div>

              <button
                onClick={() => {
                  setBookingModalItem(service);
                  setSelectedSlot(service.availableSlots[0] || '');
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>حجز موعد الآن</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">تأكيد الحجز الفوري</h3>
              <button
                onClick={() => setBookingModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900">تم تأكيد حجزك بنجاح!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  تم إرسال تفاصيل الموعد إلى هاتفك، وتم إخطار {bookingModalItem.providerName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-5 space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="font-bold text-xs text-slate-900">{bookingModalItem.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{bookingModalItem.providerName}</div>
                  <div className="text-sm font-black text-sky-700 font-mono mt-1">
                    {bookingModalItem.priceDzd.toLocaleString('fr-DZ')} دج
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    اختر التوقيت المناسب
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {bookingModalItem.availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'border-sky-600 bg-sky-50 text-sky-800 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الاسم الكامل ورقم الهاتف
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم واللقب..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl mb-2 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="+213 05/06/07 xx xx xx"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBookingModalItem(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                  >
                    تأكيد الموعد
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
