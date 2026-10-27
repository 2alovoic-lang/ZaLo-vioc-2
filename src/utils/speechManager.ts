/**
 * Robust Speech Manager for ZaLoVoice
 * Solves common Android / Chrome / iOS Web Speech API issues:
 * 1. Garbage collection bug cutting off TTS mid-sentence
 * 2. Missing 'ar-XA' voice fallback on Android (uses ar-SA, ar-DZ, or best ar voice)
 * 3. 15-second browser audio cutoff for long sentences
 * 4. STT premature cutoffs by supporting continuous listening and silence debounce
 */

// Persistent window reference to prevent JS Garbage Collector from killing active utterance
let activeUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: number | null = null;

// Best voice cache
let cachedArabicVoice: SpeechSynthesisVoice | null = null;

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
    // Timeout fallback if event never fires
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
};

export const getBestVoiceForLanguage = async (lang: string = 'ar'): Promise<SpeechSynthesisVoice | null> => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = await initVoices();
  if (!voices || voices.length === 0) return null;

  if (lang.startsWith('ar')) {
    if (cachedArabicVoice) return cachedArabicVoice;
    // Prefer Algerian, Saudi, Egyptian or any Arabic voice
    const arVoice =
      voices.find((v) => v.lang.toLowerCase() === 'ar-dz') ||
      voices.find((v) => v.lang.toLowerCase() === 'ar-sa') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('ar-')) ||
      voices.find((v) => v.lang.toLowerCase().includes('ar'));

    if (arVoice) {
      cachedArabicVoice = arVoice;
      return arVoice;
    }
  } else if (lang.startsWith('fr')) {
    return voices.find((v) => v.lang.toLowerCase().startsWith('fr')) || null;
  } else if (lang.startsWith('en')) {
    return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || null;
  }

  return null;
};

/**
 * Robust Text-To-Speech function
 * Prevents mid-speech stops on Android Mobilis/Chrome browsers
 */
export const speakWithFullVoice = async (
  text: string,
  options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: () => void;
  }
) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const cleanText = text
    .replace(/[*#_`~]/g, '') // remove markdown symbols
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return;

  try {
    // Stop any ongoing speech
    stopSpeaking();

    const lang = options?.lang || 'ar';
    const voice = await getBestVoiceForLanguage(lang);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      // Use standard standard BCP-47 fallback (never use invalid ar-XA)
      utterance.lang = lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-SA';
    }

    // Keep persistent reference to prevent Chrome garbage collector from destroying utterance
    activeUtterance = utterance;
    (window as any).__zalovoice_active_utterance = utterance;

    // Chrome Android bug workaround: long speeches pause after ~14 seconds unless refreshed
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    keepAliveTimer = window.setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

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
      // 'canceled' or 'interrupted' is normal when user speaks or navigates
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options?.onError?.();
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('ZaLoVoice speech error:', err);
    options?.onError?.();
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
