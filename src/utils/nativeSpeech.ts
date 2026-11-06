import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';

export const isNativeSpeechAvailable = (): boolean => Capacitor.isNativePlatform();

export async function listenNativeOnce(language: string): Promise<string> {
  const permission = await SpeechRecognition.requestPermissions();
  if (permission.speechRecognition !== 'granted') {
    throw new Error('MICROPHONE_PERMISSION_DENIED');
  }

  const availability = await SpeechRecognition.available();
  if (!availability.available) {
    throw new Error('NATIVE_SPEECH_UNAVAILABLE');
  }

  let selectedLanguage = language;
  try {
    const supported = await SpeechRecognition.getSupportedLanguages();
    const languages = supported.languages || [];
    if (languages.length && !languages.includes(language)) {
      if (language.startsWith('ar')) {
        selectedLanguage = languages.find((item) => item.toLowerCase().startsWith('ar-')) || language;
      } else {
        selectedLanguage = languages.find((item) => item.toLowerCase().startsWith(language.slice(0, 2).toLowerCase())) || language;
      }
    }
  } catch {
    // The native service may not expose its locale list; try the requested BCP-47 locale.
  }

  const result = await SpeechRecognition.start({
    language: selectedLanguage,
    maxResults: 1,
    partialResults: false,
    popup: false,
  });
  return result.matches?.[0]?.trim() || '';
}

export async function stopNativeSpeech(): Promise<void> {
  try {
    await SpeechRecognition.stop();
  } catch {
    try {
      await SpeechRecognition.forceStop({ timeout: 1200 });
    } catch {
      // Native recognizer may already have stopped.
    }
  }
}
