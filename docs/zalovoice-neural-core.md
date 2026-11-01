# ZaLoVoice Neural Core — Foundation

## Goal
Build a long-lived conversation runtime that is independent of React route/component lifecycles. UI components render state; they do not own the conversation or microphone session.

## Current scope
This first foundation is provider-neutral and deliberately does not connect a microphone, model provider, database, external tools, or production deployment. It establishes typed contracts, bounded session memory, and an explicit tool allowlist.

## Target architecture
- **ConversationRuntime:** owns one conversation lifecycle and emits snapshots.
- **VoiceTransport:** one replaceable audio transport; only one transport may own microphone capture.
- **TurnManager:** coordinates user turns, assistant output, interruption, cancellation, and turn completion.
- **MemoryStore:** starts with bounded session memory; durable memory requires a separate privacy and retention design.
- **ToolRegistry / TaskExecutor:** only explicitly registered tools may execute.
- **Evidence & Verification:** tool results must carry evidence; the assistant must distinguish verified outcomes from suggestions or unavailable data.
- **Evaluation & Improvement:** record test outcomes and create reviewable improvement proposals.

## Self-improvement policy
The core may analyze failures, draft code changes on isolated branches, run tests, and prepare pull requests. It must not write to the production branch, deploy, alter secrets, change billing, or perform irreversible external actions without explicit authorization. Risky proposals require human review. Every autonomous change must be auditable and revertible.

## Voice acceptance criteria
On a real Android device, complete five consecutive rounds in one session:
1. Start once.
2. Speak a request.
3. Receive a spoken response.
4. Continue speaking without pressing start again.
5. Interrupt assistant speech successfully.
6. Stop once and confirm microphone release.

A browser SpeechRecognition loop is not considered equivalent to a realtime speech-to-speech transport. No claim of success until device testing passes.

## Non-goals for this foundation
No fabricated product listings, no simulated external actions, no API keys in client code, no billing activation, and no production integration.
