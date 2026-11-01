/** Provider-neutral contracts for ZaLoVoice Neural Core.
 * This layer deliberately has no browser, network, provider SDK, or secret access.
 */

export type CorePhase =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "executing"
  | "verifying"
  | "interrupted"
  | "error";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  text: string;
  createdAt: number;
  toolName?: string;
  evidenceIds?: string[];
}

export interface ConversationSnapshot {
  id: string;
  language: "ar";
  phase: CorePhase;
  messages: readonly ConversationMessage[];
  revision: number;
}

export interface CoreEvent {
  type: "phase" | "message" | "error";
  snapshot: ConversationSnapshot;
  message?: ConversationMessage;
  error?: { code: string; message: string; recoverable: boolean };
}

export interface CoreObserver {
  onEvent(event: CoreEvent): void;
}

export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolEvidence {
  id: string;
  source: string;
  summary: string;
  observedAt: number;
}

export interface ToolResult {
  ok: boolean;
  summary: string;
  evidence: readonly ToolEvidence[];
  errorCode?: string;
}

export interface CoreTool<TInput extends ToolInput = ToolInput> {
  readonly name: string;
  readonly description: string;
  execute(input: TInput, signal: AbortSignal): Promise<ToolResult>;
}

export interface ImprovementProposal {
  id: string;
  title: string;
  rationale: string;
  affectedPaths: readonly string[];
  risk: "low" | "medium" | "high";
  createdAt: number;
  status: "proposed" | "tested" | "rejected" | "approved";
}
