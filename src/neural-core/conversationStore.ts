import type { ConversationMessage, ConversationSnapshot, CorePhase } from "./types";

const MAX_MESSAGES = 80;

/** Session-scoped memory only. Persistence is intentionally not enabled yet. */
export class ConversationStore {
  private readonly id: string;
  private readonly messages: ConversationMessage[] = [];
  private phase: CorePhase = "idle";
  private revision = 0;

  constructor(id: string) {
    if (!id.trim()) throw new Error("Conversation id is required");
    this.id = id;
  }

  add(message: ConversationMessage): ConversationSnapshot {
    this.messages.push(message);
    if (this.messages.length > MAX_MESSAGES) {
      this.messages.splice(0, this.messages.length - MAX_MESSAGES);
    }
    this.revision += 1;
    return this.snapshot();
  }

  setPhase(phase: CorePhase): ConversationSnapshot {
    if (this.phase !== phase) {
      this.phase = phase;
      this.revision += 1;
    }
    return this.snapshot();
  }

  snapshot(): ConversationSnapshot {
    return {
      id: this.id,
      language: "ar",
      phase: this.phase,
      messages: this.messages.map((message) => ({ ...message, ...(message.evidenceIds ? { evidenceIds: [...message.evidenceIds] } : {}) })),
      revision: this.revision,
    };
  }

  clear(): ConversationSnapshot {
    this.messages.length = 0;
    this.phase = "idle";
    this.revision += 1;
    return this.snapshot();
  }
}
