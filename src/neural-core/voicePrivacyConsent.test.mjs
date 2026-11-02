import test from "node:test";
import assert from "node:assert/strict";
import { VoicePrivacyConsent } from "./voicePrivacyConsent.ts";

test("new sessions default to local processing and require transcript consent", () => {
  const consent = new VoicePrivacyConsent();
  const snapshot = consent.beginSession();
  assert.equal(snapshot.sessionActive, true);
  assert.equal(snapshot.mode, "local");
  assert.equal(consent.canSendTranscript(), false);
  assert.equal(consent.canSendRawAudio(), false);
});

test("transcript consent never authorizes raw audio", () => {
  const consent = new VoicePrivacyConsent();
  consent.beginSession();
  consent.approveTranscriptSharing();
  assert.equal(consent.canSendTranscript(), true);
  assert.equal(consent.canSendRawAudio(), false);
  assert.equal(consent.mode(), "cloud-text");
});

test("raw audio requires its own explicit approval", () => {
  const consent = new VoicePrivacyConsent();
  consent.beginSession();
  consent.approveRawAudioSharing();
  assert.equal(consent.canSendRawAudio(), true);
  assert.equal(consent.canSendTranscript(), false);
  assert.equal(consent.mode(), "cloud-audio");
});

test("ending a session revokes every approval and next session resets to local", () => {
  const consent = new VoicePrivacyConsent();
  consent.beginSession();
  consent.approveTranscriptSharing();
  consent.approveRawAudioSharing();
  const ended = consent.endSession();
  assert.equal(ended.sessionActive, false);
  assert.equal(ended.mode, "local");
  assert.equal(ended.transcriptSharingApproved, false);
  assert.equal(ended.rawAudioSharingApproved, false);
  const next = consent.beginSession();
  assert.equal(next.mode, "local");
  assert.equal(consent.canSendTranscript(), false);
  assert.equal(consent.canSendRawAudio(), false);
});

test("consent cannot be granted outside an active session", () => {
  const consent = new VoicePrivacyConsent();
  assert.throws(() => consent.approveTranscriptSharing());
  assert.throws(() => consent.approveRawAudioSharing());
});
