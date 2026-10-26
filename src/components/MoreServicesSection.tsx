import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  Bell,
  ArrowRight,
  ChevronLeft,
  Volume2,
  Filter,
  Layers,
  GraduationCap,
  HeartPulse,
  Compass,
  Wrench,
  Briefcase,
  Scale,
  CreditCard,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Calendar,
  Lock,
  ShieldCheck,
  X,
  Radio,
} from 'lucide-react';
import { ModularService, ServiceCategory, ServiceStatus } from '../types/services';
import { serviceRegistry, SERVICE_CATEGORIES } from '../services/serviceRegistry';

interface MoreServicesSectionProps {
  onOpenServiceTab: (tab: 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'chat') => void;
  onSpeakText: (text: string) => void;
  lang?: string;
  currentWilaya: string;
}

export const MoreServicesSection: React.FC<MoreServicesSectionProps> = ({
  onOpenServiceTab,
  onSpeakText,
  lang = 'ar',
  currentWilaya,
}) => {
  const [services] = useState<ModularService[]>(() => serviceRegistry.getAllServices());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persisted notification requests for upcoming services
  const [notifiedServices, setNotifiedServices] = useState<string[]>(() => {
    const saved = localStorage.getItem('zalovoice_notified_services');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal for confirmation
  const [alertModalInfo, setAlertModalInfo] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('zalovoice_notified_services', JSON.stringify(notifiedServices));
  }, [notifiedServices]);

  // Helper to map icon names to Lucide icons
  const renderServiceIcon = (iconName: string, category: string) => {
    const props = { className: 'w-5 h-5 text-slate-950 stroke-[2.5]' };
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap {...props} />;
      case 'ShoppingBag':
        return <ShoppingBag {...props} />;
      case 'Home':
        return <Home {...props} />;
      case 'Car':
        return <Car {...props} />;
      case 'Utensils':
        return <Utensils {...props} />;
      case 'Calendar':
        return <Calendar {...props} />;
      case 'HeartPulse':
      case 'Stethoscope':
        return <HeartPulse {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Wrench':
        return <Wrench {...props} />;
      case 'Briefcase':
        return <Briefcase {...props} />;
      case 'Scale':
        return <Scale {...props} />;
      case 'CreditCard':
        return <CreditCard {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    const matchesSearch =
      s.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const handleNotifyMe = (service: ModularService) => {
    if (notifiedServices.includes(service.id)) {
      setNotifiedServices(notifiedServices.filter((id) => id !== service.id));
      setAlertModalInfo({
        title: 'إلغاء التنبيه',
        message: `تم إلغاء تنبيه خدمة "${service.titleAr}". لن نرسل إشعاراً عند إطلاقها.`,
      });
      onSpeakText(`تم إلغاء التنبيه لخدمة ${service.titleAr}`);
    } else {
      setNotifiedServices([...notifiedServices, service.id]);
      setAlertModalInfo({
        title: 'تم تسجيل اهتمامك بنجاح',
        message: `سيتم إشعارك فور اكتمال واختبار خدمة "${service.titleAr}" في ولاية ${currentWilaya}. لن يتم تطبيق أي تكاليف أو حجز دون موافقتك الصريحة.`,
      });
      onSpeakText(`تم تسجيل اهتمامك بخدمة ${service.titleAr}. سيتم إشعارك فور إطلاقها في ولاية ${currentWilaya}.`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#05151e] via-[#071f2b] to-[#040e14] text-slate-100 p-4 space-y-4 select-none" dir="rtl">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#06202e] via-[#0b3348] to-[#061d28] border border-cyan-500/30 rounded-3xl p-5 shadow-xl shadow-cyan-950/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1.5 max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full text-[11px] font-bold text-cyan-300">
              <Layers className="w-3.5 h-3.5" />
              <span>البنية المعيارية للخدمات (Modular Architecture)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              خدمات أخرى ومستقبلية
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/70 leading-relaxed">
              سجل الخدمات المتكامل والمخطط له في ZaLoVoice. نُميز بشفافية بين ما يعمل فعلياً اليوم وما هو قيد التطوير وفق معايير الجودة الصارمة.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-sky-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30 shrink-0 font-bold">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن خدمة (صيدليات الحراسة، التكوين المهني، دليل الوثائق، العمل...)"
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#092230]/90 border border-cyan-500/30 text-xs text-white placeholder-cyan-300/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs by Status (Active vs. In Development vs. Planned) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {[
          { id: 'all', label: 'جميع الخدمات', count: services.length },
          { id: 'active', label: 'متاح الآن (نشط)', count: services.filter((s) => s.status === 'active').length },
          { id: 'in_development', label: 'قيد التطوير', count: services.filter((s) => s.status === 'in_development').length },
          { id: 'planned', label: 'مخطط وقريبًا', count: services.filter((s) => s.status === 'planned').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
              selectedStatus === tab.id
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm shadow-cyan-500/20'
                : 'bg-[#092230]/80 text-cyan-200 border-cyan-500/20 hover:border-cyan-400/50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedStatus === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-cyan-950 text-cyan-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Tabs by Category */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-[#0e3549] text-cyan-200 border-cyan-400'
              : 'bg-[#081d29]/70 text-slate-400 border-transparent hover:text-white'
          }`}
        >
          كافة الفئات
        </button>
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-[#0e3549] text-cyan-200 border-cyan-400 shadow-xs'
                : 'bg-[#081d29]/70 text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {cat.nameAr}
          </button>
        ))}
      </div>

      {/* Services Cards List */}
      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-[#082231]/40 border border-cyan-500/20 rounded-3xl p-6">
            <Filter className="w-8 h-8 text-cyan-400/50 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-white">لم يتم العثور على خدمات مطابقة</h4>
            <p className="text-xs text-cyan-200/60 mt-1">جرب تغيير كلمات البحث أو تصفية الفئات.</p>
          </div>
        ) : (
          filteredServices.map((service) => {
            const isActive = service.status === 'active';
            const isInDev = service.status === 'in_development';
            const isPlanned = service.status === 'planned';
            const isNotified = notifiedServices.includes(service.id);

            return (
              <div
                key={service.id}
                className={`p-4 rounded-3xl border transition-all ${
                  isActive
                    ? 'bg-[#082433]/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20 hover:border-emerald-400'
                    : isInDev
                    ? 'bg-[#092230]/80 border-amber-500/30 hover:border-amber-400/50'
                    : 'bg-[#081c28]/70 border-cyan-500/20 hover:border-cyan-400/40'
                }`}
              >
                {/* Header row: Icon, Title, Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
                        isActive
                          ? 'bg-gradient-to-tr from-emerald-400 to-teal-400 shadow-emerald-500/20'
                          : isInDev
                          ? 'bg-gradient-to-tr from-amber-400 to-orange-400 shadow-amber-500/20'
                          : 'bg-gradient-to-tr from-cyan-400 to-sky-400 shadow-cyan-500/20'
                      }`}
                    >
                      {renderServiceIcon(service.icon, service.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{service.titleAr}</h3>
                        {service.requiresAuth && (
                          <span
                            className="p-1 rounded-md bg-slate-800 text-slate-400"
                            title="يتطلب تسجيل الدخول لاحقاً"
                          >
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-cyan-300/70 font-sans">{service.titleEn}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isActive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>متاح الآن</span>
                      </span>
                    )}
                    {isInDev && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>قيد التطوير</span>
                      </span>
                    )}
                    {isPlanned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 border border-purple-500/40 text-purple-300">
                        <Radio className="w-3 h-3 text-purple-400" />
                        <span>مخطط وقريبًا</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  {service.descriptionAr}
                </p>

                {/* Features Tags */}
                {service.features && service.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {service.features.map((feat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-[#05151e] border border-cyan-500/20 text-[10px] text-cyan-200/90 font-medium"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Row: Metrics, Read Aloud, Action Trigger */}
                <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-cyan-300/80 font-medium">
                    {isActive ? (
                      <span className="text-emerald-300 font-bold">{service.metrics?.usersCount}</span>
                    ) : (
                      <span>موعد الإطلاق المستهدف: <strong className="text-amber-300">{service.metrics?.launchTarget}</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Speak Description (Accessibility for blind) */}
                    <button
                      onClick={() =>
                        onSpeakText(
                          `${service.titleAr}. ${service.descriptionAr}. الحالة: ${
                            isActive ? 'متاح الآن' : isInDev ? 'قيد التطوير الفعلي' : 'مخطط للإطلاق مستقبلاً'
                          }`
                        )
                      }
                      aria-label={`استمع لوصف خدمة ${service.titleAr}`}
                      className="p-2 rounded-xl bg-[#092230] text-cyan-300 hover:text-white hover:bg-cyan-900/60 transition-colors border border-cyan-500/30"
                      title="قراءة صوتية للخدمة"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Action button based on real status */}
                    {isActive && service.targetTab ? (
                      <button
                        onClick={() => onOpenServiceTab(service.targetTab as any)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <span>فتح الخدمة</span>
                        <ChevronLeft className="w-4 h-4 stroke-[3]" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNotifyMe(service)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isNotified
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-[#092230] hover:bg-cyan-950 text-cyan-200 hover:text-white border-cyan-500/30'
                        }`}
                      >
                        <Bell className={`w-3.5 h-3.5 ${isNotified ? 'fill-amber-300' : ''}`} />
                        <span>{isNotified ? 'تم تفعيل التنبيه' : 'تنبيهي عند الإطلاق'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {alertModalInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#082231] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">{alertModalInfo.title}</h3>
              </div>
              <button
                onClick={() => setAlertModalInfo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{alertModalInfo.message}</p>
            <button
              onClick={() => setAlertModalInfo(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
