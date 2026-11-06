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

  const result = await SpeechRecognition.start({
    language,
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
