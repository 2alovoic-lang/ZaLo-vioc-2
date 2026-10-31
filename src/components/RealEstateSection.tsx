import React, { useState } from 'react';
import {
  Home,
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Phone,
  MessageCircle,
  Building,
  CheckCircle,
  ChevronDown,
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
  const [listingType, setListingType] = useState<'all' | 'rent' | 'sale' | 'villa' | 'apartment' | 'house'>('rent');
  const [bookedId, setBookedId] = useState<string | null>(null);

  const filteredListings = listings.filter((item) => {
    const matchesWilaya = !selectedWilaya || selectedWilaya === 'all' || item.wilaya.includes(selectedWilaya);
    if (listingType === 'all') return matchesWilaya;
    if (listingType === 'rent') return item.listingType === 'rent' && matchesWilaya;
    if (listingType === 'sale') return item.listingType === 'sale' && matchesWilaya;
    if (listingType === 'villa') return item.propertyType === 'villa' && matchesWilaya;
    if (listingType === 'apartment') return item.propertyType === 'apartment' && matchesWilaya;
    return matchesWilaya;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#030f17] text-slate-100 p-4 space-y-3.5 select-none" dir="rtl">
      {/* Location Selector Bar from Screen 4 */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#071d2b] border border-cyan-500/30 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{selectedWilaya || 'الجزائر العاصمة'}</span>
        </div>
        <div className="relative">
          <select
            value={selectedWilaya}
            onChange={(e) => onWilayaChange(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          >
            <option value="الجزائر العاصمة">الجزائر العاصمة</option>
            {ALGERIAN_WILAYAS.map((w) => (
              <option key={w.code} value={w.nameAr}>
                {w.code} - {w.nameAr}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold">
            <span>تغيير</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Filter Chips Bar (Mockup Screen 4: للإيجار · للبيع · فيلا · شقة · منزل) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {[
          { id: 'rent', label: 'للإيجار' },
          { id: 'sale', label: 'للبيع' },
          { id: 'villa', label: 'فيلا' },
          { id: 'apartment', label: 'شقة' },
          { id: 'all', label: 'الكل' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setListingType(chip.id as any)}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs ${
              listingType === chip.id
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                : 'bg-[#071d2b] text-cyan-200/80 border border-cyan-500/20 hover:border-cyan-400'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Real Estate Cards List (Matching Screen 4) */}
      <div className="space-y-3">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="bg-[#071d2b] rounded-2xl border border-cyan-500/25 overflow-hidden shadow-lg hover:border-cyan-400/60 transition-all flex flex-col"
          >
            <div className="relative h-44 w-full bg-[#041019] overflow-hidden">
              <img
                src={item.images[0] || '/src/assets/images/alger_real_estate_f3_1793230713975.jpg'}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-95 hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 right-2.5">
                <span className="bg-cyan-500/90 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                  {item.listingType === 'rent' ? 'للإيجار' : item.listingType === 'sale' ? 'للبيع' : 'عطلات'}
                </span>
              </div>
            </div>

            <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
              <div>
                <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                <p className="text-[11px] text-cyan-300/70 mt-0.5">
                  {item.wilaya} - {item.commune}
                </p>
              </div>

              {/* Metrics: Rooms, Bath, Surface */}
              <div className="flex items-center gap-3 text-[11px] text-cyan-200/80 py-1 border-y border-cyan-500/15">
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.rooms} غرف</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1 حمام</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.surfaceM2} م²</span>
                </span>
              </div>

              {/* Price & Action Button */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-sm font-black text-white font-mono">
                    {item.priceDzd.toLocaleString()} دج
                  </span>
                  <span className="text-[10px] text-cyan-300/70 font-medium mr-1">/ شهر</span>
                </div>

                <button
                  onClick={() => {
                    setBookedId(item.id);
                    onContactAgent(item);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md ${
                    bookedId === item.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                  }`}
                >
                  {bookedId === item.id ? 'تم الطلب' : 'طلب الآن'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
