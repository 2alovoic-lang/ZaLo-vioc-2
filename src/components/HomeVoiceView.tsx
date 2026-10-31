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
import { speakWithFullVoice, stopSpeaking, unlockAudio } from '../utils/speechManager';

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

      recognition.onerror = () => {
        setVoiceState('idle');
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      stopSpeaking();
    };
  }, [currentLanguage]);

  const startListeningFlow = () => {
    unlockAudio();
    stopSpeaking();
    setAssistantMessage(null);
    setTranscribedText('');
    setVoiceState('listening');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Recognition already started or error
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

  const handleSpeechRecognized = (transcript: string) => {
    if (!transcript.trim()) {
      setVoiceState('idle');
      return;
    }

    setVoiceState('processing');

    processingTimerRef.current = setTimeout(() => {
      const nlpResult = processLocalNLP(transcript, currentWilaya);
      const textToSpeak = nlpResult.speechText || nlpResult.reply;

      setAssistantMessage(nlpResult.reply);
      setAssistantSpeechText(textToSpeak);

      // Speak response in crystal clear Arabic
      speakTextAloud(textToSpeak);

      // Navigate if matching an intent
      if (nlpResult.actionType === 'navigate_to_tab' && nlpResult.targetTab !== 'home') {
        setVoiceState('idle');
        onNavigateToService(nlpResult.targetTab as any);
      } else {
        setVoiceState('idle');
      }
    }, 1100);
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
      {/* 1. TOP BAR (Matching Mockup: Logo in Center, Menu Button on Right) */}
      {/* ============================================================== */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between z-20">
        {/* Left balance spacer */}
        <div className="w-11" />

        {/* Brand Logo in Center: 5 vertical soundwave bars + '2alovoic' */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => speakTextAloud('أهلاً بك في زالو فويس')}>
          <div className="flex items-center gap-1 h-6">
            <span className="w-1 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="w-1 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="w-1.5 h-6 rounded-full bg-cyan-300 shadow-[0_0_12px_#00e5ff]" />
            <span className="w-1 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="w-1 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-sans drop-shadow-[0_0_12px_rgba(0,229,255,0.3)]">
            2alovoic
          </span>
        </div>

        {/* Circular Hamburger Menu Button on Top Right (Exact match from mockup) */}
        <button
          onClick={onOpenMenuDrawer}
          aria-label="القائمة الجانبية والخدمات"
          className="w-11 h-11 rounded-full bg-[#071828]/90 border border-cyan-500/35 flex items-center justify-center text-cyan-200 hover:text-white hover:border-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,180,255,0.25)]"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>
      </header>

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
              aria-label={voiceState === 'listening' ? 'جارٍ الاستماع، اضغط للإيقاف' : 'اضغط للتحدث مع 2alovoic'}
              className={`relative z-10 w-[176px] h-[176px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 group ${
                voiceState === 'listening'
                  ? 'ring-4 ring-cyan-300/80 scale-105'
                  : 'hover:scale-[1.03]'
              }`}
              style={{
                background: 'radial-gradient(circle at 50% 50%, #021a36 0%, #032348 48%, #006ddb 84%, #00d9ff 97%, #ffffff 100%)',
                border: '3px solid #00f0ff',
                boxShadow:
                  voiceState === 'listening'
                    ? '0 0 70px #00e5ff, inset 0 0 35px #00e5ff, 0 0 120px rgba(0, 229, 255, 0.6)'
                    : '0 0 45px rgba(0, 229, 255, 0.8), inset 0 0 25px rgba(0, 229, 255, 0.9), 0 0 90px rgba(0, 160, 255, 0.35)',
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
              أستمع إليك الآن... تحدث
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

        {/* Quick Voice Play Test & Silent Input Access */}
        {voiceState === 'idle' && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => speakTextAloud('أهلاً بك في زالو فويس، أنا أستمع إليك وجاهز لخدمتك')}
              className="flex items-center gap-1 text-[11px] text-cyan-400/70 hover:text-cyan-200 transition-colors cursor-pointer py-1 px-2.5 rounded-full bg-[#041424]/60 border border-cyan-500/20"
              title="سماع تجربة الصوت"
            >
              <Volume2 className="w-3 h-3 text-cyan-400" />
              <span>تجربة الصوت العربي</span>
            </button>
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="text-[11px] text-cyan-400/70 hover:text-cyan-200 transition-colors cursor-pointer py-1 px-2.5 rounded-full bg-[#041424]/60 border border-cyan-500/20"
            >
              كتابة
            </button>
          </div>
        )}

        {/* Optional Hidden/Expandable Text Input for Users who Prefer Typing */}
        {showTextInput && voiceState === 'idle' && (
          <form
            onSubmit={handleSubmitText}
            className="mt-3 flex items-center bg-[#071d2b]/95 border border-cyan-500/40 rounded-full px-3 py-1.5 shadow-xl w-full max-w-xs animate-fade-in"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب طلبك..."
              className="flex-1 text-xs bg-transparent border-none focus:outline-none text-white placeholder-cyan-300/40 px-2"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. AMBIENT FLOWING LIGHT RIBBONS IN LOWER BACKGROUND */}
      {/* ============================================================== */}
      <div className="absolute bottom-16 inset-x-0 h-44 pointer-events-none overflow-hidden z-0 opacity-60">
        <svg className="w-full h-full animate-ribbon-drift" viewBox="0 0 400 180" preserveAspectRatio="none" fill="none">
          {/* Cyan Light Wave Line 1 */}
          <path
            d="M-20,160 C80,60 220,180 420,40"
            stroke="url(#waveGlow1)"
            strokeWidth="2.5"
            opacity="0.8"
          />
          {/* Cyan Light Wave Line 2 */}
          <path
            d="M-20,120 C120,170 260,30 420,140"
            stroke="url(#waveGlow2)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Soft Diffused Ambient Fill */}
          <path
            d="M-20,160 C80,60 220,180 420,40 L420,180 L-20,180 Z"
            fill="url(#ambientGlow)"
            opacity="0.12"
          />
          <defs>
            <linearGradient id="waveGlow1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00b0ff" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#00e5ff" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#29b6f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="waveGlow2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0099ff" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="ambientGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#002244" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Conversational Assistant Card (If spoken answer displayed) */}
      {assistantMessage && (
        <div className="mx-4 mb-2 p-3 rounded-2xl bg-[#061828]/95 border border-cyan-500/40 text-xs text-cyan-100 shadow-2xl relative z-30 animate-fade-in backdrop-blur-md">
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
                }}
                className="text-cyan-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="leading-relaxed">{assistantMessage}</p>
        </div>
      )}

      {/* Bottom spacer so content doesn't collide with floating bottom navigation */}
      <div className="h-20 shrink-0 pointer-events-none" />
    </div>
  );
};
