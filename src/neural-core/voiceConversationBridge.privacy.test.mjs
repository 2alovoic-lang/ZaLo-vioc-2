import test from "node:test";
import assert from "node:assert/strict";
import { ConversationRuntime } from "./conversationRuntime.ts";
import { VoiceConversationBridge } from "./voiceConversationBridge.ts";

function transportWith(overrides = {}) {
  return {
    connect: async () => {},
    interrupt: async () => {},
    resume: async () => {},
    disconnect: async () => {},
    ...overrides,
  };
}

test("stopping a bridge revokes transcript and raw-audio approvals", async () => {
  const runtime = new ConversationRuntime({ conversationId: "privacy-stop" });
  const bridge = new VoiceConversationBridge(runtime);
  await bridge.start(transportWith());
  bridge.approveTranscriptSharing();
  bridge.approveRawAudioSharing();

  assert.equal(bridge.privacySnapshot().transcriptSharingApproved, true);
  assert.equal(bridge.privacySnapshot().rawAudioSharingApproved, true);

  await bridge.stop();
  const ended = bridge.privacySnapshot();
  assert.equal(ended.sessionActive, false);
  assert.equal(ended.mode, "local");
  assert.equal(ended.transcriptSharingApproved, false);
  assert.equal(ended.rawAudioSharingApproved, false);

  runtime.dispose();
});

test("a failed connection revokes consent and leaves the bridge local-only", async () => {
  const runtime = new ConversationRuntime({ conversationId: "privacy-connect-failure" });
  const bridge = new VoiceConversationBridge(runtime);
  const failure = new Error("simulated connection failure");

  await assert.rejects(
    bridge.start(transportWith({ connect: async () => { throw failure; } })),
    failure,
  );

  const snapshot = bridge.privacySnapshot();
  assert.equal(snapshot.sessionActive, false);
  assert.equal(snapshot.mode, "local");
  assert.equal(snapshot.transcriptSharingApproved, false);
  assert.equal(snapshot.rawAudioSharingApproved, false);
  assert.equal(bridge.sessionSnapshot().state, "error");

  runtime.dispose();
});
