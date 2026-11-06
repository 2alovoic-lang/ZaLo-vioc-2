import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Mic,
  X,
  Volume2,
  Brain,
  Sparkles,
  Send,
} from 'lucide-react';
import { AccessibilitySettings } from '../types/algeria';
import { processLocalNLP } from '../utils/localAssistantNLP';
import { speakWithFullVoice, stopSpeaking, unlockAudio, playAudioChime } from '../utils/speechManager';

interface HomeVoiceViewProps {
  onNavigateToService: (
    service: 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'academic' | 'chat' | 'more_services'
  ) => void;
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
  accessibilitySettings,
  currentLanguage,
  currentWilaya,
  onOpenMenuDrawer,
}) => {
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [inputText, setInputText] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [assistantSpeechText, setAssistantSpeechText] = useState<string | null>(null);
  const [assistantIsLiveAi, setAssistantIsLiveAi] = useState(false);
  const [assistantSources, setAssistantSources] = useState<Array<{ title?: string; url?: string }>>([]);
  const [showTextInput, setShowTextInput] = useState(false);

  const recognitionRef = useRef<any>(null);
  const processingTimerRef = useRef<any>(null);

  // Initialize Speech Recognition cleanly
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        currentLanguage === 'dz' || currentLanguage === 'ar'
          ? 'ar-DZ'
          : currentLanguage === 'fr'
          ? 'fr-FR'
          : 'en-US';

      recognition.onstart = () => {
        setVoiceState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscribedText(transcript);
        handleSpeechRecognized(transcript);
      };

      recognition.onerror = (event: any) => {
        setVoiceState('idle');
        const errType = event?.error;
        console.warn('Speech recognition error:', errType);
        if (errType === 'not-allowed') {
          const msg = 'يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح، أو يمكنك كتابة طلبك.';
          setAssistantMessage(msg);
          setShowTextInput(true);
          playAudioChime('alert');
          speakTextAloud(msg);
        } else if (errType === 'no-speech') {
          const msg = 'لم أتمكن من سماعك، تفضل بالضغط والتحدث مجدداً أو كتابة طلبك.';
          setAssistantMessage(msg);
          playAudioChime('alert');
          speakTextAloud(msg);
        } else if (errType === 'network') {
          const msg = 'تعذر الاتصال بخدمة التعرف الصوتي. يمكنك كتابة طلبك في الحقل أدناه.';
          setAssistantMessage(msg);
          setShowTextInput(true);
          playAudioChime('alert');
          speakTextAloud(msg);
        }
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      // NOTE: We do not call stopSpeaking() here so that speech output
      // continues uninterrupted when navigating to another tab/service!
    };
  }, [currentLanguage]);

  const startListeningFlow = () => {
    unlockAudio();
    stopSpeaking();
    setAssistantMessage(null);
    setTranscribedText('');
    playAudioChime('listen');

    if (!recognitionRef.current) {
      const msg = 'التعرف الصوتي المباشر غير مدعوم في هذا المتصفح. يمكنك كتابة طلبك وسأرد عليك صوتياً.';
      setAssistantMessage(msg);
      setShowTextInput(true);
      speakTextAloud(msg);
      setVoiceState('idle');
      return;
    }

    try {
      setVoiceState('listening');
      recognitionRef.current.start();
    } catch {
      // If recognition was already running or resetting
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setVoiceState('listening');
          } catch {
            setVoiceState('idle');
            setShowTextInput(true);
          }
        }, 120);
      } catch {
        setVoiceState('idle');
        setShowTextInput(true);
      }
    }
  };

  const cancelListeningOrProcessing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    stopSpeaking();
    if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    setVoiceState('idle');
  };

  const speakTextAloud = (textToSpeak: string) => {
    unlockAudio();
    speakWithFullVoice(textToSpeak, {
      lang: currentLanguage === 'fr' ? 'fr' : currentLanguage === 'en' ? 'en' : 'ar',
      rate: 0.92,
    });
  };

  const handleSpeechRecognized = async (transcript: string) => {
    if (!transcript.trim()) {
      setVoiceState('idle');
      return;
    }

    setVoiceState('processing');
    playAudioChime('success');

    try {
      // 1. Try unified backend assistant API
      let data: any = null;
      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: transcript.trim(),
            context: { currentWilaya },
            language: currentLanguage,
          }),
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch {
        data = null;
      }

      // 2. Seamless local NLP fallback
      if (!data || !data.reply) {
        data = processLocalNLP(transcript.trim(), currentWilaya);
      }

      const textToSpeak = data.speechText || data.reply;
      setAssistantMessage(data.reply);
      setAssistantSpeechText(textToSpeak);
      setAssistantIsLiveAi(data.isAiLive === true);
      setAssistantSources(Array.isArray(data.citations) ? data.citations.filter((source: any) => typeof source?.url === 'string').slice(0, 6) : []);

      // Spoken voice reply in clear Arabic
      speakTextAloud(textToSpeak);

      // Graceful navigation if actionType matches a destination tab
      if (data.actionType === 'navigate_to_tab' && data.targetTab && data.targetTab !== 'home') {
        const target = data.targetTab;
        if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
        processingTimerRef.current = setTimeout(() => {
          setVoiceState('idle');
          onNavigateToService(target as any);
        }, 1300);
      } else {
        setVoiceState('idle');
      }
    } catch {
      // Emergency safe local fallback
      const fallback = processLocalNLP(transcript.trim(), currentWilaya);
      const textToSpeak = fallback.speechText || fallback.reply;
      setAssistantMessage(fallback.reply);
      setAssistantSpeechText(textToSpeak);
      setAssistantIsLiveAi(false);
      setAssistantSources([]);
      speakTextAloud(textToSpeak);
      if (fallback.actionType === 'navigate_to_tab' && fallback.targetTab && fallback.targetTab !== 'home') {
        const target = fallback.targetTab;
        if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
        processingTimerRef.current = setTimeout(() => {
          setVoiceState('idle');
          onNavigateToService(target as any);
        }, 1300);
      } else {
        setVoiceState('idle');
      }
    }
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const query = inputText.trim();
    setInputText('');
    setTranscribedText(query);
    setShowTextInput(false);
    handleSpeechRecognized(query);
  };

  // Soundwave bar heights for left and right visualizers (matching user's reference mockup)
  const leftBarHeights = [4, 7, 12, 20, 32, 18, 14, 26, 16, 9, 4];
  const rightBarHeights = [4, 9, 16, 26, 14, 18, 32, 20, 12, 7, 4];

  return (
    <div
      className="flex-1 flex flex-col justify-between select-none relative overflow-hidden bg-[#010914] text-slate-100"
      dir="ltr"
    >
      {/* Ambient Radial Deep Blue Glow behind the Orb */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-[#0055aa]/20 blur-[90px] pointer-events-none" />

      {/* ============================================================== */}
      {/* 2. CENTERPIECE — THE FUTURISTIC VOICE ORB & SOUNDWAVE FREQUENCIES */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-2 my-auto">
        <div className="relative flex items-center justify-center w-full max-w-sm">

          {/* LEFT HORIZONTAL SOUNDWAVE EQUALIZER BARS (Matching Mockup) */}
          <div className="absolute right-[50%] mr-24 sm:mr-28 flex items-center gap-[3px] pointer-events-none">
            {/* Outermost tip dot */}
            <span className="w-1 h-1 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#00e5ff] mr-0.5" />
            {leftBarHeights.map((h, i) => (
              <span
                key={`left-bar-${i}`}
                className={`w-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff] transition-all duration-200 ${
                  voiceState === 'listening' ? `animate-audio-bar-${(i % 5) + 1}` : ''
                }`}
                style={{
                  height: `${h}px`,
                  opacity: 0.85 + (i % 3) * 0.05,
                }}
              />
            ))}
          </div>

          {/* CENTRAL FUTURISTIC ORB BUTTON */}
          <div className="relative flex items-center justify-center">

            {/* Outermost Orbit Ring with Tick Marks & Dots (Matching Mockup) */}
            <div className="absolute w-[240px] h-[240px] rounded-full pointer-events-none flex items-center justify-center">
              <svg className="w-full h-full animate-spin-slow opacity-60" viewBox="0 0 240 240" fill="none">
                <circle
                  cx="120"
                  cy="120"
                  r="112"
                  stroke="#00e5ff"
                  strokeWidth="1"
                  strokeDasharray="4 8 1 8"
                  opacity="0.4"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="118"
                  stroke="#00b0ff"
                  strokeWidth="0.75"
                  strokeDasharray="1 14"
                  opacity="0.6"
                />
                <circle cx="120" cy="8" r="2" fill="#00e5ff" opacity="0.8" />
                <circle cx="232" cy="120" r="2" fill="#00e5ff" opacity="0.8" />
                <circle cx="120" cy="232" r="2" fill="#00e5ff" opacity="0.8" />
                <circle cx="8" cy="120" r="2" fill="#00e5ff" opacity="0.8" />
              </svg>
            </div>

            {/* Middle Glowing Cyan Ring */}
            <div
              className={`absolute w-[208px] h-[208px] rounded-full border border-cyan-400/50 pointer-events-none transition-all duration-500 ${
                voiceState === 'listening' ? 'scale-110 border-cyan-300 shadow-[0_0_30px_#00e5ff]' : 'animate-orbit-pulse'
              }`}
            />

            {/* Inner Glowing Halo Ring */}
            <div
              className={`absolute w-[184px] h-[184px] rounded-full pointer-events-none transition-all duration-300 ${
                voiceState === 'listening'
                  ? 'bg-cyan-500/25 blur-xl scale-110'
                  : 'bg-cyan-500/15 blur-lg'
              }`}
            />

            {/* The Main Glowing Sphere & Microphone Button */}
            <button
              onClick={voiceState === 'listening' ? cancelListeningOrProcessing : startListeningFlow}
              aria-label={voiceState === 'listening' ? 'جارٍ الاستماع، اضغط للإيقاف' : 'اضغط لبدء المحادثة الصوتية'}
              className={`relative z-10 w-[176px] h-[176px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 group ${
                voiceState === 'listening'
                  ? 'ring-4 ring-cyan-300/80 scale-105'
                  : 'hover:scale-[1.03]'
              }`}
              style={{
                background: 'radial-gradient(circle at 50% 50%, #021a36 0%, #032348 48%, #006ddb 84%, #00d9ff 97%, #ffffff 100%)',
                border: '3px solid #53dfff',
                boxShadow:
                  voiceState === 'listening'
                    ? '0 0 70px #00e5ff, inset 0 0 35px #00e5ff, 0 0 120px rgba(0, 229, 255, 0.6)'
                    : '0 0 42px rgba(0, 190, 255, 0.78), inset 0 0 24px rgba(0, 229, 255, 0.86), 0 0 76px rgba(0, 110, 255, 0.34), 0 0 16px rgba(247, 195, 75, 0.20)',
              }}
            >
              {voiceState === 'processing' ? (
                <Brain className="w-16 h-16 text-cyan-200 animate-pulse stroke-[1.8]" />
              ) : (
                <Mic
                  className={`w-18 h-18 text-white transition-transform duration-300 stroke-[2.2] drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] ${
                    voiceState === 'listening' ? 'scale-110 animate-bounce' : 'group-hover:scale-105'
                  }`}
                />
              )}
            </button>
          </div>

          {/* RIGHT HORIZONTAL SOUNDWAVE EQUALIZER BARS (Matching Mockup) */}
          <div className="absolute left-[50%] ml-24 sm:mr-0 sm:ml-28 flex items-center gap-[3px] pointer-events-none">
            {rightBarHeights.map((h, i) => (
              <span
                key={`right-bar-${i}`}
                className={`w-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff] transition-all duration-200 ${
                  voiceState === 'listening' ? `animate-audio-bar-${((i + 2) % 5) + 1}` : ''
                }`}
                style={{
                  height: `${h}px`,
                  opacity: 0.85 + (i % 3) * 0.05,
                }}
              />
            ))}
            {/* Outermost tip dot */}
            <span className="w-1 h-1 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#00e5ff] ml-0.5" />
          </div>

        </div>

        {/* LOWER HORIZONTAL AUDIO FREQUENCY BAR: - · ||||| · - (Exact match from mockup) */}
        <div className="mt-8 flex items-center justify-center gap-1.5 h-6">
          <span className="w-4 h-[1.5px] bg-cyan-400/60 rounded-full" />
          <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
          <div className="flex items-center gap-1 mx-1">
            <span className="w-1 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
            <span className="w-1 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#00e5ff]" />
            <span className="w-1.5 h-5 rounded-full bg-cyan-200 shadow-[0_0_10px_#00e5ff]" />
            <span className="w-1 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#00e5ff]" />
            <span className="w-1 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
          </div>
          <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
          <span className="w-4 h-[1.5px] bg-cyan-400/60 rounded-full" />
        </div>

        {/* Live Listening / Processing Text Feedback */}
        {voiceState === 'listening' && (
          <div className="mt-4 flex flex-col items-center animate-fade-in">
            <span className="text-sm font-bold text-cyan-200 tracking-wide drop-shadow-[0_0_8px_#00e5ff]">
              أستمع إليك الآن...
            </span>
            <button
              onClick={cancelListeningOrProcessing}
              className="mt-2 px-4 py-1 rounded-full bg-slate-900/80 border border-cyan-500/40 text-[11px] text-cyan-300 hover:text-white"
            >
              إلغاء
            </button>
          </div>
        )}

        {voiceState === 'processing' && (
          <div className="mt-4 flex flex-col items-center animate-fade-in">
            <span className="text-sm font-bold text-cyan-200 tracking-wide">
              جاري تحليل طلبك...
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              {[0, 1, 2, 3].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"
                  style={{ animationDelay: `${d * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}


      </div>

      {/* Conversational Assistant Card (If spoken answer displayed) */}
      {assistantMessage && (
        <div role="status" aria-live="polite" aria-atomic="true" className="mx-4 mb-2 p-3 rounded-2xl bg-[#061828]/95 border border-cyan-500/40 text-xs text-cyan-100 shadow-2xl relative z-30 animate-fade-in backdrop-blur-md">
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-cyan-300 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>إجابة المساعد الذكي</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => assistantSpeechText && speakTextAloud(assistantSpeechText)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] text-cyan-300 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>سماع</span>
              </button>
              <button
                onClick={() => {
                  stopSpeaking();
                  setAssistantMessage(null);
                  setAssistantSources([]);
                }}
                className="text-cyan-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="leading-relaxed">{assistantMessage}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] border ${assistantIsLiveAi ? 'border-emerald-500/40 text-emerald-300' : 'border-amber-500/40 text-amber-200'}`}>
              {assistantIsLiveAi ? 'رد مباشر من الذكاء الاصطناعي' : 'رد محلي محدود — دون بحث حي'}
            </span>
            {assistantSources.map((source, index) => (
              <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-300 underline break-all">
                {source.title || 'المصدر'}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bottom spacer so content doesn't collide with floating bottom navigation */}
      <div className="h-20 shrink-0 pointer-events-none" />
    </div>
  );
};
