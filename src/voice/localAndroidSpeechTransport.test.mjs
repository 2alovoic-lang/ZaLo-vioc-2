import test from "node:test";
import assert from "node:assert/strict";
import { LocalAndroidSpeechTransport } from "./localAndroidSpeechTransport.ts";

function fakeEngine(overrides = {}) {
  const calls = [];
  return {
    calls,
    engine: {
      getCapabilities: async () => ({ platform: "android", onDeviceRecognition: true, supportsPartialResults: true, supportsInterruption: true, supportedLocales: ["ar-SA"] }),
      getModelStatus: async () => ({ state: "ready", modelId: "ar-fusha-local" }),
      prepareModel: async () => ({ state: "ready", modelId: "ar-fusha-local" }),
      start: async (options, callbacks, signal) => { calls.push(["start", options]); },
      interrupt: async (id) => calls.push(["interrupt", id]),
      resume: async (id) => calls.push(["resume", id]),
      stop: async (id) => calls.push(["stop", id]),
      ...overrides,
    },
  };
}

const callbacks = { onTranscript() {}, onAssistantText() {}, onPhase() {}, onError() {} };

test("refuses web or non-local recognition without fallback", async () => {
  const { engine } = fakeEngine({ getCapabilities: async () => ({ platform: "web", onDeviceRecognition: false, supportsPartialResults: false, supportsInterruption: false, supportedLocales: ["ar-SA"] }) });
  const transport = new LocalAndroidSpeechTransport(engine, () => "session-1");
  await assert.rejects(transport.connect(callbacks, new AbortController().signal), /on-device Android speech recognition is unavailable/);
});

test("requires the Arabic model to be ready before opening microphone", async () => {
  const { engine, calls } = fakeEngine({ getModelStatus: async () => ({ state: "model-missing", modelId: null }) });
  const transport = new LocalAndroidSpeechTransport(engine, () => "session-1");
  await assert.rejects(transport.connect(callbacks, new AbortController().signal), /model is not ready/);
  assert.equal(calls.length, 0);
});

test("opens a strictly on-device Arabic session and releases it on disconnect", async () => {
  const { engine, calls } = fakeEngine();
  const transport = new LocalAndroidSpeechTransport(engine, () => "session-1");
  await transport.connect(callbacks, new AbortController().signal);
  await transport.interrupt();
  await transport.resume();
  await transport.disconnect();
  assert.deepEqual(calls.map((call) => call[0]), ["start", "interrupt", "resume", "stop"]);
  assert.equal(calls[0][1].requireOnDevice, true);
  assert.equal(calls[0][1].locale, "ar-SA");
});

test("drops stale transcript callbacks after disconnect", async () => {
  let nativeCallbacks;
  const { engine } = fakeEngine({ start: async (_options, callbacks) => { nativeCallbacks = callbacks; } });
  let transcriptCount = 0;
  const transport = new LocalAndroidSpeechTransport(engine, () => "session-1");
  await transport.connect({ ...callbacks, onTranscript: () => transcriptCount++ }, new AbortController().signal);
  await transport.disconnect();
  nativeCallbacks.onTranscript("نص متأخر", true);
  assert.equal(transcriptCount, 0);
});
