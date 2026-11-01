import { ConversationStore } from "./conversationStore";
import { ToolRegistry } from "./toolRegistry";
import type {
  ConversationMessage,
  ConversationSnapshot,
  CoreEvent,
  CoreObserver,
  CorePhase,
  ToolInput,
} from "./types";

export interface ConversationRuntimeOptions {
  conversationId: string;
  tools?: ToolRegistry;
  now?: () => number;
  createId?: () => string;
}

/**
 * Owns conversation state independently of any UI component.
 * A React view may subscribe/unsubscribe without stopping this runtime.
 * This class does not capture audio or call a model provider.
 */
export class ConversationRuntime {
  private readonly store: ConversationStore;
  private readonly tools: ToolRegistry;
  private readonly observers = new Set<CoreObserver>();
  private readonly now: () => number;
  private readonly createId: () => string;
  private activeOperation: AbortController | null = null;
  private disposed = false;

  constructor(options: ConversationRuntimeOptions) {
    this.store = new ConversationStore(options.conversationId);
    this.tools = options.tools ?? new ToolRegistry();
    this.now = options.now ?? Date.now;
    this.createId = options.createId ?? (() => {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
      return `msg-${this.now()}-${Math.random().toString(36).slice(2)}`;
    });
  }

  subscribe(observer: CoreObserver): () => void {
    this.assertActive();
    this.observers.add(observer);
    observer.onEvent({ type: "phase", snapshot: this.snapshot() });
    return () => this.observers.delete(observer);
  }

  snapshot(): ConversationSnapshot {
    return this.store.snapshot();
  }

  setPhase(phase: CorePhase): void {
    this.assertActive();
    this.emit({ type: "phase", snapshot: this.store.setPhase(phase) });
  }

  addMessage(role: ConversationMessage["role"], text: string, extra: Partial<ConversationMessage> = {}): ConversationMessage {
    this.assertActive();
    const cleanText = text.trim();
    if (!cleanText) throw new Error("Message text cannot be empty");
    const message: ConversationMessage = {
      id: extra.id ?? this.createId(),
      role,
      text: cleanText,
      createdAt: extra.createdAt ?? this.now(),
      ...(extra.toolName ? { toolName: extra.toolName } : {}),
      ...(extra.evidenceIds ? { evidenceIds: [...extra.evidenceIds] } : {}),
    };
    const snapshot = this.store.add(message);
    const publishedMessage = { ...message, ...(message.evidenceIds ? { evidenceIds: [...message.evidenceIds] } : {}) };
    this.emit({ type: "message", snapshot, message: publishedMessage });
    return { ...publishedMessage, ...(publishedMessage.evidenceIds ? { evidenceIds: [...publishedMessage.evidenceIds] } : {}) };
  }

  /** Begin a cancellable turn. Starting a newer turn cancels the previous operation. */
  beginOperation(): AbortSignal {
    this.assertActive();
    this.activeOperation?.abort();
    this.activeOperation = new AbortController();
    this.setPhase("thinking");
    return this.activeOperation.signal;
  }

  async executeTool(name: string, input: ToolInput): Promise<void> {
    this.assertActive();
    const signal = this.activeOperation?.signal ?? this.beginOperation();
    this.setPhase("executing");
    try {
      const result = await this.tools.execute(name, input, signal);
      if (signal.aborted) return;
      const evidenceIds = result.evidence.map((item) => item.id);
      this.addMessage("tool", result.summary, { toolName: name, evidenceIds });
      this.setPhase(result.ok ? "verifying" : "error");
    } catch (error) {
      if (signal.aborted) return;
      const message = error instanceof Error ? error.message : "Tool execution failed";
      this.emit({
        type: "error",
        snapshot: this.store.setPhase("error"),
        error: { code: "TOOL_EXECUTION_FAILED", message, recoverable: true },
      });
      throw error;
    }
  }

  interrupt(): void {
    this.assertActive();
    this.activeOperation?.abort();
    this.activeOperation = null;
    this.emit({ type: "phase", snapshot: this.store.setPhase("interrupted") });
  }

  finishTurn(): void {
    this.assertActive();
    this.activeOperation = null;
    this.setPhase("listening");
  }

  clearConversation(): void {
    this.assertActive();
    this.activeOperation?.abort();
    this.activeOperation = null;
    this.emit({ type: "phase", snapshot: this.store.clear() });
  }

  /** Detaches listeners and cancels work. Call only when the conversation truly ends. */
  dispose(): void {
    if (this.disposed) return;
    this.activeOperation?.abort();
    this.activeOperation = null;
    this.observers.clear();
    this.disposed = true;
  }

  private emit(event: CoreEvent): void {
    for (const observer of this.observers) observer.onEvent(event);
  }

  private assertActive(): void {
    if (this.disposed) throw new Error("Conversation runtime has been disposed");
  }
}
