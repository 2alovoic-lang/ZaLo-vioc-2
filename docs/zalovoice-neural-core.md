# ZaLoVoice Neural Core — Foundation

## Goal
Build a long-lived conversation runtime independent of React route/component lifecycles. UI components render state; they do not own the conversation or microphone session.

## Implemented in this branch
- Provider-neutral contracts for phases, messages, evidence, tools, and improvement proposals.
- Bounded in-memory conversation store (80 most recent messages).
- Explicit allowlisted tool registry; no tools are registered by default.
- Lifecycle-independent conversation runtime with subscriptions, cancellation, interruption, phase events, and tool-result evidence references.
- App-process runtime registry so navigation/view unmounts do not dispose the conversation.
- Provider-neutral `VoiceSessionController`: owns one injected transport, rejects concurrent starts, guards stale callbacks by session generation, supports interruption and explicit stop/disconnect, and exposes subscription snapshots.
- Session-scoped `VoicePrivacyConsent` gate: local processing is the default; transcript sharing requires one explicit approval per session; raw-audio sharing has a separate approval; ending a session revokes both approvals.
- Voice transport contract requiring provider adapters to implement connect, interrupt, and disconnect without importing a provider SDK into the core.

## Privacy and routing policy
- Microphone audio is processed locally by default and is not sent to a remote provider by this consent layer.
- The user may approve transcript sharing once at the beginning of a session; that approval applies only until the session ends.
- Raw-audio sharing is a separate future capability and must never be inferred from transcript-sharing approval.
- Starting a new session resets all approvals. Ending a session revokes them.
- Any future cloud adapter must check the consent gate immediately before transmission. This foundation does not itself transmit data or implement a cloud provider.
- The UI must explain the recipient and purpose before asking for approval. Refusal must leave local-only behavior available where supported.

## Target architecture
- **ConversationRuntime:** owns one conversation lifecycle and emits snapshots.
- **VoiceTransport:** one replaceable audio transport; only one transport may own microphone capture. `VoiceSessionController` enforces single-session ownership at the core boundary.
- **VoicePrivacyConsent:** session-scoped authorization boundary for transcript and raw-audio sharing.
- **TurnManager:** coordinates user turns, assistant output, interruption, cancellation, and turn completion.
- **MemoryStore:** starts with bounded session memory; durable memory requires a separate privacy and retention design.
- **ToolRegistry / TaskExecutor:** only explicitly registered tools may execute.
- **Evidence & Verification:** tool results must carry evidence; distinguish verified outcomes from suggestions or unavailable data.
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

A browser SpeechRecognition loop is not equivalent to a realtime speech-to-speech transport. No claim of success until device testing passes.

## Not implemented yet
No concrete live microphone/audio transport, model streaming adapter, server-issued ephemeral credentials, durable memory, production tool integrations, or automatic deployment. The controller and privacy gate are boundaries only; they do not themselves capture audio or connect to a model. This PR is a foundation, not yet a replacement for the current voice UI.

## Non-goals
No fabricated product listings, simulated external actions, API keys in client code, billing activation, or production integration.
