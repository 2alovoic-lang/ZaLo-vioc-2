import React, { useState } from 'react';
import {
  X,
  User,
  Bell,
  Lock,
  Globe,
  Check,
  Moon,
  Sun,
  Palette,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  Shield,
  Smartphone,
  Phone,
  Edit3,
} from 'lucide-react';
import { UserProfile, Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  lang,
  onLanguageChange,
}) => {
  // Screens: 'profile' (Screen 10 in mockup) | 'appearance' (Screen 11 in mockup) | 'edit'
  const [currentScreen, setCurrentScreen] = useState<'profile' | 'appearance' | 'edit'>('profile');

  // Form states
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim() || user.name,
      phone: phone.trim() || user.phone,
      bio: bio.trim(),
    });
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      setCurrentScreen('profile');
    }, 600);
  };

  const isRtl = lang === 'ar' || lang === 'dz';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-sm bg-[#061824] rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* ============================================================== */}
        {/* SCREEN 10: USER PROFILE (Mockup Screen 10: الملف الشخصي) */}
        {/* ============================================================== */}
        {currentScreen === 'profile' && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#041019]">
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-800 text-cyan-300 transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <span>الملف الشخصي</span>
                <User className="w-4 h-4 text-cyan-400" />
              </h3>
              <div className="w-6" />
            </div>

            {/* Profile Avatar Card */}
            <div className="p-6 flex flex-col items-center text-center border-b border-cyan-500/15 bg-gradient-to-b from-[#082233] to-[#061824]">
              <div className="relative">
                <div className="w-22 h-22 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 shadow-xl shadow-cyan-500/30">
                  <div className="w-full h-full rounded-full bg-[#030f17] flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-10 h-10 text-cyan-300" />
                    )}
                  </div>
                </div>
              </div>

              <h4 className="mt-3 text-lg font-black text-white">{user.name}</h4>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">{user.phone}</p>

              <button
                onClick={() => setCurrentScreen('edit')}
                className="mt-3 px-4 py-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل البيانات</span>
              </button>
            </div>

            {/* Menu Options (Screen 10 Layout) */}
            <div className="p-4 space-y-2">
              {/* 1. الإعدادات */}
              <button
                onClick={() => setCurrentScreen('edit')}
                className="w-full p-3 rounded-2xl bg-[#092230]/70 hover:bg-[#0c2c3e] border border-cyan-500/20 flex items-center justify-between text-right text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span>الإعدادات والحساب</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-cyan-400" />
              </button>

              {/* 2. المظهر (Theme & Font Size - Screen 11) */}
              <button
                onClick={() => setCurrentScreen('appearance')}
                className="w-full p-3 rounded-2xl bg-[#092230]/70 hover:bg-[#0c2c3e] border border-cyan-500/20 flex items-center justify-between text-right text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span>المظهر وتخصيص الواجهة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-cyan-300">الداكن</span>
                  <ChevronLeft className="w-4 h-4 text-cyan-400" />
                </div>
              </button>

              {/* 3. اللغة والمنطقة */}
              <div className="p-3 rounded-2xl bg-[#092230]/70 border border-cyan-500/20 flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span>اللغة واللهجة</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { code: 'ar', label: 'العربية' },
                    { code: 'dz', label: 'الدارجة' },
                    { code: 'fr', label: 'FR' },
                    { code: 'en', label: 'EN' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => onLanguageChange(l.code as Language)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                        lang === l.code
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. الإشعارات */}
              <div className="p-3 rounded-2xl bg-[#092230]/70 border border-cyan-500/20 flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span>الإشعارات الصوتية</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                  مفعلة
                </span>
              </div>

              {/* 5. المساعدة والدعم */}
              <div className="p-3 rounded-2xl bg-[#092230]/70 border border-cyan-500/20 flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span>المساعدة وقارئ الشاشة</span>
                </div>
                <span className="text-[10px] text-cyan-300">نشط</span>
              </div>

              {/* 6. حول التطبيق */}
              <div className="p-3 rounded-2xl bg-[#092230]/70 border border-cyan-500/20 flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Info className="w-4 h-4" />
                  </div>
                  <span>حول ZaLoVoice</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">النسخة الرسمية</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 11: APPEARANCE (Mockup Screen 11: إعدادات المظهر) */}
        {/* ============================================================== */}
        {currentScreen === 'appearance' && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#041019]">
              <button
                onClick={() => setCurrentScreen('profile')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                aria-label="الرجوع إلى الملف الشخصي"
              >
                <ChevronRight className="w-4 h-4" />
                <span>رجوع</span>
              </button>
              <h3 className="font-black text-white text-base">المظهر</h3>
              <div className="w-6" />
            </div>

            <div className="p-5 space-y-6">
              {/* Theme Mode Cards: Dark vs Light (as shown in Screen 11) */}
              <div>
                <label className="text-xs font-black text-cyan-200 mb-3 block">
                  سمة الواجهة (Theme)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-[#082231] border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                        : 'bg-[#051520] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full h-20 rounded-xl bg-[#030f17] border border-cyan-500/30 flex items-center justify-center relative overflow-hidden mb-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Moon className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white">الوضع الداكن</span>
                    {themeMode === 'dark' && (
                      <span className="mt-1 flex items-center gap-1 text-[10px] text-cyan-400 font-bold">
                        <Check className="w-3 h-3" />
                        <span>محدد</span>
                      </span>
                    )}
                  </button>

                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-[#082231] border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                        : 'bg-[#051520] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full h-20 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center relative overflow-hidden mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Sun className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white">الوضع الفاتح</span>
                    {themeMode === 'light' && (
                      <span className="mt-1 flex items-center gap-1 text-[10px] text-cyan-400 font-bold">
                        <Check className="w-3 h-3" />
                        <span>محدد</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Font Size Selector (صغير · متوسط · كبير) */}
              <div>
                <label className="text-xs font-black text-cyan-200 mb-3 block">
                  حجم الخط (Font Size)
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#092230] border border-cyan-500/30">
                  {[
                    { id: 'small', label: 'صغير' },
                    { id: 'medium', label: 'متوسط' },
                    { id: 'large', label: 'كبير' },
                  ].map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setFontSize(size.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        fontSize === size.id
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                          : 'text-cyan-200/70 hover:text-white'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('profile')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 text-xs font-black transition-transform active:scale-98 cursor-pointer shadow-lg shadow-cyan-500/30"
                >
                  حفظ وتطبيق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EDIT PROFILE FORM */}
        {/* ============================================================== */}
        {currentScreen === 'edit' && (
          <form onSubmit={handleSaveProfile} className="flex flex-col flex-1 overflow-y-auto">
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#041019]">
              <button
                type="button"
                onClick={() => setCurrentScreen('profile')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 text-xs"
              >
                <ChevronRight className="w-4 h-4" />
                <span>رجوع</span>
              </button>
              <h3 className="font-black text-white text-base">تعديل البيانات</h3>
              <div className="w-6" />
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-cyan-200 mb-1.5 block">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#092230] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-200 mb-1.5 block">رقم الهاتف (الجزائر)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#092230] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-200 mb-1.5 block">نبذة شخصية</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#092230] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-transform active:scale-98 cursor-pointer shadow-lg shadow-cyan-500/30"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
