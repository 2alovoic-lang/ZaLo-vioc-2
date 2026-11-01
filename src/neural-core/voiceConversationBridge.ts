import { ConversationRuntime } from "./conversationRuntime";
import { VoiceSessionController, type VoiceTransport, type VoiceSessionSnapshot } from "./voiceSessionController";
import type { CorePhase } from "./types";

/**
 * Connects one provider transport to the app-owned conversation runtime.
 * Only finalized transcripts enter history; partials remain transient UI events.
 */
export class VoiceConversationBridge {
  constructor(
    private readonly runtime: ConversationRuntime,
    private readonly session: VoiceSessionController = new VoiceSessionController(),
  ) {}

  sessionSnapshot(): VoiceSessionSnapshot {
    return this.session.snapshot();
  }

  subscribeSession(listener: (snapshot: VoiceSessionSnapshot) => void): () => void {
    return this.session.subscribe(listener);
  }

  async start(transport: VoiceTransport): Promise<void> {
    await this.session.start(transport, {
      onTranscript: (text, final) => {
        if (!final || !text.trim()) return;
        this.runtime.addMessage("user", text);
      },
      onAssistantText: (text, final) => {
        if (!final || !text.trim()) return;
        this.runtime.addMessage("assistant", text);
      },
      onPhase: (phase) => this.runtime.setPhase(phase),
      onError: () => this.runtime.setPhase("error"),
    });
    this.runtime.setPhase("listening");
  }

  async interrupt(): Promise<void> {
    await this.session.interrupt();
    this.runtime.interrupt();
  }

  async stop(): Promise<void> {
    try {
      await this.session.stop();
    } finally {
      this.runtime.setPhase("idle");
    }
  }
}
