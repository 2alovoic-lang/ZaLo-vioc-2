# ZaLoVoice dual voice-engine foundation (MSA phase)

## Scope

This foundation keeps the first release focused on Modern Standard Arabic (MSA). It defines two mutually exclusive audio paths behind one conversation experience:

1. **Browser/device engine (available first):** browser speech recognition captures Arabic text; the shared assistant endpoint generates a reply; device speech synthesis reads it aloud.
2. **Realtime speech engine (planned adapter):** a future speech-to-speech provider streams audio and responses through a server-authorized session. It must not be enabled until provider choice, authentication, usage limits, privacy behavior, and device testing are agreed.

The engines must never own the microphone simultaneously. A single conversation controller selects one active engine and owns the shared transcript, conversation history, cancellation, and UI state.

## Current defect addressed

The browser recognition session can emit `onend` before the assistant finishes speaking. The previous implementation only requested a restart from the speech `onEnd` callback and only restarted from recognition `onend`. If those events arrived in the opposite order, the restart request was missed and the conversation stopped after one turn.

The home view now records both conditions (recognition ended and assistant speech ended) and schedules a single restart only after both have occurred. This is a race-condition mitigation, not proof of continuous operation on every Android browser.

## Conversation state contract

- `idle`: no active microphone session.
- `listening`: the selected engine owns microphone capture.
- `processing`: transcript is being sent to the assistant.
- `speaking`: assistant audio is playing; microphone capture is paused.
- `error`: recoverable or permission error is shown to the user.

Only one engine may transition into `listening` at a time. Cancellation must stop recognition, speech playback, pending restart timers, and any realtime session.

## Realtime adapter requirements (not yet implemented)

- Use short-lived, server-authorized session credentials; never expose a permanent provider API key in browser code.
- Keep provider secrets server-side.
- Do not create a paid provider resource or activate a paid API without explicit user approval.
- Preserve MSA as the only supported conversation language in this phase.
- Preserve transcript visibility and provide a text fallback.
- Handle interruption, silence/end-of-turn detection, network loss, reconnect, and explicit user stop.
- Do not upload or retain recordings by default.
- Report whether a reply came from the realtime model or a local fallback; never label fallback as live AI.

## Acceptance tests on Android

1. Say “السلام عليكم”; verify the recognized Arabic text is displayed.
2. Verify the assistant replies in MSA and its response text is visible.
3. After speech playback ends, verify the microphone automatically starts again.
4. Say “أنا بخير” without touching the microphone; verify a contextual response.
5. Repeat for at least five turns, including a pause and a longer sentence.
6. Tap stop during listening and during playback; verify both stop reliably.
7. Repeat with network unavailable; verify a clear error/fallback rather than a false claim of live AI.

The realtime engine remains a separate follow-up implementation and must pass the same acceptance tests before it can be selected by users.
