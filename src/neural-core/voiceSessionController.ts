import type { CorePhase } from "./types";

/**
 * Adapter boundary for a future speech-to-speech provider.
 * Implementations must own exactly one microphone/audio pipeline and must
 * release it on disconnect. No provider or browser API is imported here.
 */
export interface VoiceTransportCallbacks {
  onTranscript(text: string, final: boolean): void;
  onAssistantText(text: string, final: boolean): void;
  onPhase(phase: CorePhase): void;
  onError(error: { code: string; message: string; recoverable: boolean }): void;
}

export interface VoiceTransport {
  connect(callbacks: VoiceTransportCallbacks, signal: AbortSignal): Promise<void>;
  interrupt(): Promise<void>;
  disconnect(): Promise<void>;
}

export type VoiceSessionState = "idle" | "connecting" | "active" | "interrupted" | "ending" | "error";

export interface VoiceSessionSnapshot {
  state: VoiceSessionState;
  connectedAt: number | null;
  lastError: { code: string; message: string; recoverable: boolean } | null;
}

/**
 * Owns one transport for the lifetime of a voice session.
 * UI components subscribe to snapshots; unmounting a view does not disconnect.
 */
export class VoiceSessionController {
  private state: VoiceSessionState = "idle";
  private connectedAt: number | null = null;
  private lastError: VoiceSessionSnapshot["lastError"] = null;
  private transport: VoiceTransport | null = null;
  private connectAbort: AbortController | null = null;
  private listeners = new Set<(snapshot: VoiceSessionSnapshot) => void>();
  private generation = 0;

  snapshot(): VoiceSessionSnapshot {
    return { state: this.state, connectedAt: this.connectedAt, lastError: this.lastError };
  }

  subscribe(listener: (snapshot: VoiceSessionSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  async start(transport: VoiceTransport, callbacks: VoiceTransportCallbacks): Promise<void> {
    if (this.state === "connecting" || this.state === "active" || this.state === "ending") {
      throw new Error("A voice session is already running");
    }
    const generation = ++this.generation;
    this.connectAbort?.abort();
    const abort = new AbortController();
    this.connectAbort = abort;
    this.transport = transport;
    this.connectedAt = null;
    this.lastError = null;
    this.setState("connecting");

    const guarded: VoiceTransportCallbacks = {
      onTranscript: (text, final) => { if (this.isCurrent(generation)) callbacks.onTranscript(text, final); },
      onAssistantText: (text, final) => { if (this.isCurrent(generation)) callbacks.onAssistantText(text, final); },
      onPhase: (phase) => { if (this.isCurrent(generation)) callbacks.onPhase(phase); },
      onError: (error) => {
        if (!this.isCurrent(generation)) return;
        this.lastError = error;
        this.setState("error");
        callbacks.onError(error);
      },
    };

    try {
      await transport.connect(guarded, abort.signal);
      if (!this.isCurrent(generation) || abort.signal.aborted) {
        await transport.disconnect();
        return;
      }
      this.connectedAt = Date.now();
      this.setState("active");
    } catch (error) {
      if (!this.isCurrent(generation)) return;
      const failure = {
        code: "VOICE_CONNECT_FAILED",
        message: error instanceof Error ? error.message : "Voice connection failed",
        recoverable: true,
      };
      this.lastError = failure;
      this.setState("error");
      callbacks.onError(failure);
      await this.releaseTransport(transport);
      throw error;
    }
  }

  async interrupt(): Promise<void> {
    if (this.state !== "active" || !this.transport) return;
    await this.transport.interrupt();
    this.setState("interrupted");
  }

  async resume(): Promise<void> {
    // Reconnect semantics are provider-specific; silently pretending to resume
    // would risk opening a second microphone pipeline.
    throw new Error("This transport does not define safe resume semantics");
  }

  async stop(): Promise<void> {
    if (this.state === "idle") return;
    ++this.generation;
    this.setState("ending");
    this.connectAbort?.abort();
    this.connectAbort = null;
    const transport = this.transport;
    this.transport = null;
    this.connectedAt = null;
    if (transport) await this.releaseTransport(transport);
    this.setState("idle");
  }

  private async releaseTransport(transport: VoiceTransport): Promise<void> {
    try { await transport.disconnect(); } finally {
      if (this.transport === transport) this.transport = null;
    }
  }

  private isCurrent(generation: number): boolean {
    return generation === this.generation && this.state !== "ending" && this.state !== "idle";
  }

  private setState(state: VoiceSessionState): void {
    this.state = state;
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}
