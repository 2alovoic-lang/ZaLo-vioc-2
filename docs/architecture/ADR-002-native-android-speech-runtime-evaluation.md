# ADR-002: Native Android speech runtime evaluation

- Status: Proposed; evaluation only
- Date: 2026-11-02
- Parent: ADR-001 Android native runtime decision
- Branch: `arch/zalovoice-native-speech-runtime-evaluation`

## Context

The web SpeechRecognition API cannot be treated as a privacy guarantee on Android. The application needs an Android-native microphone and on-device ASR implementation. The existing `LocalSpeechEngine` contract is intentionally provider-neutral and rejects web recognition and remote fallback.

Capacitor is the selected integration candidate for hosting the existing React/Vite UI while exposing native Android code. It is not an ASR engine.

## Evidence reviewed

1. sherpa-onnx documents Android builds and real-time recognition without Internet access; its documentation says recognition is processed locally on-device:
   - https://k2-fsa.github.io/sherpa/onnx/
   - https://k2-fsa.github.io/sherpa/onnx/android/index.html
2. sherpa-onnx documentation lists a Moonshine v2 Arabic quantized model and an Android real-time/streaming example:
   - https://k2-fsa.github.io/sherpa/onnx/
   - Model identifier shown in the documentation: `sherpa-onnx-moonshine-base-ar-quantized-2026-02-27`
3. Capacitor 8 environment requirements specify Node.js 22+, Android Studio 2025.2.1 minimum, and Android SDK Platform API 24+:
   - https://capacitorjs.com/docs/getting-started/environment-setup
4. Capacitor's Android runtime bridges JavaScript to native Java/Kotlin:
   - https://next.capacitorjs.com/docs/next/android

## Candidate direction

Evaluate sherpa-onnx first as the native ASR candidate because its published documentation explicitly covers Android, offline execution, streaming, and an Arabic Moonshine v2 model. This is a candidate, not a final selection and not evidence of Arabic Modern Standard speech accuracy.

Do not assume the Arabic model is optimized for Algerian Arabic or that its recognition quality is acceptable for ZaLoVoice. The first product language remains Modern Standard Arabic. A representative evaluation corpus must include clear MSA speech, different speakers, quiet/noisy environments, numbers, names, and common service requests.

## Required benchmark before adoption

Record on a real target Android device:

- Exact model files, model license, source URL, and SHA-256 checksums.
- Download size and installed size; APK/AAB size with and without native libraries.
- Peak RAM, CPU utilization, battery drain, cold-start time, and first-partial/final transcript latency.
- Word error rate and task success on a consented MSA test set.
- Streaming behavior, endpointing/VAD, interruption latency, and recovery after audio focus changes.
- Airplane-mode operation and network inspection proving microphone audio is not transmitted.
- ABI coverage (at minimum arm64-v8a; assess armeabi-v7a only if required by target devices).

No benchmark numbers may be filled with estimates presented as measurements.

## Privacy and lifecycle requirements

- Microphone capture and ASR remain local in this phase.
- No raw audio or transcript is uploaded.
- A cloud-text path may only be introduced later behind the existing per-session transcript consent gate.
- Transcript consent never authorizes raw audio transfer.
- Stop, fatal error, permission revocation, and app teardown must stop the native recorder and release audio resources.
- A new session starts in local-only mode.

## Capacitor integration gates

Before adding dependencies or generating the `android/` project:

1. Confirm the repository's actual Vite output directory and build scripts.
2. Confirm Capacitor 8 compatibility with the repository's Node and Vite versions.
3. Add Capacitor core/config and Android platform only on a dedicated branch after CI can validate web build and native project structure.
4. Build the Android project in a pinned GitHub Actions environment (JDK, Android SDK, Gradle) without secrets or paid services.
5. Keep generated native files and lockfile changes reviewable; do not commit machine-specific SDK paths.

## Acceptance criteria

- The native adapter implements the existing `LocalSpeechEngine` contract.
- It refuses to start unless the verified on-device Arabic model is installed and ready.
- No network fallback exists in the local provider.
- A native integration test proves start, streaming partial/final results, interrupt/resume, stop, and recorder release.
- Device acceptance: five consecutive voice turns, interruption while TTS is speaking, stop/restart, airplane-mode operation, and network inspection.
- No merge to `main` and no production deployment without explicit approval.

## Decision

Proceed with a documentation-first evaluation of sherpa-onnx + the documented Arabic Moonshine v2 model. Do not add the native dependency or claim a working Android speech engine until licensing, model artifacts, benchmark data, and a native build have been verified.
