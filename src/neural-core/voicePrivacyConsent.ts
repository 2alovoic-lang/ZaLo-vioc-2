/**
 * Session-scoped privacy gate for voice routing.
 *
 * This module records explicit consent only. It does not capture, transmit,
 * persist, or retain audio or transcript content.
 */
export type VoiceProcessingMode = "local" | "cloud-text" | "cloud-audio";

export interface VoicePrivacySnapshot {
  sessionActive: boolean;
  mode: VoiceProcessingMode;
  transcriptSharingApproved: boolean;
  rawAudioSharingApproved: boolean;
}

export class VoicePrivacyConsent {
  private active = false;
  private transcriptApproved = false;
  private rawAudioApproved = false;

  beginSession(): VoicePrivacySnapshot {
    this.active = true;
    this.transcriptApproved = false;
    this.rawAudioApproved = false;
    return this.snapshot();
  }

  approveTranscriptSharing(): VoicePrivacySnapshot {
    this.requireActiveSession();
    this.transcriptApproved = true;
    return this.snapshot();
  }

  approveRawAudioSharing(): VoicePrivacySnapshot {
    this.requireActiveSession();
    this.rawAudioApproved = true;
    return this.snapshot();
  }

  canSendTranscript(): boolean {
    return this.active && this.transcriptApproved;
  }

  canSendRawAudio(): boolean {
    return this.active && this.rawAudioApproved;
  }

  mode(): VoiceProcessingMode {
    if (!this.active) return "local";
    if (this.rawAudioApproved) return "cloud-audio";
    if (this.transcriptApproved) return "cloud-text";
    return "local";
  }

  endSession(): VoicePrivacySnapshot {
    this.active = false;
    this.transcriptApproved = false;
    this.rawAudioApproved = false;
    return this.snapshot();
  }

  snapshot(): VoicePrivacySnapshot {
    return {
      sessionActive: this.active,
      mode: this.mode(),
      transcriptSharingApproved: this.transcriptApproved,
      rawAudioSharingApproved: this.rawAudioApproved,
    };
  }

  private requireActiveSession(): void {
    if (!this.active) {
      throw new Error("Privacy consent can only be granted during an active voice session");
    }
  }
}
