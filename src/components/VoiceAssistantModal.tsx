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
import { speakWithFullVoice, stopSpeaking, playAudioChime } from '../utils/speechManager';

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
  const [messages, setMessages] = useState<AssistantInteraction[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: 'أهلاً بك في ZaLoVoice! أنا مساعدك الصوتي الذكي والشامل. كيف يمكنني مساعدتك؟ (بحث أكاديمي، استئجار أو شراء سكن، طلب طاكسي، تسوق وتجارة، مطاعم، أو حجوزات).',
      speechText: 'أهلاً بك في زالو فويس، أنا في خدمتك لأي طلب صوتي أو كتابي.',
      timestamp: 'الآن',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startRecognitionRef = useRef<(() => void) | null>(null);
  const processedInitialQueryRef = useRef<string | null>(null);
  const autoNavigateTimerRef = useRef<any>(null);
  const autoConversationRef = useRef(false);
  const recognitionStartingRef = useRef(false);
  const pendingRecognitionRestartRef = useRef(false);

  // Stop speech and clear timers when closing modal or unmounting
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      processedInitialQueryRef.current = null;
      autoConversationRef.current = false;
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

  // Initialize Web Speech API for voice recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-DZ'; // Algerian Arabic

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const errType = event?.error;
        if (errType === 'not-allowed') {
          const msg = 'يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح.';
          setNoticeMessage(msg);
          speakText(msg);
        } else if (errType === 'no-speech') {
          const msg = 'لم أتمكن من سماعك، تفضل بالضغط والمحاولة ثانية أو كتابة طلبك.';
          setNoticeMessage(msg);
          speakText(msg);
        }
      };

      recognition.onend = () => {
        recognitionStartingRef.current = false;
        setIsListening(false);
        // Android Chrome may fire onend just after TTS onEnd. Coordinate both
        // events so the restart is not lost to a race between them.
        if (autoConversationRef.current && pendingRecognitionRestartRef.current) {
          pendingRecognitionRestartRef.current = false;
          window.setTimeout(() => startRecognitionRef.current?.(), 500);
        }
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
  const startRecognition = () => {
    if (!autoConversationRef.current || !isOpen || !recognitionRef.current || recognitionStartingRef.current) return;
    try {
      pendingRecognitionRestartRef.current = false;
      recognitionStartingRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
      setNoticeMessage('أنا أستمع إليك الآن... يمكنك متابعة الحديث.');
    } catch {
      recognitionStartingRef.current = false;
      // Some Android builds need a short idle gap after SpeechRecognition.onend.
      pendingRecognitionRestartRef.current = true;
      window.setTimeout(() => {
        if (autoConversationRef.current && pendingRecognitionRestartRef.current) {
          pendingRecognitionRestartRef.current = false;
          startRecognitionRef.current?.();
        }
      }, 900);
    }
  };
  startRecognitionRef.current = startRecognition;

  const speakText = (text: string) => {
    if (!voiceSpeechEnabled) {
      if (autoConversationRef.current) window.setTimeout(startRecognition, 350);
      return;
    }
    speakWithFullVoice(text, { lang: 'ar', onEnd: () => {
      if (autoConversationRef.current) {
        pendingRecognitionRestartRef.current = true;
        if (!recognitionStartingRef.current) window.setTimeout(() => startRecognitionRef.current?.(), 500);
      }
    }, onError: () => {
      if (autoConversationRef.current) {
        pendingRecognitionRestartRef.current = true;
        if (!recognitionStartingRef.current) window.setTimeout(() => startRecognitionRef.current?.(), 500);
      }
    }});
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setNoticeMessage('التعرف الصوتي غير مدعوم في هذا المتصفح، يمكنك كتابة رسالتك في الحقل أدناه.');
      speakText('التعرف الصوتي غير مدعوم في متصفحك، تفضل بكتابة رسالتك.');
      setTimeout(() => setNoticeMessage(null), 4000);
      return;
    }

    if (isListening) {
      autoConversationRef.current = false;
      pendingRecognitionRestartRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      setNoticeMessage('تم إيقاف المحادثة الصوتية.');
    } else {
      try {
        autoConversationRef.current = true;
        stopSpeaking();
        playAudioChime('listen');
        recognitionStartingRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
        setNoticeMessage('المحادثة الصوتية مستمرة. اضغط الميكروفون لإنهائها.');
      } catch {
        recognitionStartingRef.current = false;
        setIsListening(false);
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
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            context: { currentWilaya },
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
        text: data.reply || 'تمت معالجة طلبك بنجاح.',
        speechText: data.speechText || data.reply,
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        isLiveAi: data.isAiLive || false,
        actionData: {
          wilaya: data.parameters?.wilaya || currentWilaya,
          targetTab: data.targetTab,
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
                        <span>{m.isLiveAi ? 'Gemini 3.8 Flash' : 'NLP محلي'}</span>
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
