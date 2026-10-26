import React, { useState, useEffect } from 'react';
import {
  Menu,
  Globe,
  Mic,
  MicOff,
  ArrowUp,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Car,
  Home,
  ShoppingBag,
  GraduationCap,
  Calendar,
  Utensils,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  Pencil,
  Check,
  Radio,
  Sliders,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { AccessibilitySettings } from '../types/algeria';

interface HomeVoiceViewProps {
  onNavigateToService: (service: 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'academic' | 'chat' | 'more_services') => void;
  onVoiceTrigger: (customText?: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  accessibilitySettings: AccessibilitySettings;
  onUpdateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  onOpenAccessibilityModal: () => void;
  currentLanguage: string;
  onChangeLanguage: (lang: string) => void;
  currentWilaya: string;
  onOpenMenuDrawer: () => void;
}

export const HomeVoiceView: React.FC<HomeVoiceViewProps> = ({
  onNavigateToService,
  onVoiceTrigger,
  isListening,
  onToggleListening,
  accessibilitySettings,
  onUpdateAccessibility,
  onOpenAccessibilityModal,
  currentLanguage,
  onChangeLanguage,
  currentWilaya,
  onOpenMenuDrawer,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Carousel of real featured services/listings
  const carouselItems = [
    {
      id: 'slide_1',
      badge: 'عقارات موثقة',
      title: 'شقق للإيجار في الجزائر العاصمة (F3 و F4)',
      description: 'شقق مفروشة مطلة على البحر وأحياء هادئة بأسعار تبدأ من 45,000 دج',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=350&auto=format&fit=crop&q=80',
      target: 'real_estate' as const,
    },
    {
      id: 'slide_2',
      badge: 'بحث أكاديمي رسمي',
      title: 'شرح قانون نيوتن الثاني ومسائل البكالوريا',
      description: 'دروس معتمدة وفق منهاج وزارة التربية الوطنية مع التمارين والمعادلات',
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=350&auto=format&fit=crop&q=80',
      target: 'academic' as const,
    },
    {
      id: 'slide_3',
      badge: 'تسوق أصلي',
      title: 'هواتف ذكية وأجهزة مع ضمان وتوصيل لـ 58 ولاية',
      description: 'دفع عند الاستلام أو عبر البطاقة الذهبية CIB مع تجار معتمدين',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=350&auto=format&fit=crop&q=80',
      target: 'commerce' as const,
    },
    {
      id: 'slide_4',
      badge: 'طعام وأصالة',
      title: 'شخشوخة بسكرية، رشتة وكسكسي عاصمي ساخن',
      description: 'أشهى المأكولات الجزائرية المحضرة منزلياً مع توصيل سريع',
      image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=350&auto=format&fit=crop&q=80',
      target: 'food' as const,
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onVoiceTrigger(inputText.trim());
    setInputText('');
  };

  const cycleFontSize = () => {
    const next =
      accessibilitySettings.fontSize === 'normal'
        ? 'large'
        : accessibilitySettings.fontSize === 'large'
        ? 'extralarge'
        : 'normal';
    onUpdateAccessibility({ fontSize: next });
  };

  const isRtl = currentLanguage === 'ar' || currentLanguage === 'dz';

  return (
    <div
      className={`flex-1 overflow-y-auto pb-6 select-none transition-colors duration-200 ${
        accessibilitySettings.highContrast
          ? 'bg-black text-white'
          : 'bg-gradient-to-b from-[#05151e] via-[#071f2b] to-[#040e14] text-slate-100'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. Header Top Bar (matching reference mockup with dark teal glass & glowing accents) */}
      <header
        className={`px-4 pt-3 pb-2.5 flex items-center justify-between z-20 sticky top-0 backdrop-blur-xl ${
          accessibilitySettings.highContrast
            ? 'bg-black/95 border-b border-white/20'
            : 'bg-[#061722]/85 border-b border-cyan-500/20 shadow-md shadow-cyan-950/30'
        }`}
      >
        {/* Menu hamburger */}
        <button
          onClick={onOpenMenuDrawer}
          aria-label="القائمة الجانبية والخدمات"
          className="p-2 rounded-xl text-cyan-300 hover:text-white hover:bg-cyan-950/60 transition-colors cursor-pointer border border-cyan-500/20"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Lockup in Center (from reference: Glowing Cyan wave mic + ZaLoVoice + Slogan) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-500 to-sky-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/40 font-bold">
                <Mic className="w-4 h-4 text-slate-950" />
              </div>
              <span className="absolute -left-1 text-cyan-400 text-xs font-bold animate-pulse">((</span>
              <span className="absolute -right-1 text-cyan-400 text-xs font-bold animate-pulse">))</span>
            </div>

            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              ZaLoVoice
            </span>
          </div>
          <span className="text-[10px] text-cyan-300/80 font-medium tracking-wide">
            مساعدك الذكي ... في كل مكان
          </span>
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            aria-label="اختيار اللغة"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 text-xs font-semibold transition-colors cursor-pointer border border-cyan-500/30"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {currentLanguage === 'ar'
                ? 'العربية'
                : currentLanguage === 'dz'
                ? 'الدارجة'
                : currentLanguage === 'fr'
                ? 'Français'
                : 'English'}
            </span>
            <span className="text-[10px]">⌵</span>
          </button>

          {showLanguageDropdown && (
            <div className="absolute top-full mt-1.5 left-0 z-30 bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-1.5 w-38 animate-in fade-in zoom-in-95">
              {[
                { code: 'ar', label: 'العربية الفصحى' },
                { code: 'dz', label: 'الدارجة الجزائرية' },
                { code: 'en', label: 'English' },
                { code: 'fr', label: 'Français' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChangeLanguage(lang.code);
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full text-right px-3 py-1.5 text-xs rounded-xl flex items-center justify-between hover:bg-cyan-950/60 transition-colors ${
                    currentLanguage === lang.code ? 'text-cyan-300 font-bold bg-cyan-950/80' : 'text-slate-300'
                  }`}
                >
                  <span>{lang.label}</span>
                  {currentLanguage === lang.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 2. Wilaya Badge & Greeting */}
      <section className="px-5 pt-3.5 pb-1 text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full shadow-inner">
          <span className="text-sm">🇩🇿</span>
          <span className="text-xs font-bold text-cyan-200">{currentWilaya}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          مرحبًا، كيف أساعدك؟
        </h2>
        <p className="text-xs sm:text-sm text-cyan-100/70 font-medium max-w-sm mx-auto leading-relaxed">
          تحدث أو اكتب ما تحتاجه، وسأجد لك أفضل الحلول
        </p>
      </section>

      {/* 3. The Centerpiece — Cosmic Particle Radiant Voice Orb (Faithful to reference image) */}
      <section className="px-4 py-3 flex flex-col items-center max-w-md mx-auto relative overflow-hidden">
        {/* Glowing background ambient lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none animate-glow-breathe" />

        <div className="w-full flex items-center justify-around relative z-10">
          {/* Left Side: Accessibility Mode Trigger */}
          <button
            onClick={onOpenAccessibilityModal}
            aria-label="إعدادات إمكانية الوصول وقارئ الشاشة للمكفوفين"
            className="flex flex-col items-center gap-1.5 text-cyan-300/80 hover:text-cyan-200 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#092230]/90 border border-cyan-500/30 shadow-md shadow-cyan-950/40 group-hover:border-cyan-400 flex items-center justify-center text-cyan-300 transition-all group-hover:scale-105">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-cyan-200/90 text-center leading-tight">
              وضع<br />إمكانية الوصول
            </span>
          </button>

          {/* Center: Radiant Particle Audio Microphone Orb */}
          <div className="relative flex flex-col items-center">
            {/* Outer Rotating Cosmic Particle Rings (from reference design) */}
            <div className="absolute -inset-6 rounded-full pointer-events-none flex items-center justify-center opacity-60">
              <svg className="w-44 h-44 animate-spin-slow" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="85" stroke="url(#cyanGlow)" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                <circle cx="100" cy="100" r="72" stroke="url(#cyanGlow)" strokeWidth="1" strokeDasharray="2 8" opacity="0.4" />
                <defs>
                  <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Inner counter-rotating particle spokes */}
            <div className="absolute -inset-4 rounded-full pointer-events-none flex items-center justify-center opacity-40">
              <svg className="w-36 h-36 animate-spin-slow-reverse" viewBox="0 0 160 160" fill="none">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1="80"
                    y1="80"
                    x2={80 + 65 * Math.cos((deg * Math.PI) / 180)}
                    y2={80 + 65 * Math.sin((deg * Math.PI) / 180)}
                    stroke="#38bdf8"
                    strokeWidth="0.75"
                    strokeDasharray="2 6"
                  />
                ))}
              </svg>
            </div>

            {/* Glowing Microphone Button */}
            <button
              onClick={onToggleListening}
              aria-label={isListening ? 'جارٍ الاستماع، اضغط للإيقاف' : 'اضغط لبدء التحدث بالصوت'}
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center text-slate-950 shadow-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 via-amber-400 to-rose-600 scale-105 ring-8 ring-rose-400/40 text-white shadow-rose-600/50'
                  : 'bg-gradient-to-tr from-cyan-400 via-teal-300 to-sky-400 hover:scale-105 active:scale-95 ring-8 ring-cyan-400/25 shadow-cyan-400/50'
              }`}
            >
              {/* Radiating pulse waves */}
              <div className="absolute inset-0 rounded-full border-2 border-white/70 animate-ping pointer-events-none opacity-40" />

              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-slate-950" />
              )}
            </button>

            {/* Live status label */}
            <span className="mt-2.5 text-xs font-black text-cyan-200 tracking-wide">
              {isListening ? 'أنا أستمع إليك الآن...' : 'تحدث الآن'}
            </span>
          </div>

          {/* Right Side: Visualizer Audio Wave */}
          <div className="flex flex-col items-center gap-1.5 text-cyan-300/80">
            <div className="w-11 h-11 rounded-2xl bg-[#092230]/90 border border-cyan-500/30 shadow-md shadow-cyan-950/40 flex items-center justify-center text-cyan-300">
              <div className="flex items-center gap-0.5 h-4">
                <span className={`w-0.5 rounded-full bg-cyan-400 ${isListening ? 'animate-wave-1' : 'h-2'}`} />
                <span className={`w-0.5 rounded-full bg-cyan-400 ${isListening ? 'animate-wave-2' : 'h-4'}`} />
                <span className={`w-0.5 rounded-full bg-cyan-400 ${isListening ? 'animate-wave-3' : 'h-3'}`} />
                <span className={`w-0.5 rounded-full bg-cyan-400 ${isListening ? 'animate-wave-4' : 'h-1'}`} />
              </div>
            </div>
            <span className="text-[11px] font-bold text-cyan-200/90 text-center leading-tight">
              أستمع<br />وأفهم
            </span>
          </div>
        </div>

        {/* Status Pill matching the reference design */}
        <div className="mt-3 px-3.5 py-1 rounded-full bg-[#082231]/80 border border-cyan-500/30 flex items-center gap-2 text-[11px] text-cyan-200">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>التعرف الصوتي نشط — تفضل بالحديث بأي لغة أو لهجة</span>
        </div>
      </section>

      {/* 4. Text Input Bar (Pill shape with pencil and circular blue submit arrow) */}
      <section className="px-5 pb-3 max-w-md mx-auto">
        <form
          onSubmit={handleSubmitText}
          className="relative flex items-center bg-[#092332]/90 border border-cyan-500/35 rounded-full shadow-lg shadow-cyan-950/40 px-3.5 py-1.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all"
        >
          <Pencil className="w-4 h-4 text-cyan-400 mr-1 ml-2 shrink-0" />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب طلبك..."
            aria-label="اكتب طلبك للمساعد الصوتي"
            className="flex-1 text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder-cyan-300/40 text-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="إرسال الطلب"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 disabled:opacity-40 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/30 transition-transform active:scale-95 cursor-pointer shrink-0 font-bold"
          >
            <ArrowUp className="w-4 h-4 stroke-[3]" />
          </button>
        </form>
      </section>

      {/* 5. Accessibility Quick Toolbar (from reference: 4 buttons: قارئ الشاشة, حجم النص, تباين عالي, اللغات) */}
      <section className="px-5 pb-4 max-w-md mx-auto">
        <div className="flex items-center justify-between gap-1 p-1 bg-[#092332]/80 border border-cyan-500/25 rounded-2xl shadow-lg shadow-cyan-950/30 text-[11px] font-bold">
          {/* Screen Reader Toggle */}
          <button
            type="button"
            onClick={() =>
              onUpdateAccessibility({
                screenReaderAnnounce: !accessibilitySettings.screenReaderAnnounce,
              })
            }
            aria-label={accessibilitySettings.screenReaderAnnounce ? 'تعطيل قارئ الشاشة' : 'تفعيل قارئ الشاشة'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
              accessibilitySettings.screenReaderAnnounce
                ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                : 'text-cyan-200 hover:bg-cyan-950/60'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>قارئ الشاشة</span>
          </button>

          {/* Font Size Cycle */}
          <button
            type="button"
            onClick={cycleFontSize}
            aria-label="تغيير حجم النص"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-cyan-200 hover:bg-cyan-950/60 transition-colors cursor-pointer"
          >
            <span className="font-serif font-black text-xs">Aa</span>
            <span>حجم النص</span>
          </button>

          {/* High Contrast Toggle Switch */}
          <button
            type="button"
            onClick={() =>
              onUpdateAccessibility({ highContrast: !accessibilitySettings.highContrast })
            }
            aria-label="تبديل التباين العالي"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
              accessibilitySettings.highContrast
                ? 'bg-black text-yellow-300 border border-yellow-300'
                : 'text-cyan-200 hover:bg-cyan-950/60'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                accessibilitySettings.highContrast ? 'border-yellow-300 bg-yellow-300' : 'border-cyan-400'
              }`}
            />
            <span>تباين عالي</span>
          </button>

          {/* Languages Button */}
          <button
            type="button"
            onClick={() => setShowLanguageDropdown(true)}
            aria-label="اختيار اللغات"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-cyan-200 hover:bg-cyan-950/60 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>اللغات</span>
          </button>
        </div>
      </section>

      {/* 6. Services Section Title (from reference: — خدماتنا —) */}
      <section className="px-5 pb-3 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-cyan-400 rounded-full" />
          <h3 className="text-xs font-black text-cyan-200 tracking-wider uppercase">
            خدماتنا
          </h3>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-cyan-400 rounded-full" />
        </div>

        {/* 6 Services Grid (matching the exact 2x3 cards from reference image) */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. النقل (Transport / Taxi) */}
          <button
            type="button"
            onClick={() => onNavigateToService('taxi')}
            aria-label="خدمة النقل وسيارات الأجرة"
            className="p-3 bg-[#0a2636]/90 hover:bg-[#0e3146] border border-cyan-500/25 hover:border-cyan-400/60 rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex flex-col justify-between text-right cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-600 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Car className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-cyan-400/60 group-hover:text-cyan-300 transition-colors" />
            </div>
            <div>
              <div className="font-black text-xs text-white">النقل</div>
              <div className="text-[10px] text-cyan-200/70 mt-0.5">سيارات الأجرة والتنقل</div>
            </div>
          </button>

          {/* 2. العقارات (Real Estate) */}
          <button
            type="button"
            onClick={() => onNavigateToService('real_estate')}
            aria-label="خدمة العقارات والسكن"
            className="p-3 bg-[#0a2636]/90 hover:bg-[#0e3146] border border-emerald-500/25 hover:border-emerald-400/60 rounded-2xl shadow-lg shadow-emerald-950/40 transition-all flex flex-col justify-between text-right cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Home className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-emerald-400/60 group-hover:text-emerald-300 transition-colors" />
            </div>
            <div>
              <div className="font-black text-xs text-white">العقارات</div>
              <div className="text-[10px] text-emerald-200/70 mt-0.5">بيع - شراء - كراء</div>
            </div>
          </button>

          {/* 3. التجارة (Commerce) */}
          <button
            type="button"
            onClick={() => onNavigateToService('commerce')}
            aria-label="خدمة التجارة والتسوق"
            className="p-3 bg-[#0a2636]/90 hover:bg-[#0e3146] border border-rose-500/25 hover:border-rose-400/60 rounded-2xl shadow-lg shadow-rose-950/40 transition-all flex flex-col justify-between text-right cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-400 to-pink-500 text-slate-950 flex items-center justify-center shadow-md shadow-rose-500/20">
                <ShoppingBag className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-rose-400/60 group-hover:text-rose-300 transition-colors" />
            </div>
            <div>
              <div className="font-black text-xs text-white">التجارة</div>
              <div className="text-[10px] text-rose-200/70 mt-0.5">تسوق بكل سهولة</div>
            </div>
          </button>

          {/* 4. البحث الأكاديمي (Academic Research) */}
          <button
            type="button"
            onClick={() => onNavigateToService('academic')}
            aria-label="خدمة البحث الأكاديمي والتعليمي"
            className="p-3 bg-[#0a2636]/90 hover:bg-[#0e3146] border border-cyan-400/25 hover:border-cyan-300/60 rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex flex-col justify-between text-right cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-md shadow-teal-500/20">
                <GraduationCap className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-cyan-400/60 group-hover:text-cyan-300 transition-colors" />
            </div>
            <div>
              <div className="font-black text-xs text-white">البحث الأكاديمي</div>
              <div className="text-[10px] text-cyan-200/70 mt-0.5">دروس - أبحاث - مصادر</div>
            </div>
          </button>

          {/* 5. الحجوزات (Bookings) */}
          <button
            type="button"
            onClick={() => onNavigateToService('bookings')}
            aria-label="خدمة الحجوزات والمواعيد"
            className="p-3 bg-[#0a2636]/90 hover:bg-[#0e3146] border border-purple-500/25 hover:border-purple-400/60 rounded-2xl shadow-lg shadow-purple-950/40 transition-all flex flex-col justify-between text-right cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-md shadow-purple-500/20">
                <Calendar className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-purple-400/60 group-hover:text-purple-300 transition-colors" />
            </div>
            <div>
              <div className="font-black text-xs text-white">الحجوزات</div>
              <div className="text-[10px] text-purple-200/70 mt-0.5">فنادق - مواعيد - خدمات</div>
            </div>
          </button>

          {/* 6. الطعام (Food & Restaurants) */}
          <button
            type="button"
            onClick={() => onNavigateToService('food')}
            aria-label="خدمة المطاعم والوجبات"
            className="p-3 bg-[#0a2636]/90 hover:bg-[#0e3146] border border-amber-500/25 hover:border-amber-400/60 rounded-2xl shadow-lg shadow-amber-950/40 transition-all flex flex-col justify-between text-right cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Utensils className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-amber-400/60 group-hover:text-amber-300 transition-colors" />
            </div>
            <div>
              <div className="font-black text-xs text-white">الطعام</div>
              <div className="text-[10px] text-amber-200/70 mt-0.5">مطاعم ووجبات</div>
            </div>
          </button>
        </div>

        {/* Modular Extensible Services Banner */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => onNavigateToService('more_services')}
            aria-label="استعراض خدمات أخرى ومستقبلية"
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-[#0a2736]/90 via-[#0e364c]/90 to-[#071d29]/90 border border-cyan-500/35 hover:border-cyan-400 text-right flex items-center justify-between group transition-all cursor-pointer shadow-md shadow-cyan-950/30"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-sky-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <Layers className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">خدمات أخرى (دليل الخدمات الإضافية)</span>
                  <span className="text-[9px] bg-cyan-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                    +8 مجالات
                  </span>
                </div>
                <p className="text-[10px] text-cyan-200/70">الصحة، الصيدليات، السياحة، الوظائف، والخدمات الإدارية</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-lg bg-cyan-950/80 flex items-center justify-center text-cyan-300 group-hover:text-white group-hover:bg-cyan-900 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
          </button>
        </div>
      </section>

      {/* 7. Featured Dynamic Slider Card (from reference mockup) */}
      <section className="px-5 pb-2 max-w-md mx-auto">
        {carouselItems[activeSlide] && (
          <div
            onClick={() => onNavigateToService(carouselItems[activeSlide].target)}
            className="bg-[#092332]/90 border border-cyan-500/30 rounded-3xl p-3 shadow-lg shadow-cyan-950/30 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-between gap-3"
          >
            <img
              src={carouselItems[activeSlide].image}
              alt={carouselItems[activeSlide].title}
              className="w-18 h-18 rounded-2xl object-cover shrink-0 border border-cyan-500/30"
            />
            <div className="flex-1 min-w-0 text-right">
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                {carouselItems[activeSlide].badge}
              </span>
              <h4 className="font-extrabold text-xs text-white mt-1 line-clamp-1">
                {carouselItems[activeSlide].title}
              </h4>
              <p className="text-[10px] text-cyan-200/70 line-clamp-1 mt-0.5">
                {carouselItems[activeSlide].description}
              </p>
            </div>

            <div className="w-8 h-8 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 rotate-180" />
            </div>
          </div>
        )}

        {/* Carousel pagination dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {carouselItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              aria-label={`الشريحة ${i + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === i ? 'w-4 bg-cyan-400' : 'w-1.5 bg-cyan-900/60'
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
