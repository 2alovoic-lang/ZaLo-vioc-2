/** Provider-neutral contract for one active voice conversation engine.
 * Implementations must own microphone capture exclusively while active.
 * No provider SDK, credentials, or network connection is created by this contract.
 */
export type VoiceSessionState = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'reconnecting' | 'error';

export interface VoiceTranscriptEvent {
  text: string;
  isFinal: boolean;
  role: 'user' | 'assistant';
}

export interface VoiceEngineError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface VoiceEngineEvents {
  onStateChange(state: VoiceSessionState): void;
  onTranscript(event: VoiceTranscriptEvent): void;
  onError(error: VoiceEngineError): void;
}

/** One engine instance per conversation; do not run browser recognition in parallel. */
export interface VoiceEngine {
  start(events: VoiceEngineEvents): Promise<void>;
  stop(): Promise<void>;
  interrupt(): Promise<void>;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
}

export interface VoiceConversation {
  id: string;
  language: 'ar';
  state: VoiceSessionState;
  turns: ConversationTurn[];
}
