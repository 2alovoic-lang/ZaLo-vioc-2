import test from "node:test";
import assert from "node:assert/strict";
import { VoiceSessionController } from "./voiceSessionController.ts";

const callbacks = () => ({
  onTranscript() {}, onAssistantText() {}, onPhase() {}, onError() {},
});
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const transport = (overrides = {}) => ({
  connect: async () => {}, interrupt: async () => {}, disconnect: async () => {},
  ...overrides,
});

test("rejects a second start while a session is active", async () => {
  const core = new VoiceSessionController();
  await core.start(transport(), callbacks());
  await assert.rejects(core.start(transport(), callbacks()), /already running/);
  await core.stop();
});

test("stop during connect disconnects exactly once even if connect resolves late", async () => {
  const core = new VoiceSessionController();
  const gate = deferred();
  let disconnects = 0;
  const pending = core.start(transport({
    connect: () => gate.promise,
    disconnect: async () => { disconnects++; },
  }), callbacks());
  await Promise.resolve();
  await core.stop();
  gate.resolve();
  await pending;
  assert.equal(disconnects, 1);
  assert.equal(core.snapshot().state, "idle");
});

test("fatal transport callback releases transport and allows a clean restart", async () => {
  const core = new VoiceSessionController();
  let disconnects = 0;
  let onError;
  const first = transport({ disconnect: async () => { disconnects++; }, connect: async (c) => { onError = c.onError; } });
  await core.start(first, callbacks());
  onError({ code: "FATAL", message: "lost", recoverable: false });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(core.snapshot().state, "error");
  assert.equal(disconnects, 1);
  await core.start(transport(), callbacks());
  assert.equal(core.snapshot().state, "active");
  await core.stop();
});

test("interrupted session is disconnected before a new transport connects", async () => {
  const core = new VoiceSessionController();
  const events = [];
  await core.start(transport({ disconnect: async () => { events.push("disconnect-old"); } }), callbacks());
  await core.interrupt();
  await core.start(transport({ connect: async () => { events.push("connect-new"); } }), callbacks());
  assert.deepEqual(events, ["disconnect-old", "connect-new"]);
  await core.stop();
});

test("disconnect failure still returns controller to idle", async () => {
  const core = new VoiceSessionController();
  await core.start(transport({ disconnect: async () => { throw new Error("close failed"); } }), callbacks());
  await assert.rejects(core.stop(), /close failed/);
  assert.equal(core.snapshot().state, "idle");
});


test("fatal teardown completes before a replacement transport connects", async () => {
  const core = new VoiceSessionController();
  const gate = deferred();
  const events = [];
  let onError;
  const first = transport({
    connect: async (c) => { onError = c.onError; },
    disconnect: async () => { events.push("disconnect-start"); await gate.promise; events.push("disconnect-end"); },
  });
  await core.start(first, callbacks());
  onError({ code: "FATAL", message: "lost", recoverable: false });
  const next = core.start(transport({ connect: async () => { events.push("connect-next"); } }), callbacks());
  await Promise.resolve();
  assert.deepEqual(events, ["disconnect-start"]);
  gate.resolve();
  await next;
  assert.deepEqual(events, ["disconnect-start", "disconnect-end", "connect-next"]);
  await core.stop();
});
