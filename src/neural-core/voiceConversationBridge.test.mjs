import test from "node:test";
import assert from "node:assert/strict";
import { ConversationRuntime } from "./conversationRuntime.ts";
import { VoiceConversationBridge } from "./voiceConversationBridge.ts";

function makeTransport() {
  let callbacks;
  let disconnects = 0;
  return {
    transport: {
      connect: async (value) => { callbacks = value; },
      interrupt: async () => {},
      disconnect: async () => { disconnects += 1; },
    },
    emit: (role, text, final = true) => {
      if (role === "user") callbacks.onTranscript(text, final);
      else callbacks.onAssistantText(text, final);
    },
    disconnectCount: () => disconnects,
  };
}

test("bridge appends only final user and assistant transcripts in order", async () => {
  const runtime = new ConversationRuntime({ conversationId: "bridge-test" });
  const bridge = new VoiceConversationBridge(runtime);
  const fake = makeTransport();
  await bridge.start(fake.transport);
  fake.emit("user", "مرحبا", false);
  assert.equal(runtime.snapshot().messages.length, 0);
  fake.emit("user", "مرحبا", true);
  fake.emit("assistant", "أهلاً بك", true);
  assert.deepEqual(runtime.snapshot().messages.map((m) => [m.role, m.text]), [
    ["user", "مرحبا"],
    ["assistant", "أهلاً بك"],
  ]);
  await bridge.stop();
  assert.equal(fake.disconnectCount(), 1);
  assert.equal(runtime.snapshot().phase, "idle");
  runtime.dispose();
});

test("bridge interruption and stop are delegated to the session controller", async () => {
  const runtime = new ConversationRuntime({ conversationId: "bridge-interrupt" });
  const bridge = new VoiceConversationBridge(runtime);
  const fake = makeTransport();
  await bridge.start(fake.transport);
  await bridge.interrupt();
  assert.equal(bridge.sessionSnapshot().state, "interrupted");
  assert.equal(runtime.snapshot().phase, "interrupted");
  await bridge.stop();
  assert.equal(bridge.sessionSnapshot().state, "idle");
  runtime.dispose();
});
