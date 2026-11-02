# ADR-001: Native Android runtime while preserving the web application

- Status: Accepted for a staged prototype; not yet implemented or validated on a device
- Date: 2026-11-02
- Decision owner: ZaLoVoice project
- Scope: Android packaging and a future on-device speech-recognition boundary

## Context

ZaLoVoice is an existing React + Vite web application. Its current voice UI uses the browser Web Speech API (`SpeechRecognition`) and browser speech synthesis. Browser speech recognition does not provide a reliable guarantee that audio stays on-device on Android. The project has an explicit local-first privacy requirement: raw audio must not leave the device unless the user gives a separate, explicit raw-audio consent.

The existing privacy/session bridge is useful orchestration, but it is not itself a microphone implementation, an on-device speech model, or proof of local processing.

## Decision

Adopt a staged Android wrapper approach using **Capacitor as the initial integration candidate**, while retaining the React/Vite web application as the shared UI.

The Android runtime will expose a narrow native speech-recognition adapter to the web UI. The adapter must:
- capture microphone audio only while an explicit voice session is active;
- run recognition with an on-device model and return transcript text to the web layer;
- never upload raw audio or transcripts by default;
- expose capability and model-readiness states (unsupported, model missing, downloading/installing, ready, listening, error);
- stop capture and release microphone resources immediately when the session ends or is interrupted;
- provide explicit model installation and storage diagnostics before enabling recognition.

Capacitor is a packaging and native-plugin bridge choice, **not** the speech-recognition engine. The STT engine remains a separate decision after an evidence-based comparison of Android-compatible candidates (including sherpa-onnx, Vosk, and whisper.cpp).

## Privacy and consent invariants

1. Local on-device recognition is the default and only enabled speech mode in this phase.
2. No raw audio network transport is implemented.
3. A future cloud-text path must check the session-scoped transcript-consent gate immediately before transmission.
4. A future cloud-audio path must require the distinct raw-audio consent gate; transcript consent is insufficient.
5. Ending, cancelling, or failing a session revokes all session consents and releases the microphone.
6. No API keys, paid services, billing setup, or production credentials are introduced by this ADR.

## Staged implementation

### Stage A — architecture and feasibility (this change)
- Record the decision and non-goals.
- Define the native adapter contract before choosing an STT model.
- Keep all changes on a feature branch and Draft PR.

### Stage B — Android shell and adapter spike
- Add Capacitor only after confirming current compatibility with the repository's Vite build and Android toolchain.
- Create an Android project shell and a typed adapter interface.
- Do not yet claim local speech recognition until a native engine is integrated.

### Stage C — engine selection and integration
Compare candidate engines using:
- Arabic Modern Standard Arabic recognition quality and model availability;
- offline operation and verifiable absence of network calls;
- APK/AAB and model storage footprint;
- latency, memory, CPU/battery use on representative low/mid-range Android devices;
- licensing and redistribution requirements;
- streaming/partial-result support and interruption behavior.

Select an engine only after a documented test on real Android hardware. Model downloads, if required, must be clearly disclosed and user initiated.

### Stage D — device acceptance
Run at least five consecutive spoken turns in one session on a real Android device, including:
- continuous listening across turns;
- assistant speech followed by automatic return to listening;
- interruption while assistant audio is playing;
- stop/cancel and immediate microphone release;
- airplane-mode recognition after model installation;
- network inspection confirming no audio or transcript egress in local-only mode.

## Native adapter contract (target API)

The eventual adapter should provide operations equivalent to:
- `getCapabilities()`
- `getModelStatus()`
- `prepareModel()` (explicit user action when a download is needed)
- `startListening(sessionId, locale)`
- `stopListening(sessionId)`
- transcript/partial-result/error events tagged with the active session ID

The web layer must reject stale events from ended sessions. The native layer must independently enforce session state and release audio resources; UI state alone is not a privacy boundary.

## Consequences

- The web UI remains reusable on desktop and mobile browsers.
- Android gains a path to real on-device audio capture and inference.
- A native build toolchain and Android device testing become necessary.
- The wrapper alone does not solve STT privacy or quality; those depend on the selected native engine and verified runtime behavior.

## Non-goals

- No migration of the UI to a fully native framework.
- No cloud speech provider or raw-audio upload.
- No Gemini/API key wiring, billing, Supabase changes, production deployment, or main-branch changes.
- No claim that the current browser SpeechRecognition implementation is local-only.
