import type { VoiceTransport, VoiceTransportCallbacks } from "../neural-core/voiceSessionController";

export type SpeechEngineState =
  | "unsupported"
  | "model-missing"
  | "model-installing"
  | "ready"
  | "listening"
  | "stopping"
  | "error";

export interface SpeechEngineCapabilities {
  platform: "android" | "web" | "unsupported";
  onDeviceRecognition: boolean;
  supportsPartialResults: boolean;
  supportsInterruption: boolean;
  supportedLocales: string[];
}

export interface SpeechModelStatus {
  state: SpeechEngineState;
  modelId: string | null;
  downloadedBytes?: number;
  totalBytes?: number;
  message?: string;
}

export interface LocalSpeechSessionOptions {
  sessionId: string;
  locale: "ar-SA";
  /** Must remain true for this first phase. No remote fallback is permitted. */
  requireOnDevice: true;
}

export interface LocalSpeechEngine {
  getCapabilities(): Promise<SpeechEngineCapabilities>;
  getModelStatus(locale: string): Promise<SpeechModelStatus>;
  /** Model installation is always an explicit user action. */
  prepareModel(locale: string, onProgress?: (status: SpeechModelStatus) => void): Promise<SpeechModelStatus>;
  start(options: LocalSpeechSessionOptions, callbacks: VoiceTransportCallbacks, signal: AbortSignal): Promise<void>;
  interrupt(sessionId: string): Promise<void>;
  resume(sessionId: string): Promise<void>;
  stop(sessionId: string): Promise<void>;
}

/**
 * Adapter from the native on-device engine to the existing voice-session lifecycle.
 * It deliberately has no cloud fallback and never approves transcript/audio sharing.
 */
export class LocalAndroidSpeechTransport implements VoiceTransport {
  private activeSessionId: string | null = null;
  private abortController: AbortController | null = null;
  private callbacks: VoiceTransportCallbacks | null = null;

  constructor(
    private readonly engine: LocalSpeechEngine,
    private readonly createSessionId: () => string,
  ) {}

  async connect(callbacks: VoiceTransportCallbacks, signal: AbortSignal): Promise<void> {
    if (this.activeSessionId) throw new Error("A local speech session is already active");
    const capabilities = await this.engine.getCapabilities();
    if (capabilities.platform !== "android" || !capabilities.onDeviceRecognition) {
      throw new Error("Verified on-device Android speech recognition is unavailable");
    }
    if (!capabilities.supportedLocales.includes("ar-SA")) {
      throw new Error("The installed local speech engine does not support Modern Standard Arabic locale ar-SA");
    }
    const model = await this.engine.getModelStatus("ar-SA");
    if (model.state !== "ready") {
      throw new Error("The Arabic on-device speech model is not ready; install it explicitly before starting");
    }

    const sessionId = this.createSessionId();
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener("abort", abort, { once: true });
    this.activeSessionId = sessionId;
    this.abortController = controller;
    this.callbacks = callbacks;
    try {
      await this.engine.start(
        { sessionId, locale: "ar-SA", requireOnDevice: true },
        {
          onTranscript: (text, final) => {
            if (this.activeSessionId === sessionId && !controller.signal.aborted) callbacks.onTranscript(text, final);
          },
          onAssistantText: (text, final) => {
            if (this.activeSessionId === sessionId && !controller.signal.aborted) callbacks.onAssistantText(text, final);
          },
          onPhase: (phase) => {
            if (this.activeSessionId === sessionId && !controller.signal.aborted) callbacks.onPhase(phase);
          },
          onError: (error) => {
            if (this.activeSessionId !== sessionId) return;
            callbacks.onError(error);
            void this.stop();
          },
        },
        controller.signal,
      );
      if (controller.signal.aborted) await this.stop();
    } catch (error) {
      await this.stop();
      throw error;
    } finally {
      signal.removeEventListener("abort", abort);
    }
  }

  async interrupt(): Promise<void> {
    if (this.activeSessionId) await this.engine.interrupt(this.activeSessionId);
  }

  async resume(): Promise<void> {
    if (!this.activeSessionId) throw new Error("No active local speech session");
    await this.engine.resume(this.activeSessionId);
  }

  async disconnect(): Promise<void> {
    await this.stop();
  }

  private async stop(): Promise<void> {
    const sessionId = this.activeSessionId;
    this.activeSessionId = null;
    this.abortController?.abort();
    this.abortController = null;
    this.callbacks = null;
    if (sessionId) await this.engine.stop(sessionId);
  }
}
