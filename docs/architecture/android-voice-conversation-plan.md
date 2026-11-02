# Android voice conversation implementation plan

## Target interaction loop

1. User taps the central voice control once.
2. The app checks microphone permission, Android on-device recognition capability, and the installed Arabic model.
3. If the model is absent, recognition stays disabled until the user explicitly chooses to install it. No silent network fallback.
4. Once ready, one native microphone session produces partial and final Arabic transcripts.
5. Partial transcripts update the live UI only. Final transcripts enter the conversation runtime exactly once.
6. The assistant response is spoken using the device TTS for this local-only phase.
7. When TTS ends, the same session resumes listening; it must not create a second microphone owner.
8. User interruption stops TTS and resumes the existing session. Stop/cancel ends the native session and releases the microphone.
9. Session end revokes transcript and raw-audio sharing consent.

## Current implementation boundary

- `LocalAndroidSpeechTransport` is an adapter contract and lifecycle implementation over an injected native engine.
- It refuses web platforms, unsupported on-device recognition, missing Arabic models, and implicit cloud fallback.
- It filters late callbacks after session termination.
- It does not yet include a Capacitor plugin implementation or a concrete STT engine. Do not describe it as working speech recognition until one is integrated and tested on Android hardware.

## Required next engineering tasks

1. Add Capacitor Android shell and a native plugin with explicit microphone permission handling.
2. Evaluate and select a local STT engine/model for Modern Standard Arabic; measure size, latency, memory, battery, license, and offline behavior.
3. Implement the native plugin against `LocalSpeechEngine`.
4. Add a single conversation orchestrator that serializes finalized user turns, speaks assistant replies, and resumes listening after TTS completion.
5. Add UI states for permission, model missing/installing, ready, listening, thinking, speaking, interrupted, and error.
6. Verify airplane-mode recognition and network silence, then complete five consecutive real-device turns.

## Acceptance tests

- No microphone opens before permission and model readiness.
- A single session owns the microphone.
- Partial results are not added to conversation history.
- Each final transcript is added once.
- Stale native callbacks are ignored after stop.
- Assistant TTS completion resumes the same session.
- Interrupting assistant speech resumes listening without opening a second capture session.
- Stop, cancel, component teardown, and fatal native errors release microphone resources.
- Local-only mode emits no audio or transcript network requests.
