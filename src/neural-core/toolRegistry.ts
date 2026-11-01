import type { CoreTool, ToolInput } from "./types";

/** Tools are opt-in: nothing can execute unless it is explicitly registered. */
export class ToolRegistry {
  private readonly tools = new Map<string, CoreTool>();

  register(tool: CoreTool): void {
    const name = tool.name.trim();
    if (!name) throw new Error("Tool name is required");
    if (this.tools.has(name)) throw new Error(`Tool already registered: ${name}`);
    this.tools.set(name, tool);
  }

  get(name: string): CoreTool | undefined {
    return this.tools.get(name);
  }

  list(): ReadonlyArray<Pick<CoreTool, "name" | "description">> {
    return [...this.tools.values()].map(({ name, description }) => ({ name, description }));
  }

  async execute(name: string, input: ToolInput, signal: AbortSignal) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool is not allowlisted: ${name}`);
    if (signal.aborted) throw new DOMException("Operation aborted", "AbortError");
    return tool.execute(input, signal);
  }
}
