import React, { useState } from 'react';
import {
  Home,
  MapPin,
  Calendar,
  Maximize2,
  Bed,
  Phone,
  MessageCircle,
  Building,
  CheckCircle,
} from 'lucide-react';
import { RealEstateListing } from '../types/algeria';
import { ALGERIAN_WILAYAS } from '../data/algeriaData';

interface RealEstateSectionProps {
  listings: RealEstateListing[];
  onContactAgent: (listing: RealEstateListing) => void;
  selectedWilaya: string;
  onWilayaChange: (wilaya: string) => void;
}

export const RealEstateSection: React.FC<RealEstateSectionProps> = ({
  listings,
  onContactAgent,
  selectedWilaya,
  onWilayaChange,
}) => {
  const [listingType, setListingType] = useState<'all' | 'rent' | 'sale' | 'holiday'>('all');

  const filteredListings = listings.filter((item) => {
    const matchesType = listingType === 'all' || item.listingType === listingType;
    const matchesWilaya = !selectedWilaya || selectedWilaya === 'all' || item.wilaya.includes(selectedWilaya);
    return matchesType && matchesWilaya;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 select-none" dir="rtl">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto text-xs font-medium">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'rent', label: 'كراء (إيجار)' },
              { id: 'sale', label: 'بيع عقارات' },
              { id: 'holiday', label: 'كراء للعطلات' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setListingType(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  listingType === tab.id
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
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

      {/* Real Estate Cards */}
      <div className="space-y-4">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col"
          >
            <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 flex gap-1.5">
                <span className="bg-sky-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  {item.listingType === 'rent'
                    ? 'للكراء'
                    : item.listingType === 'sale'
                    ? 'للبيع'
                    : 'عطلات'}
                </span>
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg">
                  {item.wilaya} · {item.commune}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {item.title}
                </h3>
              </div>

              {/* Price */}
              <div className="text-lg font-black text-sky-700 font-mono">
                {item.priceDzd.toLocaleString('fr-DZ')} <span className="text-xs font-bold font-sans">دج</span>
                {item.period && (
                  <span className="text-xs font-normal text-slate-500 font-sans mr-1">
                    / {item.period === 'month' ? 'شهرياً' : item.period === 'day' ? 'يومياً' : 'سنوياً'}
                  </span>
                )}
              </div>

              {/* Specs */}
              <div className="flex items-center gap-4 text-xs text-slate-600 py-1 border-y border-slate-100">
                <div className="flex items-center gap-1.5 font-mono">
                  <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{item.surfaceM2} م²</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Bed className="w-3.5 h-3.5 text-sky-600" />
                  <span>{item.rooms} غرف</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Building className="w-3.5 h-3.5 text-sky-600" />
                  <span>{item.propertyType === 'apartment' ? 'شقة' : 'فيلا'}</span>
                </div>
              </div>

              {/* Features Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>

              {/* Agent and Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    {item.agent.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{item.agent.name}</span>
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.agent.phone}</div>
                  </div>
                </div>

                <button
                  onClick={() => onContactAgent(item)}
                  className="py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>مراسلة الوكالة</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
