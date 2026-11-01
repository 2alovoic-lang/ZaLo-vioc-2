import test from "node:test";
import assert from "node:assert/strict";
import { ConversationStore } from "./conversationStore.ts";
import { ConversationRuntime } from "./conversationRuntime.ts";
import { ToolRegistry } from "./toolRegistry.ts";

const message = (id) => ({ id, role: "user", text: `message ${id}`, createdAt: id });

test("conversation store bounds history and preserves newest messages", () => {
  const store = new ConversationStore("session-a");
  for (let i = 1; i <= 85; i++) store.add(message(i));
  const snapshot = store.snapshot();
  assert.equal(snapshot.messages.length, 80);
  assert.equal(snapshot.messages[0].id, 6);
  assert.equal(snapshot.messages[79].id, 85);
  assert.equal(snapshot.revision, 85);
  assert.equal(snapshot.language, "ar");
});

test("conversation store clear resets messages and phase", () => {
  const store = new ConversationStore("session-b");
  store.add(message("one"));
  store.setPhase("speaking");
  const cleared = store.clear();
  assert.equal(cleared.messages.length, 0);
  assert.equal(cleared.phase, "idle");
  assert.equal(cleared.revision, 3);
});

test("conversation runtime emits snapshots and keeps returned message data isolated", () => {
  const runtime = new ConversationRuntime({
    conversationId: "runtime-a",
    now: () => 123,
    createId: () => "generated-id",
  });
  const events = [];
  const unsubscribe = runtime.subscribe({ onEvent: (event) => events.push(event) });
  const added = runtime.addMessage("user", "  مرحبا  ", { evidenceIds: ["e1"] });
  added.evidenceIds.push("mutated");
  assert.equal(runtime.snapshot().messages[0].text, "مرحبا");
  assert.deepEqual(runtime.snapshot().messages[0].evidenceIds, ["e1"]);
  assert.equal(events[0].type, "phase");
  assert.equal(events[1].type, "message");
  unsubscribe();
  runtime.dispose();
  assert.throws(() => runtime.addMessage("user", "late"), /disposed/);
});

test("starting a new operation aborts the previous operation", () => {
  const runtime = new ConversationRuntime({ conversationId: "runtime-b" });
  const first = runtime.beginOperation();
  const second = runtime.beginOperation();
  assert.equal(first.aborted, true);
  assert.equal(second.aborted, false);
  runtime.interrupt();
  assert.equal(second.aborted, true);
  assert.equal(runtime.snapshot().phase, "interrupted");
  runtime.dispose();
});

test("tool registry executes only explicitly registered tools and passes cancellation", async () => {
  const registry = new ToolRegistry();
  const input = { query: "weather" };
  await assert.rejects(
    registry.execute("lookup", input, new AbortController().signal),
    /not allowlisted/,
  );
  let receivedInput;
  let receivedSignal;
  registry.register({
    name: "lookup",
    description: "Test-only lookup",
    async execute(value, signal) {
      receivedInput = value;
      receivedSignal = signal;
      return { ok: true, summary: "verified", evidence: [{ id: "ev1", source: "test", summary: "fixture", observedAt: 1 }] };
    },
  });
  const controller = new AbortController();
  const result = await registry.execute("lookup", input, controller.signal);
  assert.equal(receivedInput, input);
  assert.equal(receivedSignal, controller.signal);
  assert.equal(result.ok, true);
  assert.equal(result.evidence[0].id, "ev1");
  assert.deepEqual(registry.list(), [{ name: "lookup", description: "Test-only lookup" }]);
});

test("tool registry rejects duplicate and blank names", () => {
  const registry = new ToolRegistry();
  const tool = { name: "safe", description: "safe", execute: async () => ({ ok: true, summary: "ok", evidence: [] }) };
  registry.register(tool);
  assert.throws(() => registry.register(tool), /already registered/);
  assert.throws(() => registry.register({ ...tool, name: "  " }), /required/);
});
