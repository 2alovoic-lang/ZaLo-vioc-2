import React from 'react';
import {
  X,
  Volume2,
  Eye,
  Type,
  Sliders,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AccessibilitySettings } from '../types/algeria';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (updated: Partial<AccessibilitySettings>) => void;
  onTestVoice: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTestVoice,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-600 flex items-center justify-center text-white">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 id="accessibility-title" className="font-bold text-sm">
                إعدادات إمكانية الوصول وقارئ الشاشة (Accessibility)
              </h3>
              <p className="text-[11px] text-slate-400">
                ميزات مصممة خصيصاً للمكفوفين وضعاف البصر وأصحاب الهمم
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق إعدادات إمكانية الوصول"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 1. Blind Assistance Mode (Special Big Button) */}
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-sm text-cyan-950">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>وضع مساعدة المكفوفين الفائق</span>
              </div>
              <p className="text-xs text-cyan-800 leading-relaxed">
                تكبير الأزرار والمؤشرات وقراءة كل النتائج والتنبيهات تلقائياً بصوت واضح.
              </p>
            </div>
            <input
              type="checkbox"
              id="blindAssistanceMode"
              checked={settings.blindAssistanceMode}
              onChange={(e) => onUpdateSettings({ blindAssistanceMode: e.target.checked })}
              className="w-6 h-6 rounded-lg text-cyan-600 focus:ring-cyan-500 cursor-pointer"
            />
          </div>

          {/* 2. Text Size (حجم النص) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-sky-600" />
              <span>حجم الخط والنصوص (Font Scaling)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'طبيعي (100%)', sample: 'Aa' },
                { id: 'large', label: 'كبير (125%)', sample: 'Aa+' },
                { id: 'extralarge', label: 'كبير جداً (150%)', sample: 'Aa++' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onUpdateSettings({ fontSize: s.id as any })}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    settings.fontSize === s.id
                      ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                  }`}
                >
                  <span className="text-base font-black">{s.sample}</span>
                  <span className="text-[11px]">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. High Contrast Mode (تباين عالي) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">وضع التباين العالي (High Contrast)</div>
              <div className="text-[11px] text-slate-500">
                ألوان ذات تباين فائق WCAG AAA لتسهيل القراءة لضعاف البصر
              </div>
            </div>
            <input
              type="checkbox"
              id="highContrastToggle"
              checked={settings.highContrast}
              onChange={(e) => onUpdateSettings({ highContrast: e.target.checked })}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>

          {/* 4. Screen Reader Voice Output (قارئ الشاشة التلقائي) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">القراءة الصوتية التلقائية للنتائج</div>
              <div className="text-[11px] text-slate-500">
                نطق إجابات المساعد الصوتي والنتائج فور ظهورها على الشاشة
              </div>
            </div>
            <input
              type="checkbox"
              id="screenReaderAnnounce"
              checked={settings.screenReaderAnnounce}
              onChange={(e) => onUpdateSettings({ screenReaderAnnounce: e.target.checked })}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>

          {/* 5. Speech Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-600" />
                <span>سرعة النطق الصوتي: {settings.speechRate}x</span>
              </label>
              <button
                type="button"
                onClick={onTestVoice}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>تجربة الصوت</span>
              </button>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>بطيء 0.7x</span>
              <span>عادي 1.0x</span>
              <span>سريع 1.4x</span>
            </div>
          </div>

          {/* 6. Reduced Motion */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">تقليل الحركة والأنيميشن (Reduced Motion)</div>
              <div className="text-[11px] text-slate-500">
                إيقاف الحركات السريعة لتجنب الدوار والانزعاج البصري
              </div>
            </div>
            <input
              type="checkbox"
              id="reducedMotion"
              checked={settings.reducedMotion}
              onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>متوافق مع معايير إمكانية الوصول العالمية W3C WCAG</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            تم الحفظ
          </button>
        </div>
      </div>
    </div>
  );
};
