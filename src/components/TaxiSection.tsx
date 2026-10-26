import React, { useState } from 'react';
import {
  Car,
  Navigation,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
  Phone,
  User,
  Compass,
} from 'lucide-react';
import { TaxiRideEstimate } from '../types/algeria';
import { ALGERIAN_WILAYAS } from '../data/algeriaData';

interface TaxiSectionProps {
  currentWilaya: string;
}

export const TaxiSection: React.FC<TaxiSectionProps> = ({ currentWilaya }) => {
  const [pickup, setPickup] = useState('مطار هواري بومدين الدولي');
  const [destination, setDestination] = useState('البريد المركزي، وسط الجزائر');
  const [rideType, setRideType] = useState<'eco' | 'comfort' | 'collective'>('eco');
  const [wilaya, setWilaya] = useState(currentWilaya || 'الجزائر العاصمة');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);

  // Booking Flow
  const [rideState, setRideState] = useState<'idle' | 'searching' | 'driver_found'>('idle');
  const [assignedDriver, setAssignedDriver] = useState<any>(null);

  const calculateEstimate = () => {
    let base = 250;
    let rate = rideType === 'comfort' ? 65 : rideType === 'collective' ? 25 : 45;
    let dist = 18.5; // km estimate for demonstration
    let fare = Math.round(base + dist * rate);
    return {
      distanceKm: dist,
      durationMins: 28,
      fareDzd: fare,
    };
  };

  const estimate = calculateEstimate();

  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع غير متوفرة في هذا المتصفح');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const locStr = `موقعي الحالي (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
        setPickup(locStr);
        setGpsLocation(locStr);
      },
      () => {
        setIsLocating(false);
        alert('تعذر الوصول إلى الموقع الجغرافي. يرجى تفعيل إذن الـ GPS في المتصفح.');
      }
    );
  };

  const handleRequestRide = () => {
    setRideState('searching');
    setTimeout(() => {
      setAssignedDriver({
        name: 'ياسين بن مرابط',
        carModel: 'Renault Symbol 2022 بيضاء',
        plateNumber: '16-12345-09',
        rating: 4.9,
        phone: '+213 550 99 88 77',
        etaMins: 4,
      });
      setRideState('driver_found');
    }, 2500);
  };

  const handleCancelRide = () => {
    setRideState('idle');
    setAssignedDriver(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 select-none" dir="rtl">
      {/* Service Header & Transparency Notice */}
      <div className="bg-gradient-to-r from-sky-700 to-blue-800 rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-sky-300" />
              <h2 className="text-lg font-bold">طـاكسي ونـقل ZaLoVioc</h2>
            </div>
            <p className="text-xs text-sky-100 max-w-sm">
              خدمة طلب سيارات الأجرة وVTC بين المدن والولايات الجزائرية بأسعار شفافة بالدينار الجزائري.
            </p>
          </div>
          <div className="text-left font-mono">
            <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs font-sans">
              جاهز في 58 ولاية
            </span>
          </div>
        </div>
      </div>

      {/* Ride Booking Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Wilaya Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ولاية النقل الحالية
          </label>
          <div className="relative">
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium text-slate-800 appearance-none"
            >
              {ALGERIAN_WILAYAS.map((w) => (
                <option key={w.code} value={w.nameAr}>
                  {w.code} - {w.nameAr} ({w.nameFr})
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-sky-600 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Pickup & Destination Inputs */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">نقطة الانطلاق</label>
              <button
                type="button"
                onClick={handleGetGpsLocation}
                className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'جارٍ التحديد...' : 'موقعي الحالي عبر GPS'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute right-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              وجهة الوصول
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute right-3 top-3.5" />
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex gap-1.5 overflow-x-auto pt-1 text-[10px]">
            {[
              'مطار هواري بومدين',
              'محطة أغا',
              'ساحة الشهداء',
              'جامعة باب الزوار',
              'العقيد لطفي وهران',
            ].map((shortcut, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDestination(shortcut)}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 whitespace-nowrap"
              >
                {shortcut}
              </button>
            ))}
          </div>
        </div>

        {/* Ride Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            فئة الرحلة
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: 'eco', name: 'اقتصادي', desc: 'سيارة عادية', price: estimate.fareDzd },
              {
                id: 'comfort',
                name: 'مريح VTC',
                desc: 'سيارة حديثة ومكيفة',
                price: Math.round(estimate.fareDzd * 1.35),
              },
              {
                id: 'collective',
                name: 'طاكسي جماعي',
                desc: 'مشترك للمحطات',
                price: Math.round(estimate.fareDzd * 0.45),
              },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setRideType(type.id as any)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                  rideType === type.id
                    ? 'border-sky-600 bg-sky-50/70 text-sky-900 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                <div>
                  <div className="font-bold">{type.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{type.desc}</div>
                </div>
                <div className="font-black text-sky-700 font-mono mt-2">
                  {type.price} دج
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ride State or Booking CTA */}
        {rideState === 'idle' && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-sky-600" />
                <span>المسافة التقديرية: {estimate.distanceKm} كم</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>المدة المتوقعة: {estimate.durationMins} دقيقة</span>
              </span>
            </div>

            <button
              onClick={handleRequestRide}
              className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>طلب السيارة الآن ({estimate.fareDzd} دج)</span>
            </button>
          </div>
        )}

        {rideState === 'searching' && (
          <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-sky-600 border-t-transparent animate-spin mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">جارٍ البحث عن أقرب سائق في {wilaya}...</h4>
            <p className="text-xs text-slate-500">نقوم بمطابقة مسارك مع السائقين المتاحين في منطقتك.</p>
            <button
              onClick={handleCancelRide}
              className="px-4 py-1.5 rounded-xl text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
            >
              إلغاء الطلب
            </button>
          </div>
        )}

        {rideState === 'driver_found' && assignedDriver && (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-xs text-emerald-900">
                  تم تأكيد السائق وهو في طريقه إليك ({assignedDriver.etaMins} دقائق)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800">
                {estimate.fareDzd} دج
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                  <User className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{assignedDriver.name}</div>
                  <div className="text-[11px] text-slate-600">{assignedDriver.carModel}</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    رقم اللوحة: {assignedDriver.plateNumber}
                  </div>
                </div>
              </div>

              <a
                href={`tel:${assignedDriver.phone}`}
                className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                title="الاتصال بالسائق"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={handleCancelRide}
              className="w-full py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              إنهاء / إلغاء الرحلة
            </button>
          </div>
        )}
      </div>

      {/* Transparent Integration Status Box */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>شفافية التكامل التقني لخدمة النقل</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          الخدمة تعمل في وضع المحاكاة المباشر لجميع ولايات الجزائر. لتفعيل الربط الفعلي مع أساطيل النقل (مثل API الشركاء المحليين أو Google Routes)، يمكنك إضافة مفاتيح الربط في لوحة الإعدادات أو ملف <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code>.
        </p>
      </div>
    </div>
  );
};
