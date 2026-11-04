import { Capacitor, registerPlugin } from '@capacitor/core';

type SpeechBridgePlugin = {
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  speak(options: { text: string; lang?: string; rate?: number }): Promise<{ utteranceId: string }>;
  stopSpeaking(): Promise<void>;
  addListener(eventName: string, listener: (data: any) => void): Promise<{ remove: () => Promise<void> }>;
};

export const AndroidSpeechBridge = registerPlugin<SpeechBridgePlugin>('SpeechBridge');

export const isNativeAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';