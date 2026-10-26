import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  Volume2,
  FileText,
  Bookmark,
  Share2,
  CheckCircle,
  ExternalLink,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AcademicTopic } from '../types/algeria';
import { INITIAL_ACADEMIC_TOPICS } from '../data/academicData';

interface AcademicSectionProps {
  topics?: AcademicTopic[];
  onAskAcademicQuestion: (question: string) => void;
  onSpeakText: (text: string) => void;
  lang?: string;
}

export const AcademicSection: React.FC<AcademicSectionProps> = ({
  topics = INITIAL_ACADEMIC_TOPICS,
  onAskAcademicQuestion,
  onSpeakText,
  lang = 'ar',
}) => {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<AcademicTopic | null>(topics[0] || null);

  const filteredTopics = topics.filter((t) => {
    const matchesLevel = selectedLevel === 'all' || t.level === selectedLevel;
    const matchesSubject = selectedSubject === 'all' || t.subject === selectedSubject;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.summary.toLowerCase().includes(search.toLowerCase()) ||
      t.fullExplanation.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSubject && matchesSearch;
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    onAskAcademicQuestion(search.trim());
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 select-none" dir="rtl">
      {/* Top Academic Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-800 rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-cyan-300" />
              <h2 className="text-lg font-bold">البحث الأكاديمي والمدرسي ZaLoVoice</h2>
            </div>
            <p className="text-xs text-cyan-100 max-w-md">
              دروس مشروحة، بحوث جامعية ومدرسية، مراجع موثوقة، وقراءة صوتية مخصصة للطلاب والمكفوفين.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-2xl text-[11px] font-mono text-cyan-200">
            مصادر معتمدة ✓
          </div>
        </div>
      </div>

      {/* Ask Question Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
        <form onSubmit={handleAsk} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="اطلب شرح درس أو مسألة (مثال: اشرح قانون نيوتن الثاني)..."
              className="w-full pr-8 pl-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-white text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>بحث ذكي</span>
          </button>
        </form>

        {/* Level Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium">
          {[
            { id: 'all', label: 'كافة المستويات' },
            { id: 'secondary', label: 'الطور الثانوي والباك' },
            { id: 'middle', label: 'التعليم المتوسط' },
            { id: 'university', label: 'التعليم الجامعي والأبحاث' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedLevel === lvl.id
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Questions Row */}
      <div className="flex gap-2 overflow-x-auto text-[11px] pb-1">
        {[
          'اشرح لي قانون نيوتن الثاني',
          'ما هي مراحل التركيب الضوئي؟',
          'خوارزمية البحث الثنائي Binary Search',
          'محطات مؤتمر الصومام 1956',
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSearch(q);
              onAskAcademicQuestion(q);
            }}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-700 whitespace-nowrap transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3 text-cyan-600" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Topic View or Topic List */}
      <div className="space-y-4">
        {activeTopic ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs p-5 space-y-4 animate-in fade-in">
            {/* Header of Topic */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full">
                    {activeTopic.subject === 'physics'
                      ? 'الفيزياء'
                      : activeTopic.subject === 'biology'
                      ? 'علوم الطبيعة والحياة'
                      : activeTopic.subject === 'computer_science'
                      ? 'علوم الحاسوب والبرمجة'
                      : 'التاريخ الوطني'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activeTopic.level === 'secondary' ? 'مستوى 3 ثانوي / بكالوريا' : 'مستوى جامعي'}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {activeTopic.title}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onSpeakText(`${activeTopic.title}. ${activeTopic.summary}. ${activeTopic.fullExplanation}`)}
                  className="p-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                  title="استماع صوتي للشرح (قارئ الشاشة)"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">قراءة صوتية</span>
                </button>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-3.5 bg-cyan-50/70 border border-cyan-100 rounded-2xl text-xs text-cyan-950 font-medium leading-relaxed">
              <span className="font-bold block mb-1">ملخص الفكرة الأساسية:</span>
              {activeTopic.summary}
            </div>

            {/* Key Formulas (if available) */}
            {activeTopic.keyFormulas && activeTopic.keyFormulas.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">القوانين والعلاقات الرياضية:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  {activeTopic.keyFormulas.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-900 text-cyan-300 text-xs text-center border border-slate-800 shadow-2xs"
                      dir="ltr"
                    >
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Explanation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">الشرح والتحليل العلمي:</h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {activeTopic.fullExplanation}
              </div>
            </div>

            {/* Verified Facts */}
            {activeTopic.verifiedFacts.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800">حقائق علمية مؤكدة:</h4>
                <div className="space-y-1">
                  {activeTopic.verifiedFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-xl">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Citations & Sources */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                <span>المراجع الأكاديمية والمصادر المعتمدة:</span>
              </h4>
              <div className="space-y-2">
                {activeTopic.citations.map((cite, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{cite.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {cite.authorOrPublisher} {cite.year ? `· (${cite.year})` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md font-mono">
                      مرجع رسمي
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Other Available Topics Grid */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700">مواضيع وبحوث أخرى مقترحة</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => {
                  setActiveTopic(topic);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeTopic?.id === topic.id
                    ? 'border-cyan-600 bg-cyan-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                    {topic.subject === 'physics'
                      ? 'فيزياء'
                      : topic.subject === 'biology'
                      ? 'علوم طبيعية'
                      : topic.subject === 'computer_science'
                      ? 'برمجة'
                      : 'تاريخ'}
                  </span>
                  <h5 className="font-bold text-xs text-slate-900 mt-1.5 line-clamp-1">
                    {topic.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] text-cyan-700 font-bold">
                  <span>فتح الدرس والمراجع</span>
                  <ArrowRight className="w-3 h-3 rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
