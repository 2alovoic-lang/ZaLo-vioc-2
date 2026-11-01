import { ConversationRuntime } from "./conversationRuntime";

/**
 * App-process registry. Views may unmount during navigation without destroying
 * the active conversation. The runtime is disposed only by an explicit end.
 */
class RuntimeRegistry {
  private active: ConversationRuntime | null = null;

  getOrCreate(conversationId = "default"): ConversationRuntime {
    if (!this.active) this.active = new ConversationRuntime({ conversationId });
    return this.active;
  }

  current(): ConversationRuntime | null {
    return this.active;
  }

  end(): void {
    this.active?.dispose();
    this.active = null;
  }
}

export const conversationRuntimeRegistry = new RuntimeRegistry();
