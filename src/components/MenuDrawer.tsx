import React from 'react';
import {
  X,
  Home,
  GraduationCap,
  ShoppingBag,
  Car,
  Utensils,
  Calendar,
  MessageSquare,
  Eye,
  Settings,
  Cpu,
  Github,
  CheckCircle,
  MapPin,
  Globe,
  Radio,
  Layers,
} from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (service: 'home' | 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'chat' | 'more_services') => void;
  onOpenAccessibility: () => void;
  onOpenSettings: () => void;
  onOpenIntegrations: () => void;
  currentWilaya: string;
  userPhone: string;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectService,
  onOpenAccessibility,
  onOpenSettings,
  onOpenIntegrations,
  currentWilaya,
  userPhone,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="w-full max-w-xs h-full bg-[#05151e] border-r border-cyan-500/20 text-slate-100 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#061e2a] via-[#09293a] to-[#04131b] border-b border-cyan-500/30 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-sky-600 flex items-center justify-center font-black text-xs text-slate-950 shadow-md shadow-cyan-500/30">
                ZV
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">ZaLoVoice</h3>
                <p className="text-[10px] text-cyan-300">مساعدك الذكي ... في كل مكان</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق القائمة"
              className="p-1 rounded-lg text-cyan-300/80 hover:text-white hover:bg-cyan-950/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Location and Phone */}
          <div className="px-4 py-2.5 bg-[#082231]/80 border-b border-cyan-500/20 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentWilaya}</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/80">{userPhone}</span>
          </div>

          {/* Services Links */}
          <div className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => {
                onSelectService('home');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-cyan-950/60 flex items-center gap-2.5 transition-colors cursor-pointer text-white border border-transparent hover:border-cyan-500/30"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>الرئيسية (المساعد الصوتي)</span>
            </button>

            <button
              onClick={() => {
                onSelectService('academic');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-teal-950/60 flex items-center gap-2.5 transition-colors cursor-pointer text-white border border-transparent hover:border-teal-500/30"
            >
              <GraduationCap className="w-4 h-4 text-teal-400" />
              <span>البحث الأكاديمي والتعليمي</span>
            </button>

            <button
              onClick={() => {
                onSelectService('commerce');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-rose-950/60 flex items-center gap-2.5 transition-colors cursor-pointer text-white border border-transparent hover:border-rose-500/30"
            >
              <ShoppingBag className="w-4 h-4 text-rose-400" />
              <span>التجارة والتسوق</span>
            </button>

            <button
              onClick={() => {
                onSelectService('real_estate');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-emerald-950/60 flex items-center gap-2.5 transition-colors cursor-pointer text-white border border-transparent hover:border-emerald-500/30"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>العقارات والسكن</span>
            </button>

            <button
              onClick={() => {
                onSelectService('taxi');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-sky-950/60 flex items-center gap-2.5 transition-colors cursor-pointer text-white border border-transparent hover:border-sky-500/30"
            >
              <Car className="w-4 h-4 text-sky-400" />
              <span>النقل وسيارات الأجرة</span>
            </button>

            <button
              onClick={() => {
                onSelectService('food');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-amber-950/60 flex items-center gap-2.5 transition-colors cursor-pointer text-white border border-transparent hover:border-amber-500/30"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>المطاعم والوجبات</span>
            </button>

            <button
              onClick={() => {
                onSelectService('bookings');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 flex items-center gap-2.5 transition-colors cursor-pointer text-white border border-transparent hover:border-purple-500/30"
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>الحجوزات والخدمات</span>
            </button>

            <button
              onClick={() => {
                onSelectService('chat');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-cyan-950/60 flex items-center gap-2.5 transition-colors cursor-pointer text-white border border-transparent hover:border-cyan-500/30"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>الرسائل والمحادثات</span>
            </button>

            <button
              onClick={() => {
                onSelectService('more_services');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/70 to-blue-950/70 hover:from-cyan-900/80 hover:to-blue-900/80 flex items-center justify-between transition-all cursor-pointer text-white border border-cyan-500/40 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-cyan-300" />
                <span className="font-bold">خدمات أخرى (دليل شامل)</span>
              </div>
              <span className="text-[10px] bg-cyan-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md">
                جديد
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Options */}
        <div className="p-3 border-t border-cyan-500/20 space-y-1.5 text-xs">
          <button
            onClick={() => {
              onOpenAccessibility();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/40 font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>إمكانية الوصول وقارئ الشاشة</span>
          </button>

          <button
            onClick={() => {
              onOpenIntegrations();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl hover:bg-slate-900/80 text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>حالة التكاملات وقاعدة البيانات</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl hover:bg-slate-900/80 text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>إعدادات الحساب واللغات</span>
          </button>

          {/* GitHub Repository Reference */}
          <div className="p-2.5 bg-[#030d13] rounded-xl text-[10px] text-cyan-300/70 font-mono flex items-center justify-between border border-cyan-500/20 mt-1">
            <span className="flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              <span>2alovoic-lang/ZaLo-vioc-2</span>
            </span>
            <CheckCircle className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
