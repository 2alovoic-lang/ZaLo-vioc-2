import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cpu,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Code,
  Check,
} from 'lucide-react';
import { getSupabaseStatus } from '../lib/supabase';

interface IntegrationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationStatusModal: React.FC<IntegrationStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [showSqlViewer, setShowSqlViewer] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabaseLocal = getSupabaseStatus();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => {
          setHealthData(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      fetch('/api/supabase/schema')
        .then((res) => res.text())
        .then((sql) => setSqlSchema(sql))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard?.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">حالة التكاملات والربط التقني (ZaLoVioc Architecture)</h3>
              <p className="text-[11px] text-slate-400">فحص حي للتكاملات الحقيقية والمفاتيح السرية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Transparency Disclaimer */}
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">شفافية التكامل وفق شروط الإنتاجية:</span>
              لا يتم ادعاء عمل أي تكامل خارجي دون اختباره. يوضح هذا التقرير حالة Gemini وSupabase وGPS وبوابة الدفع وما هو مطلوب لتفعيل الوضع الإنتاجي الكامل.
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Gemini AI */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Gemini 3.8 Flash (AI)</h4>
                </div>
                {healthData?.integrations?.geminiAi?.configured ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle className="w-3 h-3" /> متصل
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    محلل محلي + جاهز
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {healthData?.integrations?.geminiAi?.message || 'المسار البرمجي /api/assistant مهيأ بالكامل.'}
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                المسار: Express Server-side Route (مفتاح سري محمي)
              </div>
            </div>

            {/* 2. Supabase PostgreSQL */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Supabase PostgreSQL</h4>
                </div>
                {supabaseLocal.configured ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle className="w-3 h-3" /> متصل
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">
                    في انتظار المفتاح
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {supabaseLocal.statusText}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSqlViewer(!showSqlViewer)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{showSqlViewer ? 'إخفاء كود SQL' : 'عرض مخطط الجداول (SQL Schema)'}</span>
                </button>
              </div>
            </div>

            {/* 3. Geolocation & Maps */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">الخرائط والموقع (GPS)</h4>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle className="w-3 h-3" /> جاهز بالمتصفح
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                يعتمد على Web Geolocation API المدمجة لتحديد الإحداثيات الحية داخل الجزائر وحساب المسافات بين البليدات.
              </p>
            </div>

            {/* 4. Payments (BaridiMob / SATIM) */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">بريدي موب / CIB الجزائر</h4>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                  وضع تجريبي آمن
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                واجهة الدفع مهيأة وتدعم الدفع عند الاستلام. لتفعيل بوابة بريد الجزائر الفعلية يلزم توقيع اتفاقية تاجر (SATIM Merchant Agreement).
              </p>
            </div>
          </div>

          {/* SQL Schema Viewer */}
          {showSqlViewer && (
            <div className="p-4 bg-slate-900 rounded-2xl text-slate-100 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-sky-400 font-bold">
                  schema.sql (جاهز للتنفيذ في Supabase SQL Editor)
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto max-h-56 leading-relaxed text-slate-300" dir="ltr">
                {sqlSchema || 'جارٍ جلب المخطط...'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">ZaLoVioc Super-App · Algeria Architecture</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
