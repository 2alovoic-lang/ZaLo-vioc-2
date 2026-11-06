import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { AssistantInteraction } from '../types/algeria';
import { processLocalNLP } from '../utils/localAssistantNLP';
import { speakWithFullVoice, stopSpeaking, playAudioChime, unlockAudio } from '../utils/speechManager';
import { isNativeSpeechAvailable, listenNativeOnce, stopNativeSpeech } from '../utils/nativeSpeech';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string, params?: any) => void;
  currentWilaya: string;
  initialQuery?: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  currentWilaya,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<AssistantInteraction[]>(() => {
    try {
      const saved = localStorage.getItem('zalovoice_assistant_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(-30);
      }
    } catch {
      // Continue with a fresh conversation if session storage is unavailable.
    }
    return [{
      id: 'init_1',
      sender: 'assistant',
      text: 'أهلاً بك في ZaLoVoice. اكتب أو تحدث عن حاجتك، وسأساعدك في البحث والتوجيه. سأوضح لك عندما تكون الخدمة أو النتيجة غير متاحة أو غير متحققة.',
      speechText: 'أهلاً بك في زالو فويس. تحدث أو اكتب طلبك، وسأساعدك بوضوح وشفافية.',
      timestamp: 'الآن',
    }];
  });
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Keep the assistant conversation on this device across browser sessions.
  useEffect(() => {
    try {
      localStorage.setItem('zalovoice_assistant_history', JSON.stringify(messages.slice(-30)));
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
  }, [messages]);


  const recognitionRef = useRef<any>(null);
  const handleSendMessageRef = useRef<(textToSend?: string) => Promise<void>>(async () => {});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedInitialQueryRef = useRef<string | null>(null);
  const autoNavigateTimerRef = useRef<any>(null);

  // Stop speech and clear timers when closing modal or unmounting
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      processedInitialQueryRef.current = null;
      if (autoNavigateTimerRef.current) clearTimeout(autoNavigateTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    }
    return () => {
      stopSpeaking();
      if (autoNavigateTimerRef.current) clearTimeout(autoNavigateTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, [isOpen]);

  // Process initial query if opened with one, or speak welcome greeting
  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery.trim() && processedInitialQueryRef.current !== initialQuery) {
        processedInitialQueryRef.current = initialQuery;
        handleSendMessage(initialQuery.trim());
      } else if (!initialQuery || !initialQuery.trim()) {
        // Speak initial greeting aloud in clear Arabic
        speakText('أهلاً بك في زالو فويس، أنا في خدمتك لأي طلب صوتي أو كتابي.');
      }
    }
  }, [isOpen, initialQuery]);

  // Native Android SpeechRecognizer for installed builds; browser API remains the web fallback.
  useEffect(() => {
    if (isNativeSpeechAvailable()) {
      recognitionRef.current = {
        start: async () => {
          setIsListening(true);
          try {
            const transcript = await listenNativeOnce('ar-DZ');
            setIsListening(false);
            if (transcript) {
              setInputText(transcript);
              void handleSendMessageRef.current(transcript);
            } else {
              setNoticeMessage('لم يصلني نص واضح من الميكروفون. حاول مرة أخرى أو اكتب طلبك.');
            }
          } catch (error: any) {
            setIsListening(false);
            const msg = error?.message === 'MICROPHONE_PERMISSION_DENIED'
              ? 'يرجى السماح بالوصول إلى الميكروفون من إعدادات الهاتف.'
              : 'تعذر تشغيل التعرف الصوتي على هذا الجهاز. يمكنك كتابة رسالتك.';
            setNoticeMessage(msg);
          }
        },
        stop: () => { void stopNativeSpeech(); },
      };
      return () => {
        void stopNativeSpeech();
        recognitionRef.current = null;
      };
    }

    const BrowserSpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!BrowserSpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new BrowserSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ar-DZ';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const resultIndex = typeof event.resultIndex === 'number' ? event.resultIndex : 0;
      const transcript = event.results?.[resultIndex]?.[0]?.transcript?.trim();
      setIsListening(false);
      if (transcript) {
        setInputText(transcript);
        void handleSendMessageRef.current(transcript);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setNoticeMessage('تعذر التعرف على كلامك. حاول مجدداً أو اكتب رسالتك.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => {
      try { recognition.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // ar-DZ preserves Algerian speech recognition where the device supports it.
      recognition.lang = 'ar-DZ';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const resultIndex = typeof event.resultIndex === 'number' ? event.resultIndex : 0;
        const transcript = event.results?.[resultIndex]?.[0]?.transcript?.trim();
        setIsListening(false);
        if (!transcript) {
          setNoticeMessage('لم يصلني نص واضح من الميكروفون. حاول مرة أخرى أو اكتب طلبك.');
          return;
        }
        setInputText(transcript);
        // Use the latest handler so voice input never calls a stale React render closure.
        void handleSendMessageRef.current(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const errType = event?.error;
        if (errType === 'not-allowed') {
          const msg = 'يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح.';
          setNoticeMessage(msg);
          speakText(msg);
        } else {
          const messages: Record<string, string> = {
            'no-speech': 'لم أتمكن من سماعك. قرّب الهاتف وتحدث بوضوح ثم حاول مجدداً.',
            'audio-capture': 'تعذر تشغيل الميكروفون. تحقق من عدم استخدامه من تطبيق آخر.',
            'network': 'انقطع اتصال التعرف الصوتي بالشبكة. تحقق من الإنترنت ثم حاول مجدداً.',
            'language-not-supported': 'هذا المتصفح لا يدعم التعرف باللهجة المختارة. جرّب العربية أو اكتب طلبك.',
            'aborted': 'تم إيقاف الاستماع.',
          };
          const msg = messages[errType] || `تعذر التعرف على الصوت (${errType || 'خطأ غير معروف'}). يمكنك إعادة المحاولة أو الكتابة.`;
          if (errType !== 'aborted') {
            setNoticeMessage(msg);
            speakText(msg);
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  // Text-to-speech speaker using persistent, un-truncated voice engine
  const speakText = (text: string) => {
    if (!voiceSpeechEnabled) return;
    speakWithFullVoice(text, { lang: 'ar' });
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setNoticeMessage('التعرف الصوتي غير مدعوم في هذا المتصفح، يمكنك كتابة رسالتك في الحقل أدناه.');
      speakText('التعرف الصوتي غير مدعوم في متصفحك، تفضل بكتابة رسالتك.');
      setTimeout(() => setNoticeMessage(null), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        // Unlock Android Chrome audio APIs directly inside the user's tap gesture.
        unlockAudio();
        // Interruption: instantly silence assistant when user speaks
        stopSpeaking();
        playAudioChime('listen');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error: any) {
        setIsListening(false);
        const msg = error?.name === 'InvalidStateError'
          ? 'الميكروفون يعمل بالفعل. انتظر قليلاً ثم حاول مجدداً.'
          : 'لم أتمكن من بدء الاستماع. تحقق من إذن الميكروفون في المتصفح.';
        setNoticeMessage(msg);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Interruption: stop ongoing assistant speech on message submission
    stopSpeaking();

    const userMsg: AssistantInteraction = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let data: any = null;

      // 1. Attempt server-side API call if running in fullstack dev/server mode
      try {
        const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
        const response = await fetch(`${apiBaseUrl}/api/assistant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            context: {
              currentWilaya,
              history: messages
                .filter((item) => item.sender === 'user' || item.sender === 'assistant')
                .slice(-16)
                .map((item) => ({
                  role: item.sender,
                  content: item.text,
                })),
            },
            language: 'ar',
          }),
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch {
        // Network or 404 error (e.g., deployed statically on GitHub Pages or Vercel static)
        data = null;
      }

      // 2. Seamless Client-Side NLP fallback: guaranteed to respond with genuine Algerian content
      if (!data || !data.reply) {
        data = processLocalNLP(query, currentWilaya);
      }

      const assistantMsg: AssistantInteraction = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'لم يصل رد صالح من خدمة المساعد. حاول مجدداً.',
        speechText: data.speechText || data.reply,
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        isLiveAi: data.isAiLive || false,
        actionData: {
          wilaya: data.parameters?.wilaya || currentWilaya,
          targetTab: data.targetTab,
          citations: Array.isArray(data.citations) ? data.citations.slice(0, 8) : [],
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak assistant answer with full uninterrupted speech
      if (assistantMsg.speechText && voiceSpeechEnabled) {
        speakText(assistantMsg.speechText);
      }

      // Automatically execute detected navigation command (e.g. "افتح الرسائل", "اريد شراء عقار")
      if (data.actionType === 'navigate_to_tab' && data.targetTab && data.targetTab !== 'home' && data.targetTab !== 'assistant') {
        const destTab = data.targetTab;
        const navParams = data.parameters || { wilaya: currentWilaya };
        if (autoNavigateTimerRef.current) clearTimeout(autoNavigateTimerRef.current);
        autoNavigateTimerRef.current = setTimeout(() => {
          onNavigateToTab(destTab, navParams);
          onClose();
        }, 1300);
      }
    } catch {
      // Emergency safe local fallback - never show connection error
      const localFallback = processLocalNLP(query, currentWilaya);
      const fallbackMsg: AssistantInteraction = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: localFallback.reply,
        speechText: localFallback.speechText,
        timestamp: 'الآن',
        intent: localFallback.intent,
        isLiveAi: false,
        actionData: {
          wilaya: currentWilaya,
          targetTab: localFallback.targetTab,
          citations: localFallback.citations || [],
        },
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (voiceSpeechEnabled && fallbackMsg.speechText) {
        speakText(fallbackMsg.speechText);
      }

      // Automatically execute detected command in fallback mode as well
      if (localFallback.actionType === 'navigate_to_tab' && localFallback.targetTab && (localFallback.targetTab as string) !== 'home') {
        const destTab = localFallback.targetTab;
        const navParams = localFallback.parameters || { wilaya: currentWilaya };
        if (autoNavigateTimerRef.current) clearTimeout(autoNavigateTimerRef.current);
        autoNavigateTimerRef.current = setTimeout(() => {
          onNavigateToTab(destTab, navParams);
          onClose();
        }, 1300);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Keep the recognition callback connected to the latest message handler.
  handleSendMessageRef.current = handleSendMessage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm">مساعد ZaLoVoice الصوتي</h3>
                <span className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AI عالمي وجزائري</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">يفهم الدارجة الجزائرية، العربية الفصحى، الإنجليزية والفرنسية</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setVoiceSpeechEnabled(!voiceSpeechEnabled)}
              className={`p-2 rounded-xl text-xs transition-colors ${
                voiceSpeechEnabled ? 'text-sky-400 bg-sky-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={voiceSpeechEnabled ? 'كتم الصوت' : 'تشغيل النطق الصوتي'}
            >
              {voiceSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice Message Banner (Replaces disruptive window.alert) */}
        {noticeMessage && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2 flex items-center justify-between animate-in fade-in">
            <span>{noticeMessage}</span>
            <button
              onClick={() => setNoticeMessage(null)}
              className="text-amber-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/40">
          {messages.map((m) => {
            const isAsst = m.sender === 'assistant';

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isAsst ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isAsst
                      ? 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-sm'
                      : 'bg-sky-600 text-white rounded-tr-sm shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {isAsst && (m.actionData?.citations?.length || 0) > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-1">
                      <p className="text-[10px] text-cyan-200 font-semibold">المصادر</p>
                      {m.actionData!.citations!.filter((source) => source.url).map((source, index) => (
                        <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-sky-300 underline underline-offset-2 break-all">
                          {source.title || source.url}
                        </a>
                      ))}
                    </div>
                  )}
                  {isAsst && typeof m.isLiveAi === 'boolean' && (
                    <span className={`inline-flex mt-2 rounded-full px-2 py-0.5 text-[10px] border ${m.isLiveAi ? 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40' : 'border-amber-500/30 text-amber-200 bg-amber-950/30'}`}>
                      {m.isLiveAi ? 'رد من الذكاء الاصطناعي المباشر' : 'رد محلي محدود — لا يتضمن بحثاً حياً'}
                    </span>
                  )}

                  {/* Intent & Context Action Buttons */}
                  {isAsst && m.actionData?.targetTab && m.actionData.targetTab !== 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          if (autoNavigateTimerRef.current) clearTimeout(autoNavigateTimerRef.current);
                          onNavigateToTab(m.actionData!.targetTab!, m.actionData);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-semibold transition-colors cursor-pointer border border-sky-500/30"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>فتح قسم {m.intent || 'الخدمة'}</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-700/40 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>{m.timestamp}</span>
                      {isAsst && (
                        <button
                          type="button"
                          onClick={() => speakText(m.speechText || m.text)}
                          className="flex items-center gap-1 text-cyan-300 hover:text-white px-1.5 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/20 cursor-pointer"
                          title="استمع لهذا الرد بالصوت"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>سماع</span>
                        </button>
                      )}
                    </div>
                    {isAsst && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{m.isLiveAi ? 'ذكاء اصطناعي مباشر' : 'NLP محلي'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-sky-400 p-2 bg-slate-900/60 rounded-xl w-fit">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>جاري التفكير وتحليل طلبك...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 flex gap-2 overflow-x-auto text-[11px]">
          {[
            'اشرح لي قانون نيوتن الثاني مع المعادلات',
            'خدمات أخرى ومستقبلية في ZaLoVoice',
            'صيدليات الحراسة وتوفر الأدوية',
            'ابحث لي عن شقة للكراء في وهران',
            'كاش طاكسي من المطار لوسط الجزائر؟',
            'ما هي مراحل الثورة التحريرية الجزائرية؟',
            'بغيت نشري هاتف سامسونغ أصلي',
            'كاش مطعم شخشوخة في بسكرة؟',
            'حجز موعد عند طبيب عام',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 whitespace-nowrap transition-colors border border-slate-700/50 shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input & Voice Controls */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          {/* Animated Mic Button */}
          <button
            onClick={toggleListening}
            className={`relative p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-sky-400'
            }`}
            title={isListening ? 'جارٍ الاستماع... اضغط للإيقاف' : 'اضغط للتحدث صوتياً'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening && (
              <span className="absolute -inset-1 rounded-2xl border border-rose-500 animate-pulse-ring pointer-events-none" />
            )}
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'أنا أستمع إليك الآن...' : 'تحدث بالدارجة أو اكتب طلبك هنا...'}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-800/90 text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white shadow-md transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
