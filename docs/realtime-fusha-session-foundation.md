# Realtime Fusha conversation foundation

## Verified repository baseline

- The home view currently uses browser `SpeechRecognition` with `continuous = false`, then posts each finalized utterance to `/api/assistant` and speaks the returned text using device speech synthesis.
- The request body contains the current message and a small context object, not the ordered conversation transcript. The server handler calls Gemini text generation for each request and falls back to local NLP.
- `@google/genai` is installed, but the inspected files do not establish that a realtime audio session endpoint, ephemeral session credential flow, or WebRTC transport exists.
- The repository has no confirmed provider approval, billing approval, or realtime API credential in this task. Do not infer that a key is configured.

## Scope of this foundation

The new `src/voice/voiceEngine.ts` defines a provider-neutral contract and shared conversation event types. It deliberately does not open a microphone, contact a provider, mint credentials, or activate billing.

The only supported language in this phase is Arabic (`ar`, Modern Standard Arabic in prompts and UX).

## Required production architecture (not yet implemented)

1. The browser asks the application's server to create a short-lived realtime session.
2. The server authenticates the user, validates origin/session limits, and uses a server-only provider secret to mint a narrowly scoped, short-lived client credential.
3. The browser establishes the provider's supported realtime transport (prefer WebRTC where supported) using only that short-lived credential. A permanent provider key must never reach browser code.
4. One conversation controller owns the active engine, transcript, turn history, state, interruption, reconnect, and explicit stop.
5. Starting realtime must stop and detach browser SpeechRecognition first. The fallback engine must never capture the microphone concurrently.
6. User and assistant transcripts are appended to the same conversation in order. Context is retained for follow-up turns; persistence policy must be explicitly defined before storing conversation content.
7. Interruption cancels assistant playback/generation while keeping the session alive and returning microphone ownership to the active realtime engine.
8. Stop closes tracks, peer connection/data channel, timers, and provider session; it clears active microphone ownership.

## Server endpoint contract (design only)

A future authenticated `POST /api/voice/session` should:
- reject unsupported methods and unauthenticated/invalid requests;
- accept only the configured language `ar` for this phase;
- apply rate and concurrent-session limits;
- mint a short-lived, scoped session credential server-side;
- return only the minimum client connection details and expiry;
- never return or log the permanent provider secret;
- fail closed with a clear unavailable response when no approved provider credential is configured.

No endpoint is added until the realtime provider, credential format, authentication model, and cost/retention terms are selected and approved.

## Acceptance criteria on Android

Do not call this feature complete until all are verified on the user's Android device:

1. One tap starts one session; the microphone remains active across turns without another tap.
2. Arabic transcript appears for every user turn.
3. Assistant responds in clear Modern Standard Arabic and response text is visible.
4. Follow-up turns retain conversation context.
5. User can interrupt assistant speech and continue speaking.
6. Stop works during listening, processing, and playback, and releases microphone resources.
7. No simultaneous browser recognition and realtime microphone capture.
8. Network/provider errors are explicit; local fallback is never represented as live realtime AI.
9. Complete at least five consecutive turns, including a pause and a longer utterance.

## Safety and release boundary

- No paid provider is connected or enabled by this foundation.
- No API key or secret is added to source control.
- No audio is uploaded or retained by this contract.
- Changes remain on a feature branch and Draft PR; do not merge or deploy production without separate approval.
