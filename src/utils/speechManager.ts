/**
 * Robust Speech Manager for ZaLoVoice
 * Solves:
 * 1. Mobile browser silent audio bug (unlocks AudioContext / SpeechSynthesis on touch/click)
 * 2. Arabic voice selection: identifies best neural/natural Arabic voices (ar-SA, ar-DZ, ar-EG, Google, Apple, Microsoft)
 * 3. Arabic phonetic clarity: transliterates English terms ("ZaLoVoice" -> "زالو فويس", "DZD/دج" -> "دينار جزائري", "F2/F3" -> "إف 2")
 * 4. Pacing: default rate 0.92 for crystal clear, natural Arabic articulation
 * 5. Garbage Collection and Chrome 14-second cutoff prevention
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: number | null = null;
let cachedArabicVoice: SpeechSynthesisVoice | null = null;
let audioContextUnlocked = false;

/**
 * Unlock SpeechSynthesis on user gesture (required by mobile Chrome / Safari)
 */
export const unlockAudio = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    if (!audioContextUnlocked) {
      audioContextUnlocked = true;
      // Emit a tiny silent utterance to unlock the mobile audio session
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0.01;
      silent.rate = 2.0;
      silent.lang = 'ar-SA';
      window.speechSynthesis.speak(silent);
    }
  } catch {
    // Ignore unlock issues
  }
};

export const initVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 800);
  });
};

/**
 * Finds the clearest, highest-quality Arabic voice available on the device
 */
export const getBestVoiceForLanguage = async (lang: string = 'ar'): Promise<SpeechSynthesisVoice | null> => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = await initVoices();
  if (!voices || voices.length === 0) return null;

  if (lang.startsWith('ar') || lang.startsWith('dz')) {
    if (cachedArabicVoice) return cachedArabicVoice;

    // Filter all candidate Arabic voices
    const arCandidates = voices.filter((v) => {
      const code = v.lang.replace('_', '-').toLowerCase();
      const name = v.name.toLowerCase();
      return (
        code.startsWith('ar') ||
        code.includes('ar-') ||
        name.includes('arabic') ||
        name.includes('عربي') ||
        name.includes('العربية') ||
        name.includes('maged') ||
        name.includes('tarik') ||
        name.includes('laila') ||
        name.includes('shakir') ||
        name.includes('hamed')
      );
    });

    if (arCandidates.length > 0) {
      // Prioritize natural/neural Google/Microsoft/Apple voices
      const premiumVoice = arCandidates.find((v) => {
        const n = v.name.toLowerCase();
        return n.includes('natural') || n.includes('google') || n.includes('neural') || n.includes('enhanced') || n.includes('siri');
      });

      // Prefer Algerian or Saudi or Egyptian
      const regionalVoice =
        arCandidates.find((v) => v.lang.toLowerCase().includes('dz')) ||
        arCandidates.find((v) => v.lang.toLowerCase().includes('sa')) ||
        arCandidates.find((v) => v.lang.toLowerCase().includes('eg'));

      const selected = premiumVoice || regionalVoice || arCandidates[0];
      cachedArabicVoice = selected;
      return selected;
    }
  } else if (lang.startsWith('fr')) {
    return voices.find((v) => v.lang.toLowerCase().startsWith('fr')) || null;
  } else if (lang.startsWith('en')) {
    return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || null;
  }

  return null;
};

/**
 * Phonetically optimize Arabic text for crystal-clear TTS pronunciation
 */
export const prepareClearArabicText = (rawText: string): string => {
  return rawText
    // Brand names to clean Arabic phonetics
    .replace(/ZaLoVoice/gi, 'زالو فويس')
    .replace(/2aloVoice/gi, 'زالو فويس')
    .replace(/ZaLo Voici/gi, 'زالو فويس')
    .replace(/ZaLoUser/gi, 'مستخدم زالو')
    // Currencies and units
    .replace(/\bدج\b/g, 'دينار جزائري')
    .replace(/\bDZD\b/gi, 'دينار جزائري')
    .replace(/\bكم\b/g, 'كيلومتر')
    .replace(/\bم²\b/g, 'متر مربع')
    // Apartment types
    .replace(/\bF2\b/gi, 'إف اثنين')
    .replace(/\bF3\b/gi, 'إف ثلاثة')
    .replace(/\bF4\b/gi, 'إف أربعة')
    .replace(/\bF5\b/gi, 'إف خمسة')
    // Punctuation and symbols that cause robotic pauses
    .replace(/[*#_`~—–]/g, ' ')
    .replace(/\(\(/g, '')
    .replace(/\)\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Robust Text-To-Speech function with guaranteed mobile playback
 */
export const speakWithFullVoice = async (
  text: string,
  options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (err?: any) => void;
  }
) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const cleanText = prepareClearArabicText(text);
  if (!cleanText) return;

  try {
    // Stop any ongoing speech and resume if suspended
    stopSpeaking();
    unlockAudio();

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const lang = options?.lang || 'ar';
    const voice = await getBestVoiceForLanguage(lang);

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Rate: 0.92 gives optimal clarity and deliberate Arabic articulation
    utterance.rate = options?.rate !== undefined ? options.rate : 0.92;
    utterance.pitch = options?.pitch !== undefined ? options.pitch : 1.0;
    utterance.volume = 1.0;

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      // Standard Arabic BCP-47 fallback
      utterance.lang = lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-SA';
    }

    // Keep persistent window reference to prevent GC killing speech
    activeUtterance = utterance;
    (window as any).__zalovoice_active_utterance = utterance;

    // Chrome Android bug workaround: resume pulse for speeches > 10 seconds
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    keepAliveTimer = window.setInterval(() => {
      if (!window.speechSynthesis || !window.speechSynthesis.speaking) {
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 9000);

    utterance.onend = () => {
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      activeUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      activeUtterance = null;
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options?.onError?.(e);
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('ZaLoVoice speech synthesis error:', err);
    options?.onError?.(err);
  }
};

export const stopSpeaking = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    window.speechSynthesis.cancel();
    activeUtterance = null;
  } catch {
    // Ignored
  }
};

/**
 * One-click helper to test clear Arabic pronunciation
 */
export const testClearArabicVoice = (sampleText?: string) => {
  const phrase =
    sampleText ||
    'مرحباً بك في زالو فويس! صوت المساعد الذكي يعمل الآن بوضوح تام، باللغة العربية الفصحى والدارجة الجزائرية.';
  speakWithFullVoice(phrase, { rate: 0.92 });
};
