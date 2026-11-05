import React from 'react';
import { Calendar, Hotel, Plane, Ticket } from 'lucide-react';
import { BookingService } from '../types/algeria';

interface BookingsSectionProps {
  bookings: BookingService[];
  selectedWilaya: string;
  onWilayaChange: (wilaya: string) => void;
}

export const BookingsSection: React.FC<BookingsSectionProps> = ({ bookings }) => (
  <div className="flex-1 overflow-y-auto bg-[#030f17] text-slate-100 p-4 space-y-4" dir="rtl">
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'فنادق', Icon: Hotel },
        { label: 'رحلات', Icon: Plane },
        { label: 'فعاليات', Icon: Ticket },
      ].map(({ label, Icon }) => (
        <div key={label} className="rounded-2xl bg-[#071d2b] border border-cyan-500/25 p-4 text-center">
          <Icon className="w-6 h-6 text-cyan-300 mx-auto mb-2" />
          <span className="text-xs font-bold">{label}</span>
        </div>
      ))}
    </div>
    {bookings.length === 0 ? (
      <div className="rounded-2xl border border-cyan-500/25 bg-[#071d2b] p-6 text-center space-y-3">
        <Calendar className="w-10 h-10 text-cyan-300 mx-auto" />
        <h2 className="font-bold text-white">لا توجد حجوزات مرتبطة حالياً</h2>
        <p className="text-sm text-cyan-100/75">لم يتم ربط مزودي حجز موثوقين بعد. لن نعرض فندقاً أو سعراً أو موعداً غير متحقق، ولن نؤكد حجزاً دون اتصال فعلي بمزود الخدمة.</p>
      </div>
    ) : (
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-2xl bg-[#071d2b] border border-cyan-500/25 p-4">
            <h3 className="font-bold">{booking.title}</h3>
            <p className="text-xs text-cyan-200/70 mt-1">{booking.description}</p>
            <p className="text-xs text-cyan-300 mt-2">الحجز المباشر غير متاح حتى ربط مزود حقيقي.</p>
          </div>
        ))}
      </div>
    )}
  </div>
);
