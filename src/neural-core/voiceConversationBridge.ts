import { ConversationRuntime } from "./conversationRuntime";
import { VoiceSessionController, type VoiceTransport, type VoiceSessionSnapshot } from "./voiceSessionController";
import { VoicePrivacyConsent, type VoicePrivacySnapshot } from "./voicePrivacyConsent";

/**
 * Connects one provider transport to the app-owned conversation runtime.
 * Only finalized transcripts enter history; partials remain transient UI events.
 *
 * Privacy consent is session-scoped. This bridge exposes consent state to the
 * UI and guarantees revocation when the voice session stops or fails to start.
 * A concrete transport must still enforce canSendTranscript/canSendRawAudio
 * before any network transmission; this bridge itself sends no data.
 */
export class VoiceConversationBridge {
  constructor(
    private readonly runtime: ConversationRuntime,
    private readonly session: VoiceSessionController = new VoiceSessionController(),
    private readonly privacy: VoicePrivacyConsent = new VoicePrivacyConsent(),
  ) {}

  sessionSnapshot(): VoiceSessionSnapshot {
    return this.session.snapshot();
  }

  privacySnapshot(): VoicePrivacySnapshot {
    return this.privacy.snapshot();
  }

  /** Begin local-first session; no external sharing is approved. */
  beginPrivacySession(): VoicePrivacySnapshot {
    return this.privacy.beginSession();
  }

  /** Explicitly approve transcript sharing for this session only. */
  approveTranscriptSharing(): VoicePrivacySnapshot {
    return this.privacy.approveTranscriptSharing();
  }

  /** Separate future opt-in; transcript approval does not grant this permission. */
  approveRawAudioSharing(): VoicePrivacySnapshot {
    return this.privacy.approveRawAudioSharing();
  }

  subscribeSession(listener: (snapshot: VoiceSessionSnapshot) => void): () => void {
    return this.session.subscribe(listener);
  }

  async start(transport: VoiceTransport): Promise<void> {
    if (!this.privacy.snapshot().sessionActive) this.privacy.beginSession();
    try {
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
        onError: () => {
          this.privacy.endSession();
          this.runtime.setPhase("error");
        },
      });
      this.runtime.setPhase("listening");
    } catch (error) {
      this.privacy.endSession();
      throw error;
    }
  }

  async interrupt(): Promise<void> {
    await this.session.interrupt();
    this.runtime.interrupt();
  }

  async resume(): Promise<void> {
    await this.session.resume();
    this.runtime.setPhase("listening");
  }

  async stop(): Promise<void> {
    try {
      await this.session.stop();
    } finally {
      this.privacy.endSession();
      this.runtime.setPhase("idle");
    }
  }
}
