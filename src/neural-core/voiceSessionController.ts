import type { CorePhase } from "./types";

export interface VoiceTransportCallbacks {
  onTranscript(text: string, final: boolean): void;
  onAssistantText(text: string, final: boolean): void;
  onPhase(phase: CorePhase): void;
  onError(error: { code: string; message: string; recoverable: boolean }): void;
}

export interface VoiceTransport {
  connect(callbacks: VoiceTransportCallbacks, signal: AbortSignal): Promise<void>;
  interrupt(): Promise<void>;
  /** Resume listening after assistant output was interrupted, without reconnecting the microphone. */
  resume?(): Promise<void>;
  disconnect(): Promise<void>;
}

export type VoiceSessionState = "idle" | "connecting" | "active" | "interrupted" | "ending" | "error";

export interface VoiceSessionSnapshot {
  state: VoiceSessionState;
  connectedAt: number | null;
  lastError: { code: string; message: string; recoverable: boolean } | null;
}

/** Owns one transport for a session; UI unmounts must not own microphone teardown. */
export class VoiceSessionController {
  private state: VoiceSessionState = "idle";
  private connectedAt: number | null = null;
  private lastError: VoiceSessionSnapshot["lastError"] = null;
  private transport: VoiceTransport | null = null;
  private connectAbort: AbortController | null = null;
  private listeners = new Set<(snapshot: VoiceSessionSnapshot) => void>();
  private generation = 0;
  private teardowns = new WeakMap<VoiceTransport, Promise<void>>();
  private pendingTeardown: Promise<void> | null = null;
  private startQueue: Promise<void> = Promise.resolve();

  snapshot(): VoiceSessionSnapshot {
    return { state: this.state, connectedAt: this.connectedAt, lastError: this.lastError };
  }

  subscribe(listener: (snapshot: VoiceSessionSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  start(transport: VoiceTransport, callbacks: VoiceTransportCallbacks): Promise<void> {
    const queued = this.startQueue.then(() => this.startInternal(transport, callbacks));
    this.startQueue = queued.catch(() => undefined);
    return queued;
  }

  private async startInternal(transport: VoiceTransport, callbacks: VoiceTransportCallbacks): Promise<void> {
    if (this.state === "connecting" || this.state === "active" || this.state === "ending") {
      throw new Error("A voice session is already running");
    }
    if (this.transport) await this.stop();
    if (this.pendingTeardown) await this.pendingTeardown;
    const generation = ++this.generation;
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
        abort.abort();
        if (this.transport === transport) this.transport = null;
        const teardown = this.releaseTransport(transport).catch(() => undefined);
        this.pendingTeardown = teardown;
        void teardown.finally(() => { if (this.pendingTeardown === teardown) this.pendingTeardown = null; });
        callbacks.onError(error);
      },
    };

    try {
      await transport.connect(guarded, abort.signal);
      if (!this.isCurrent(generation) || abort.signal.aborted) {
        await this.releaseTransport(transport);
        return;
      }
      this.connectedAt = Date.now();
      this.connectAbort = null;
      this.setState("active");
    } catch (error) {
      if (!this.isCurrent(generation)) {
        await this.releaseTransport(transport);
        return;
      }
      const failure = {
        code: "VOICE_CONNECT_FAILED",
        message: error instanceof Error ? error.message : "Voice connection failed",
        recoverable: true,
      };
      this.lastError = failure;
      this.setState("error");
      abort.abort();
      if (this.transport === transport) this.transport = null;
      await this.releaseTransport(transport);
      callbacks.onError(failure);
      throw error;
    }
  }

  async interrupt(): Promise<void> {
    if (this.state !== "active" || !this.transport) return;
    const transport = this.transport;
    await transport.interrupt();
    if (this.transport === transport && this.state === "active") this.setState("interrupted");
  }

  async resume(): Promise<void> {
    if (this.state !== "interrupted" || !this.transport) {
      throw new Error("Only an interrupted active session can resume");
    }
    if (!this.transport.resume) {
      throw new Error("This transport does not support safe in-session resume");
    }
    const transport = this.transport;
    await transport.resume();
    if (this.transport === transport && this.state === "interrupted") this.setState("active");
  }

  async stop(): Promise<void> {
    if (this.state === "idle" && !this.transport) return;
    ++this.generation;
    this.setState("ending");
    this.connectAbort?.abort();
    this.connectAbort = null;
    const transport = this.transport;
    this.transport = null;
    this.connectedAt = null;
    try {
      if (transport) await this.releaseTransport(transport);
    } finally {
      this.setState("idle");
    }
  }

  private releaseTransport(transport: VoiceTransport): Promise<void> {
    const existing = this.teardowns.get(transport);
    if (existing) return existing;
    const teardown = Promise.resolve().then(() => transport.disconnect());
    this.teardowns.set(transport, teardown);
    return teardown;
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
